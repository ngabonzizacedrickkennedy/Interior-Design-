import { useTranslation } from "react-i18next";
import "./Marquee.css";

export function Marquee() {
  const { t } = useTranslation("marketing");
  const items = t("marquee.items", { returnObjects: true });
  const loopItems = [...items, ...items];

  return (
    <div className="marquee">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy} aria-hidden={copy === 1}>
            {loopItems.map((item, i) => (
              <span className="marquee__item" key={`${copy}-${i}`}>
                {item}
                <span className="marquee__dot">●</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
