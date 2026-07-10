import { useTranslation } from "react-i18next";

export function StepBudget({ state, setField }) {
  const { t } = useTranslation("portal");
  return (
    <div>
      <h2 className="portal-section__title">{t("wizard.budget.title")}</h2>
      <p className="portal-page-sub">
        {t("wizard.budget.subtitle")}
      </p>
      <div className="portal-form-row">
        <div className="field">
          <label>{t("wizard.budget.minimumBudget")}</label>
          <input type="number" min="0" value={state.fields.budgetMin}
            onChange={(e) => setField("budgetMin", e.target.value)} />
        </div>
        <div className="field">
          <label>{t("wizard.budget.maximumBudget")}</label>
          <input type="number" min="0" value={state.fields.budgetMax}
            onChange={(e) => setField("budgetMax", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
