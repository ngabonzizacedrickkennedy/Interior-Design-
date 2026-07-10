import { useTranslation } from "react-i18next";
import { useTilt3D } from "../hooks/useTilt3D";
import "./Capabilities.css";

const CAPABILITY_KEYS = ["visualization", "architecture", "exhibition", "branding"];

function CapabilityCard({ t, capKey, index }) {
  const tiltRef = useTilt3D(6);
  return (
    <div
      ref={tiltRef}
      className="capabilities__item reveal"
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <span className="capabilities__index">{t(`capabilities.items.${capKey}.index`)}</span>
      <h3>{t(`capabilities.items.${capKey}.title`)}</h3>
      <p>{t(`capabilities.items.${capKey}.body`)}</p>
    </div>
  );
}

export function Capabilities() {
  const { t } = useTranslation("marketing");
  return (
    <section id="capabilities" className="capabilities">
      <div className="container">
        <p className="eyebrow reveal">{t("capabilities.eyebrow")}</p>
        <h2 className="capabilities__heading reveal">{t("capabilities.heading")}</h2>
        <div className="capabilities__grid">
          {CAPABILITY_KEYS.map((key, i) => (
            <CapabilityCard key={key} t={t} capKey={key} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
