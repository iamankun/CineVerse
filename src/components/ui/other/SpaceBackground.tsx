"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: "small" | "medium" | "large";
  duration: number;
  delay: number;
}


export default function SpaceBackground() {
  const starsRef = useRef<HTMLDivElement>(null);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!starsRef.current) return;

    const starsContainer = starsRef.current;

    // Generate stars
    const stars: Star[] = [];
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() > 0.7 ? "large" : Math.random() > 0.4 ? "medium" : "small",
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 3,
      });
    }

    // Render stars
    stars.forEach((star) => {
      const starEl = document.createElement("div");
      starEl.className = `star ${star.size}`;
      starEl.style.left = `${star.x}%`;
      starEl.style.top = `${star.y}%`;
      starEl.style.animationDuration = `${star.duration}s`;
      starEl.style.animationDelay = `${star.delay}s`;
      starsContainer.appendChild(starEl);
    });

    // Generate shooting stars
    const createShootingStar = () => {
      if (!starsContainer) return;
      
      const shootingStarEl = document.createElement("div");
      shootingStarEl.className = "shooting-star";
      
      const startX = 70 + Math.random() * 30; // Start from top-right area
      const startY = Math.random() * 30;
      
      shootingStarEl.style.left = `${startX}%`;
      shootingStarEl.style.top = `${startY}%`;
      shootingStarEl.style.animationDuration = `${1.5 + Math.random() * 1}s`;
      
      starsContainer.appendChild(shootingStarEl);

      // Remove after animation
      const timeout = setTimeout(() => {
        if (shootingStarEl.parentNode === starsContainer) {
          shootingStarEl.remove();
        }
      }, 3000);
      timeoutsRef.current.push(timeout);
    };

    // Create shooting stars periodically
    const shootingStarInterval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance every interval
        createShootingStar();
      }
    }, 3000);
    intervalsRef.current.push(shootingStarInterval);

    // Create initial shooting star
    const initialTimeout = setTimeout(createShootingStar, 1000);
    timeoutsRef.current.push(initialTimeout);

    return () => {
      // Clear all intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current = [];
      
      // Clear all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current = [];
      
      // Clear all stars
      if (starsContainer) {
        starsContainer.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="space-background">
      <div ref={starsRef} className="stars" />
    </div>
  );
}
