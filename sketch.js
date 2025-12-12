(() => {
  if (!window.p5) {
    console.warn("p5.js が読み込めなかったため、アニメーションをスキップします。");
    return;
  }

  const containerId = "p5-container";
  const container = document.getElementById(containerId);
  if (!container) return;

  new window.p5((p) => {
    const baseHeight = 260;
    const ball = {
      radius: 22,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      noiseT: { x: 1000, y: 2000 },
      hasBounced: false,
    };

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function containerSize() {
      const width = Math.max(240, Math.floor(container.clientWidth || 0));
      return { width, height: baseHeight };
    }

    function speedLimit(vx, vy, maxSpeed) {
      const speed = Math.hypot(vx, vy);
      if (speed <= maxSpeed || speed === 0) return { vx, vy };
      const s = maxSpeed / speed;
      return { vx: vx * s, vy: vy * s };
    }

    p.setup = () => {
      p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      const { width, height } = containerSize();
      const canvas = p.createCanvas(width, height);
      canvas.parent(containerId);

      ball.position.x = width * 0.33;
      ball.position.y = height * 0.45;
      ball.velocity.x = 0.9;
      ball.velocity.y = -0.6;

      p.noStroke();
    };

    p.draw = () => {
      const width = p.width;
      const height = p.height;

      p.clear();

      const drift = 0.18;
      const ax = (p.noise(ball.noiseT.x) - 0.5) * drift;
      const ay = (p.noise(ball.noiseT.y) - 0.5) * drift;
      ball.noiseT.x += 0.008;
      ball.noiseT.y += 0.008;

      ball.velocity.x += ax;
      ball.velocity.y += ay;

      ball.velocity.x *= 0.992;
      ball.velocity.y *= 0.992;

      const limited = speedLimit(ball.velocity.x, ball.velocity.y, 3.2);
      ball.velocity.x = limited.vx;
      ball.velocity.y = limited.vy;

      ball.position.x += ball.velocity.x;
      ball.position.y += ball.velocity.y;

      const r = ball.radius;
      const bounce = 0.98;

      if (ball.position.x - r < 0) {
        ball.position.x = r;
        ball.velocity.x = Math.abs(ball.velocity.x) * bounce;
        ball.hasBounced = true;
      } else if (ball.position.x + r > width) {
        ball.position.x = width - r;
        ball.velocity.x = -Math.abs(ball.velocity.x) * bounce;
        ball.hasBounced = true;
      }

      if (ball.position.y - r < 0) {
        ball.position.y = r;
        ball.velocity.y = Math.abs(ball.velocity.y) * bounce;
        ball.hasBounced = true;
      } else if (ball.position.y + r > height) {
        ball.position.y = height - r;
        ball.velocity.y = -Math.abs(ball.velocity.y) * bounce;
        ball.hasBounced = true;
      }

      const context = p.drawingContext;
      const x = ball.position.x;
      const y = ball.position.y;

      const shadowY = clamp(y + r * 0.85, r, height - 6);
      p.fill(0, 0, 0, 18);
      p.ellipse(x + 8, shadowY, r * 1.55, r * 0.55);

      const gradient = context.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.2, x, y, r);
      gradient.addColorStop(0, "rgba(254, 244, 170, 0.98)");
      gradient.addColorStop(0.55, "rgba(240, 220, 90, 0.98)");
      gradient.addColorStop(1, "rgba(189, 165, 55, 0.98)");
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2);
      context.fill();

      context.strokeStyle = "rgba(255,255,255,0.65)";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(x - r * 0.12, y + r * 0.05, r * 0.92, Math.PI * 0.18, Math.PI * 0.92);
      context.stroke();

      if (!ball.hasBounced) {
        p.fill(11, 61, 46, 115);
        p.textAlign(p.LEFT, p.TOP);
        p.textSize(12);
        p.text("壁に当たると反射します", 12, 12);
      }
    };

    p.windowResized = () => {
      const { width, height } = containerSize();
      const prevW = p.width || width;
      const prevH = p.height || height;
      p.resizeCanvas(width, height);
      ball.position.x = (ball.position.x / prevW) * width;
      ball.position.y = (ball.position.y / prevH) * height;
    };
  }, container);
})();
