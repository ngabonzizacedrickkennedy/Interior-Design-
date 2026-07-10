import { useTranslation } from "react-i18next";
import "./About.css";

// TODO: These are stand-in Unsplash photos (free license, no attribution
// required) so the team grid has real faces. Swap in real team photography
// in src/assets/images/, and swap in the real team roster/roles.
import team1 from "../assets/images/team-1.jpg";
import team2 from "../assets/images/team-2.jpg";
import team3 from "../assets/images/team-3.jpg";
import team4 from "../assets/images/team-4.jpg";

const TEAM = [
  { index: "0", name: "Aline Uwimana", photo: team1 },
  { index: "1", name: "Claudine Ingabire", photo: team2 },
  { index: "2", name: "Eric Mugisha", photo: team3 },
  { index: "3", name: "Patrick Niyonzima", photo: team4 },
];

export function About() {
  const { t } = useTranslation("marketing");
  return (
    <>
      <section className="about-story">
        <div className="container">
          <p className="eyebrow reveal">{t("about.eyebrow")}</p>
          <h1 className="about-story__heading reveal">{t("about.story.heading")}</h1>
          <p className="about-story__body reveal">{t("about.story.body")}</p>
        </div>
      </section>

      <section className="about-philosophy">
        <div className="container">
          <p className="eyebrow reveal">{t("about.philosophy.eyebrow")}</p>
          <h2 className="about-philosophy__heading reveal">
            {t("about.philosophy.heading")}
          </h2>
          <p className="about-philosophy__body reveal">
            {t("about.philosophy.body")}
          </p>
        </div>
      </section>

      <section className="about-team">
        <div className="container">
          <p className="eyebrow reveal">{t("about.team.eyebrow")}</p>
          <h2 className="about-team__heading reveal">{t("about.team.heading")}</h2>
          <div className="about-team__grid">
            {TEAM.map((member, i) => (
              <div key={member.name} className="about-team__member reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="about-team__photo">
                  <img src={member.photo} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <span>{t(`about.team.members.${member.index}.role`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
