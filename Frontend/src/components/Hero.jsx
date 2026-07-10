import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAutoRotate } from "../hooks/useAutoRotate";
import "./Hero.css";

// TODO: These are stand-in Unsplash photos (free license, no attribution
// required) so the walkthrough has real imagery to feel out the effect.
// Swap in actual Space Design Group project photography in
// src/assets/images/ when it's available, keeping the same filenames or
// updating the imports below.
import exteriorHouse from "../assets/images/exterior-house.jpg";
import roomLiving from "../assets/images/room-living.jpg";
import roomKitchen from "../assets/images/room-kitchen.jpg";
import roomBedroom from "../assets/images/room-bedroom.jpg";
import roomBath from "../assets/images/room-bath.jpg";

const FRAMES = [
  { id: "exterior", image: exteriorHouse },
  { id: "living", image: roomLiving },
  { id: "kitchen", image: roomKitchen },
  { id: "bedroom", image: roomBedroom },
  { id: "bath", image: roomBath },
];

const SLIDE_INTERVAL_MS = 4500;

export function Hero() {
  const { t } = useTranslation("marketing");
  const stageRef = useRef(null);
  const { activeIndex, goTo } = useAutoRotate({
    count: FRAMES.length,
    intervalMs: SLIDE_INTERVAL_MS,
  });

  useEffect(() => {
    function handleScroll() {
      if (!stageRef.current) return;
      const offset = Math.min(window.scrollY * 0.25, 90);
      stageRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero">
      <div className="hero__intro container">
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <h1 className="hero__title">
          {t("hero.titleLine1")}
          <br />
          {t("hero.titleLine2")}
        </h1>
      </div>

      <div className="hero__stage" ref={stageRef} aria-hidden="true">
        {FRAMES.map((frame, index) => (
          <div
            key={frame.id}
            className={
              "hero__card" + (index === activeIndex ? " is-active" : "")
            }
          >
            <img src={frame.image} alt="" />
          </div>
        ))}
        <div className="hero__vignette" />
      </div>

      <div className="hero__meta container">
        <span className="hero__room-label">
          {t(`hero.frames.${FRAMES[activeIndex].id}`)}
        </span>
        <div className="hero__dots">
          {FRAMES.map((frame, index) => (
            <button
              key={frame.id}
              type="button"
              className={
                "hero__dot" + (index === activeIndex ? " is-active" : "")
              }
              aria-label={t("hero.showFrame", {
                label: t(`hero.frames.${frame.id}`),
              })}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
