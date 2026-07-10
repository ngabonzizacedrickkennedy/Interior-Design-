import { useTranslation } from "react-i18next";
import { useTilt3D } from "../hooks/useTilt3D";
import "./Portfolio.css";

// TODO: These are stand-in Unsplash photos (free license, no attribution
// required). Swap in real Space Design Group project photography, named
// for the actual projects (src/assets/images/).
import project1 from "../assets/images/project-1.jpg";
import project2 from "../assets/images/project-2.jpg";
import project3 from "../assets/images/project-3.jpg";
import project4 from "../assets/images/project-4.jpg";
import project5 from "../assets/images/project-5.jpg";
import project6 from "../assets/images/project-6.jpg";

const PROJECTS = [
  { id: "riverside", title: "Riverside Loft", year: "2024", image: project1, span: "tall" },
  { id: "maple", title: "Maple Residence", year: "2023", image: project2, span: "wide" },
  { id: "hartwell", title: "Hartwell House", year: "2023", image: project3, span: "" },
  { id: "birchgrove", title: "Birchgrove Studio", year: "2022", image: project4, span: "" },
  { id: "kestrel", title: "Kestrel Office", year: "2022", image: project5, span: "wide" },
  { id: "linden", title: "Linden Row Renovation", year: "2021", image: project6, span: "tall" },
];

function PortfolioItem({ project, index }) {
  const tiltRef = useTilt3D(8);
  return (
    <a
      href="#"
      className={`portfolio__item reveal${project.span ? ` portfolio__item--${project.span}` : ""}`}
      style={{ transitionDelay: `${(index % 3) * 0.08}s` }}
    >
      <div className="portfolio__image" ref={tiltRef}>
        <img src={project.image} alt={project.title} loading="lazy" />
        <span className="portfolio__index">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="portfolio__caption">
        <h3>{project.title}</h3>
        <span>{project.year}</span>
      </div>
    </a>
  );
}

export function Portfolio() {
  const { t } = useTranslation("marketing");
  return (
    <section id="portfolio" className="portfolio">
      <div className="container">
        <p className="eyebrow reveal">{t("portfolioSection.eyebrow")}</p>
        <h2 className="portfolio__heading reveal">{t("portfolioSection.heading")}</h2>
        <div className="portfolio__grid">
          {PROJECTS.map((project, i) => (
            <PortfolioItem key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
