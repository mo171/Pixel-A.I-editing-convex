"use client";

import { useState, useEffect } from "react";

export const useParallax = () => {
  /* 
   -User scrolls page
      ↓
   Browser scroll event fires (REAL DOM)
      ↓
   handleScroll runs
      ↓
   setScrollY updates React state
      ↓
   React re-renders component
      ↓
   Virtual DOM diff
      ↓
   Real DOM updates
  */
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    /* 
      Component mounted
      ↓
      addEventListener("scroll")
    */
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollY;
};