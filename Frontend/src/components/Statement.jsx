import { useTranslation } from "react-i18next";
import "./Statement.css";

export function Statement() {
  const { t } = useTranslation("marketing");
  return (
    <section className="statement">
      <div className="container">
        <p className="statement__quote reveal">“{t("statement.quote")}”</p>
        <p className="statement__attribution">{t("statement.attribution")}</p>
      </div>
    </section>
  );
}
