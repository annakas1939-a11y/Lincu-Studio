(() => {
  const canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width, height;

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    width = canvas.clientWidth || canvas.width;
    height = canvas.clientHeight || canvas.height;
    // adapt node count for smaller screens to improve performance
    if (width < 500) {
      // phones
      config.count = 10;
    } else if (width < 900) {
      // small tablets / narrow screens
      config.count = 22;
    } else {
      // desktop
      config.count = 40;
    }
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  let config = {
    count: 40,
    speed: 0.3,
    maxDist: 140,
    nodeSize: 3,
    lineAlpha: 0.14,
    bgAlpha: 0.06
  };

  const nodes = [];

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < config.count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        r: config.nodeSize * (0.8 + Math.random() * 0.8)
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, width, height);

    // subtle translucent background to create trailing effect
    ctx.fillStyle = `rgba(5,5,10,${config.bgAlpha})`;
    ctx.fillRect(0, 0, width, height);

    // draw connections
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < config.maxDist) {
          const alpha = (1 - dist / config.maxDist) * config.lineAlpha;
          ctx.strokeStyle = `rgba(0,174,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      // bounce
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;

      // small random drift
      n.vx += (Math.random() - 0.5) * 0.02;
      n.vy += (Math.random() - 0.5) * 0.02;

      // clamp speed
      const maxV = config.speed * 1.5;
      n.vx = Math.max(-maxV, Math.min(maxV, n.vx));
      n.vy = Math.max(-maxV, Math.min(maxV, n.vy));

      // glow
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
      g.addColorStop(0, 'rgba(0,174,255,0.9)');
      g.addColorStop(0.15, 'rgba(0,174,255,0.35)');
      g.addColorStop(1, 'rgba(0,174,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2);
      ctx.fill();

      // core
      ctx.fillStyle = 'rgba(0,174,255,1)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // subtle center light (animated pulse)
    const t = Date.now() * 0.001;
    const centerAlpha = 0.06 + Math.abs(Math.sin(t * 0.8)) * 0.06;
    const cx = width / 2;
    const cy = height / 2;
    const rad = Math.min(width, height) * 0.35;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    cg.addColorStop(0, `rgba(0,174,255,${centerAlpha})`);
    cg.addColorStop(0.6, 'rgba(0,174,255,0.02)');
    cg.addColorStop(1, 'rgba(0,174,255,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, width, height);

    requestAnimationFrame(step);
  }

  function onResize() {
    resize();
    initNodes();
  }

  window.addEventListener('resize', onResize);
  // initialize after DOM ready
  function start() {
    resize();
    initNodes();
    requestAnimationFrame(step);
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
