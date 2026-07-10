import { useTranslation } from "react-i18next";
import "./Approach.css";

const STEPS = ["0", "1", "2"].map((index, i) => ({
  index,
  number: String(i + 1).padStart(2, "0"),
}));

export function Approach() {
  const { t } = useTranslation("marketing");
  return (
    <section id="approach" className="approach">
      <div className="container">
        <p className="eyebrow">{t("approach.eyebrow")}</p>
        <h2 className="approach__heading">{t("approach.heading")}</h2>
        <ol className="approach__steps">
          {STEPS.map((step, i) => (
            <li key={step.number} className="approach__step reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <span className="approach__number">{step.number}</span>
              <h3>{t(`approach.steps.${step.index}.title`)}</h3>
              <p>{t(`approach.steps.${step.index}.body`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
