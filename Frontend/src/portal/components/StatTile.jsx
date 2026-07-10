import { useTilt3D } from "../../hooks/useTilt3D";

export function StatTile({ label, value, accent }) {
  const tiltRef = useTilt3D(5);
  return (
    <div className="portal-stat-card" ref={tiltRef}>
      <div className="portal-stat-card__label">{label}</div>
      <div className={"portal-stat-card__value" + (accent ? " portal-stat-card__value--accent" : "")}>
        {value}
      </div>
    </div>
  );
}
