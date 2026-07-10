import { useState } from "react";
import "./BeforeAfterSlider.css";

export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel, afterLabel }) {
  const [percent, setPercent] = useState(50);

  return (
    <div className="ba-slider">
      <img src={beforeSrc} alt={beforeLabel || ""} className="ba-slider__img ba-slider__img--before" />
      <div className="ba-slider__after-wrap" style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}>
        <img src={afterSrc} alt={afterLabel || ""} className="ba-slider__img" />
      </div>
      <div className="ba-slider__handle" style={{ left: `${percent}%` }} />
      <input
        type="range"
        min="0"
        max="100"
        value={percent}
        onChange={(e) => setPercent(Number(e.target.value))}
        className="ba-slider__input"
        aria-label="Comparison slider"
      />
      {beforeLabel && <span className="ba-slider__tag ba-slider__tag--before">{beforeLabel}</span>}
      {afterLabel && <span className="ba-slider__tag ba-slider__tag--after">{afterLabel}</span>}
    </div>
  );
}
