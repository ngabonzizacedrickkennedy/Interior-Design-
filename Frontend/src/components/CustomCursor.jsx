import { useEffect, useRef } from "react";
import "./CustomCursor.css";

const HOVER_SELECTOR = "a, button, input[type='range'], .try-it-live__dropzone, .ba-slider";

export function CustomCursor() {
  const dotRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    document.body.classList.add("has-custom-cursor");

    function handleMove(e) {
      dot.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }

    function handleOver(e) {
      if (e.target.closest(HOVER_SELECTOR)) dot.classList.add("is-hovering");
    }

    function handleOut(e) {
      if (e.target.closest(HOVER_SELECTOR)) dot.classList.remove("is-hovering");
    }

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, []);

  return <div ref={dotRef} className="custom-cursor" aria-hidden="true" />;
}
