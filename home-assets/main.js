(() => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  let paused = media.matches;
  const toggle = document.querySelector(".motion-toggle");
  function syncMotion() {
    document.body.classList.toggle("paused", paused);
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute(
      "aria-label",
      paused ? "Resume animations" : "Pause animations",
    );
    toggle.textContent = paused ? "▷" : "Ⅱ";
    window.dispatchEvent(new CustomEvent("motionchange", { detail: paused }));
  }
  toggle.addEventListener("click", () => {
    paused = !paused;
    syncMotion();
  });
  media.addEventListener("change", () => {
    paused = media.matches;
    syncMotion();
  });
  syncMotion();
  const gsap = window.gsap;
  if (gsap && !paused) {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".hero-meta", { opacity: 0, y: 8, duration: 0.6 })
      .from(
        ".hero-copy h1 > span",
        { y: 45, opacity: 0, stagger: 0.14, duration: 1 },
        0.15,
      )
      .from(
        ".hero-copy p, .round-link",
        { y: 18, opacity: 0, stagger: 0.1, duration: 0.7 },
        0.65,
      )
      .from(".hero-note, .hero-star, .remix", { opacity: 0, duration: 0.8 }, 1);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!paused)
              gsap.from(entry.target, {
                y: 34,
                opacity: 0.1,
                duration: 0.8,
                clearProps: "all",
              });
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        ".section-heading, .project, .about-copy, .playground-heading",
      )
      .forEach((el) => observer.observe(el));
  }
  // Pausing finishes entrance reveals so content never remains partially hidden.
  window.addEventListener("motionchange", (event) => {
    if (event.detail && gsap)
      gsap.globalTimeline.getChildren().forEach((tween) => tween.progress(1));
  });
  const dialog = document.querySelector("#project-dialog");
  const previews = {
    aether: [
      "Aether",
      "An infinite canvas for notes, fragments, and the connections between them. A place to spread an idea out, move things around, and see what clicks.",
    ],
    audio: [
      "Audio Reverser",
      "A small Mac experiment in listening differently. Take a sound, turn it around, and discover the unexpected textures hiding in the familiar.",
    ],
  };
  document.querySelectorAll("[data-project]").forEach((button) =>
    button.addEventListener("click", () => {
      const [title, copy] = previews[button.dataset.project];
      document.querySelector("#dialog-title").textContent = title;
      document.querySelector("#dialog-copy").textContent = copy;
      dialog.showModal();
    }),
  );
  dialog
    .querySelectorAll("button")
    .forEach((button) =>
      button.addEventListener("click", () => dialog.close()),
    );
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const box = dialog.getBoundingClientRect();
      if (
        event.clientX < box.left ||
        event.clientX > box.right ||
        event.clientY < box.top ||
        event.clientY > box.bottom
      )
        dialog.close();
    }
  });
  const wave = document.querySelector(".wave");
  for (let i = 0; i < 37; i++) {
    const bar = document.createElement("i");
    bar.style.height = `${20 + Math.sin(i * 1.7) ** 2 * 110 + Math.sin((i / 36) * Math.PI) * 60}px`;
    bar.style.transitionDelay = `${i * 8}ms`;
    wave.append(bar);
  }
  // The sketchpad records normalized paths so resizing preserves the drawing.
  const canvas = document.querySelector("#drawing");
  const ctx = canvas.getContext("2d");
  const hint = document.querySelector("#drawing-hint");
  const status = document.querySelector("#drawing-status");
  let ink = "#254cff",
    paths = [],
    current = null,
    pointerId = null;
  function redraw() {
    const box = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, box.width, box.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    paths.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.fillStyle = path.color;
      ctx.beginPath();
      path.points.forEach(([x, y], i) =>
        i
          ? ctx.lineTo(x * box.width, y * box.height)
          : ctx.moveTo(x * box.width, y * box.height),
      );
      ctx.stroke();
      if (path.points.length === 1) {
        const [x, y] = path.points[0];
        ctx.beginPath();
        ctx.arc(x * box.width, y * box.height, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    hint.hidden = paths.length > 0;
  }
  new ResizeObserver(() => {
    const box = canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(box.width * dpr);
    canvas.height = Math.round(box.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }).observe(canvas);
  function point(event) {
    const box = canvas.getBoundingClientRect();
    return [
      (event.clientX - box.left) / box.width,
      (event.clientY - box.top) / box.height,
    ];
  }
  canvas.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    current = { color: ink, points: [point(event)] };
    paths.push(current);
    redraw();
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!current || event.pointerId !== pointerId) return;
    current.points.push(point(event));
    redraw();
  });
  function finish() {
    current = null;
    pointerId = null;
  }
  canvas.addEventListener("pointerup", finish);
  canvas.addEventListener("pointercancel", finish);
  canvas.addEventListener("lostpointercapture", finish);
  document.querySelectorAll(".swatch").forEach((button) =>
    button.addEventListener("click", () => {
      ink = button.dataset.color;
      document.querySelectorAll(".swatch").forEach((el) => {
        el.classList.toggle("active", el === button);
        el.setAttribute("aria-pressed", String(el === button));
      });
    }),
  );
  document.querySelector("#clear-drawing").addEventListener("click", () => {
    paths = [];
    finish();
    redraw();
    status.textContent = "Drawing cleared.";
  });
  document.querySelector("#add-doodle").addEventListener("click", () => {
    const x = 0.2 + Math.random() * 0.6,
      y = 0.2 + Math.random() * 0.35,
      points = [];
    const box = canvas.getBoundingClientRect(),
      aspect = box.width / box.height;
    for (let i = 0; i <= 16; i++) {
      const angle = (i * Math.PI) / 8,
        r = i % 2 ? 0.026 : 0.075;
      points.push([x + Math.cos(angle) * r, y + Math.sin(angle) * r * aspect]);
    }
    paths.push({ color: ink, points });
    redraw();
    status.textContent = "A star doodle added.";
  });
  document.querySelector("#save-drawing").addEventListener("click", () => {
    const output = document.createElement("canvas");
    output.width = canvas.width;
    output.height = canvas.height;
    const out = output.getContext("2d");
    out.fillStyle = "#f6f5ef";
    out.fillRect(0, 0, output.width, output.height);
    out.drawImage(canvas, 0, 0);
    output.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "a-little-something.png";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = "Your drawing has been saved as a PNG.";
    });
  });
  import("/home-assets/sculpture.js").catch(() => {
    document.querySelector("#remix").hidden = true;
    document.querySelector(".hero-note").textContent =
      "a little happy accident";
  });
})();
