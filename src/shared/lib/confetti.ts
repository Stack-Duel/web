import confetti from "canvas-confetti";

export function fireHighScoreConfetti() {
  const colors = ["#f59e0b", "#22c55e", "#3b82f6", "#ec4899"];

  confetti({
    particleCount: 120,
    spread: 90,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors,
  });

  confetti({
    particleCount: 60,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.7 },
    colors,
  });

  confetti({
    particleCount: 60,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.7 },
    colors,
  });
}
