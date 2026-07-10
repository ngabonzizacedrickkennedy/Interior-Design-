import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMagnetic } from "../hooks/useMagnetic";
import "./CTA.css";

export function CTA() {
  const { t } = useTranslation("marketing");
  const magneticRef = useMagnetic();
  return (
    <section id="cta" className="cta">
      <div className="container cta__inner reveal">
        <h2 className="cta__heading">{t("cta.heading")}</h2>

        <div className="cta__actions">
          <Link to="/portal/register" className="btn btn-solid" ref={magneticRef}>
            {t("cta.startProject")}
          </Link>

          <div className="cta__portal">
            <p>{t("cta.alreadyClient")}</p>
            <Link to="/portal/login" className="cta__portal-link">
              {t("cta.signInPortal")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
