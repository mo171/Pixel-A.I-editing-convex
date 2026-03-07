"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Custom React hook that detects when an element becomes visible in the viewport using the Intersection Observer API.
 *
 * @param {number} [threshold=0.1] - The percentage of the element that must be visible to trigger the callback (0-1).
 *                                   Default is 0.1 (10% visibility).
 *
 * @returns {Array} A tuple containing:
 *   - {React.RefObject} ref - A ref object to attach to the DOM element you want to observe.
 *                             Attach this to the element: <div ref={ref}>...</div>
 *   - {boolean} isVisible - A boolean state indicating whether the observed element is currently visible in the viewport.
 *
 * @example
 * // Used to trigger animations or load content when element enters viewport
 * const [ref, isVisible] = useIntersectionObserver(0.5);
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible && <p>Element is now visible!</p>}
 *   </div>
 * );
 *
 * @description
 * How it works:
 * 1. Creates an IntersectionObserver that monitors the referenced element
 * 2. When the element visibility crosses the threshold, it updates the isVisible state
 * 3. Automatically cleans up the observer when component unmounts
 * 4. Useful for lazy loading, scroll animations, or performance optimization
 */
export const useIntersectionObserver = (threshold = 0.1) => {

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
};

export const useAnimatedCounter = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const step = target / (duration / 16);
    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + step;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, isActive]);

  return [Math.floor(count), setIsActive];
};