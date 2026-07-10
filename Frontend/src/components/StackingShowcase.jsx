import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./StackingShowcase.css";

import showcase1 from "../assets/images/showcase-1.jpg";
import showcase2 from "../assets/images/showcase-2.jpg";
import showcase3 from "../assets/images/showcase-3.jpg";
import showcase4 from "../assets/images/showcase-4.jpg";
import showcase5 from "../assets/images/showcase-5.jpg";

const PANELS = [
  { id: "light", image: showcase1 },
  { id: "material", image: showcase2 },
  { id: "form", image: showcase3 },
  { id: "detail", image: showcase4 },
  { id: "craft", image: showcase5 },
];

export function StackingShowcase() {
  const { t } = useTranslation("marketing");
  const cardRefs = useRef([]);

  useEffect(() => {
    function handleScroll() {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const isNextCovering = i < PANELS.length - 1;
        if (isNextCovering && rect.top <= 0) {
          const progress = Math.min(1, -rect.top / (rect.height * 0.6));
          const scale = 1 - progress * 0.06;
          const brightness = 1 - progress * 0.35;
          card.style.transform = `scale(${scale})`;
          card.style.filter = `brightness(${brightness})`;
        } else {
          card.style.transform = "scale(1)";
          card.style.filter = "brightness(1)";
        }
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="stacking-showcase">
      {PANELS.map((panel, i) => (
        <div
          key={panel.id}
          className="stacking-showcase__panel"
          ref={(el) => (cardRefs.current[i] = el)}
        >
          <img src={panel.image} alt="" className="stacking-showcase__img" />
          <div className="stacking-showcase__scrim" />
          <div className="container stacking-showcase__caption">
            <span className="stacking-showcase__index">{String(i + 1).padStart(2, "0")}</span>
            <h3>{t(`stackingShowcase.panels.${panel.id}.title`)}</h3>
            <p>{t(`stackingShowcase.panels.${panel.id}.body`)}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
