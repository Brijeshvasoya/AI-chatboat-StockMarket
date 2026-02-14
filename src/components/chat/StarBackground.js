import { useEffect, useRef } from "react";

export default function StarBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const stars = [];
    const shootingStars = [];

    const STAR_COUNT = 150;

    // Create stars
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }

    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.5,
        length: Math.random() * 80 + 100,
        speed: Math.random() * 10 + 8,
        angle: Math.PI / 4,
        opacity: 1,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Stars
      stars.forEach((star) => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity >= 1 || star.opacity <= 0) {
          star.twinkleSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.opacity})`;
        ctx.fill();
      });

      // Shooting stars
      shootingStars.forEach((s, index) => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(
          s.x - Math.cos(s.angle) * s.length,
          s.y - Math.sin(s.angle) * s.length,
        );
        ctx.strokeStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.02;

        if (s.opacity <= 0) shootingStars.splice(index, 1);
      });

      requestAnimationFrame(animate);
    };

    animate();

    const shootingInterval = setInterval(createShootingStar, 3000);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(shootingInterval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-black pointer-events-none"
    />
  );
}
