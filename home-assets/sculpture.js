import * as THREE from "./vendor/three.module.min.js";
const host = document.querySelector("#sculpture");
const remix = document.querySelector("#remix");
let renderer;
try {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
} catch {
  document.querySelector(".hero-note").textContent = "a little happy accident";
  remix.hidden = true;
}
if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 8.5);
  scene.add(new THREE.HemisphereLight(0xe6f0ff, 0x18276d, 3));
  const key = new THREE.DirectionalLight(0xffffff, 5);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xaabfff, 4);
  rim.position.set(4, -1, 2);
  scene.add(rim);
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  sculpture.rotation.set(0.4, -0.3, -0.35);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x254cff,
    metalness: 0.4,
    roughness: 0.21,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
  });
  let mesh;
  const shapes = [
    () => new THREE.TorusKnotGeometry(1.34, 0.44, 180, 28, 2, 3),
    () => new THREE.TorusKnotGeometry(1.28, 0.31, 220, 24, 3, 4),
    () => new THREE.TorusGeometry(1.35, 0.64, 40, 100),
  ];
  let index = 0;
  function setShape() {
    if (mesh) {
      sculpture.remove(mesh);
      mesh.geometry.dispose();
    }
    mesh = new THREE.Mesh(shapes[index](), material);
    sculpture.add(mesh);
  }
  setShape();
  const satellite = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.18, 1),
    new THREE.MeshStandardMaterial({ color: 0xe8ff91, roughness: 0.4 }),
  );
  satellite.position.set(2.15, 1.4, 0.5);
  scene.add(satellite);
  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, 0.009, 6, 120),
    new THREE.MeshBasicMaterial({
      color: 0x7d88c1,
      transparent: true,
      opacity: 0.45,
    }),
  );
  orbit.rotation.set(1.2, 0.3, -0.4);
  scene.add(orbit);
  host.append(renderer.domElement);
  host.classList.add("ready");
  remix.disabled = false;
  renderer.domElement.setAttribute("aria-hidden", "true");
  let paused = document.body.classList.contains("paused"),
    visible = true,
    dragging = false,
    lastX = 0,
    targetX = 0,
    targetY = 0,
    rotation = 0.0,
    lastTime = 0;
  const draw = () => renderer.render(scene, camera);
  function updateLoop() {
    renderer.setAnimationLoop(
      !paused && visible && !document.hidden ? frame : null,
    );
    draw();
  }
  function frame(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.04);
    lastTime = time;
    if (!dragging) rotation += dt * 0.14;
    sculpture.rotation.y += (rotation + targetX - sculpture.rotation.y) * 0.045;
    sculpture.rotation.x += (0.4 + targetY - sculpture.rotation.x) * 0.045;
    sculpture.position.y = Math.sin(time * 0.00065) * 0.1;
    satellite.position.y = 1.4 + Math.sin(time * 0.0009) * 0.17;
    satellite.rotation.y += dt * 0.3;
    draw();
  }
  new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    camera.aspect = width / height;
    camera.position.z = 8.5 * Math.max(1, 0.98 / camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    draw();
  }).observe(host);
  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      updateLoop();
    },
    { rootMargin: "80px" },
  ).observe(host);
  window.addEventListener("motionchange", (event) => {
    paused = event.detail;
    updateLoop();
  });
  document.addEventListener("visibilitychange", updateLoop);
  host.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || !event.isPrimary) return;
    dragging = true;
    lastX = event.clientX;
    host.setPointerCapture(event.pointerId);
  });
  host.addEventListener("pointermove", (event) => {
    if (paused) return;
    if (dragging) {
      rotation += (event.clientX - lastX) * 0.012;
      lastX = event.clientX;
    } else if (event.pointerType === "mouse") {
      const box = host.getBoundingClientRect();
      targetX = ((event.clientX - box.left) / box.width - 0.5) * 0.5;
      targetY = ((event.clientY - box.top) / box.height - 0.5) * 0.35;
    }
  });
  const end = () => {
    dragging = false;
    targetX = 0;
    targetY = 0;
  };
  host.addEventListener("pointerup", end);
  host.addEventListener("pointercancel", end);
  host.addEventListener("lostpointercapture", end);
  host.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });
  remix.addEventListener("click", () => {
    index = (index + 1) % shapes.length;
    if (window.gsap && !paused) {
      remix.disabled = true;
      window.gsap.to(sculpture.scale, {
        x: 0.1,
        y: 0.1,
        z: 0.1,
        duration: 0.22,
        ease: "power2.in",
        onComplete: () => {
          setShape();
          window.gsap.to(sculpture.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.65,
            ease: "back.out(1.5)",
            onComplete: () => (remix.disabled = false),
          });
        },
      });
    } else {
      setShape();
      sculpture.scale.setScalar(1);
      draw();
    }
  });
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    host.classList.remove("ready");
    remix.disabled = true;
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    host.classList.add("ready");
    remix.disabled = false;
    updateLoop();
  });
  updateLoop();
}
