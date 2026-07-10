import { useTranslation } from "react-i18next";
import "./Services.css";

const SERVICE_KEYS = ["0", "1", "2", "3"];

export function Services() {
  const { t } = useTranslation("marketing");
  return (
    <section id="services" className="services">
      <div className="container">
        <p className="eyebrow">{t("servicesSection.eyebrow")}</p>
        <h2 className="services__heading">{t("servicesSection.heading")}</h2>
        <div className="services__grid">
          {SERVICE_KEYS.map((key, i) => (
            <div key={key} className="services__item reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <h3>{t(`servicesSection.items.${key}.title`)}</h3>
              <p>{t(`servicesSection.items.${key}.body`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
