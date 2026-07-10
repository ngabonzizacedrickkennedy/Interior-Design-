import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SERVICES } from "../data/services";
import "./Services.css";

export function Services() {
  const { t } = useTranslation("marketing");
  return (
    <section className="services-page">
      <div className="container">
        <p className="eyebrow reveal">{t("servicesPage.eyebrow")}</p>
        <h1 className="services-page__heading reveal">
          {t("servicesPage.heading")}
        </h1>
        <p className="services-page__intro reveal">{t("servicesPage.intro")}</p>

        <div className="services-page__list">
          {SERVICES.map((service, i) => (
            <article key={service.slug} className="services-page__item reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <h2>{service.title}</h2>
              <div className="services-page__copy">
                <p className="services-page__description">
                  {service.description}
                </p>
                <p className="services-page__ideal">
                  <strong>{t("servicesPage.idealFor")}</strong>{" "}
                  {service.idealFor}
                </p>
              </div>
              <Link
                to="/portal/register"
                className="btn btn-solid"
              >
                {t("servicesPage.requestButton")}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
