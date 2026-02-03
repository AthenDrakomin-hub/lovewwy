
import React, { useEffect, useState } from 'react';

const FloatingHearts: React.FC = () => {
  const [hearts, setHearts] = useState<{ id: number; left: number; size: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * (30 - 10) + 10,
      duration: Math.random() * (15 - 5) + 5,
      delay: Math.random() * 5
    }));
    setHearts(newHearts);
  }, []);

  // Apply dynamic styles on client to avoid inline styles in server HTML
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nodes = Array.from(document.querySelectorAll('.heart-particle')) as HTMLElement[];
    nodes.forEach((node, idx) => {
      const h = hearts[idx];
      if (!h) return;
      node.style.left = `${h.left}%`;
      node.style.fontSize = `${h.size}px`;
      node.style.animationDuration = `${h.duration}s`;
      node.style.animationDelay = `${h.delay}s`;
    });
  }, [hearts]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="heart-particle text-rose-300 opacity-20"
          // no inline styles — applied in useEffect on client
        >
          ❤️
        </div>
      ))}
    </div>
  );
};

export default FloatingHearts;
