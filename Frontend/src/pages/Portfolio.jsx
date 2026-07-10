import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PROJECTS } from "../data/projects";
import "./Portfolio.css";

const CATEGORIES = ["All", "Residential", "Commercial"];
const CATEGORY_LABEL_KEYS = {
  All: "portfolioPage.filters.all",
  Residential: "portfolioPage.filters.residential",
  Commercial: "portfolioPage.filters.commercial",
};

export function Portfolio() {
  const { t } = useTranslation("marketing");
  const [category, setCategory] = useState("All");

  const projects =
    category === "All"
      ? PROJECTS
      : PROJECTS.filter((project) => project.category === category);

  return (
    <section className="portfolio-page">
      <div className="container">
        <p className="eyebrow">{t("portfolioPage.eyebrow")}</p>
        <h1 className="portfolio-page__heading">
          {t("portfolioPage.heading")}
        </h1>
        <p className="portfolio-page__intro">{t("portfolioPage.intro")}</p>

        <div
          className="portfolio-page__filters"
          role="group"
          aria-label={t("portfolioPage.filters.ariaLabel")}
        >
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className={
                "portfolio-page__filter" +
                (category === item ? " is-active" : "")
              }
              onClick={() => setCategory(item)}
            >
              {t(CATEGORY_LABEL_KEYS[item])}
            </button>
          ))}
        </div>

        <div className="portfolio-page__grid">
          {projects.map((project, i) => (
            <Link
              key={project.slug}
              to={`/portfolio/${project.slug}`}
              className="portfolio-page__item reveal"
              style={{ transitionDelay: `${(i % 4) * 0.06}s` }}
            >
              <div className="portfolio-page__image">
                <img src={project.image} alt={project.title} />
              </div>
              <div className="portfolio-page__caption">
                <h3>{project.title}</h3>
                <span>
                  {t(CATEGORY_LABEL_KEYS[project.category])} · {project.year}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
