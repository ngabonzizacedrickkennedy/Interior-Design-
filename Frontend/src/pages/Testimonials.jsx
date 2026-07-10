import { useTranslation } from "react-i18next";
import "../components/Statement.css";
import "./Testimonials.css";

const TESTIMONIAL_KEYS = ["0", "1", "2", "3"];

export function Testimonials() {
  const { t } = useTranslation("marketing");
  return (
    <section className="testimonials-page">
      <div className="container">
        <p className="eyebrow reveal">{t("testimonialsPage.eyebrow")}</p>
        <h1 className="testimonials-page__heading reveal">
          {t("testimonialsPage.heading")}
        </h1>

        <div className="testimonials-page__list">
          {TESTIMONIAL_KEYS.map((key, i) => (
            <figure key={key} className="testimonials-page__item reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <blockquote className="statement__quote">
                “{t(`testimonialsPage.items.${key}.quote`)}”
              </blockquote>
              <figcaption className="statement__attribution">
                — {t(`testimonialsPage.items.${key}.attribution`)}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
