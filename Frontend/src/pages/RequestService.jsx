import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SERVICES } from "../data/services";
import { useToast } from "../components/toast/ToastContext";
import "./RequestService.css";

const BUDGET_RANGES = [
  "Under $10,000",
  "$10,000 – $25,000",
  "$25,000 – $75,000",
  "$75,000 – $200,000",
  "$200,000+",
];

const PROPERTY_TYPES = ["House", "Apartment / Condo", "Office", "Retail", "Other"];

export function RequestService() {
  const { t } = useTranslation("marketing");
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get("service") ?? "";
  const [submitted, setSubmitted] = useState(false);
  const { showSuccess } = useToast();

  function handleSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    console.log("Request a service submission:", data);
    setSubmitted(true);
    showSuccess(t("requestService.toast.requestReceived"));
  }

  if (submitted) {
    return (
      <section className="request-page">
        <div className="container">
          <div className="request-page__confirmation">
            <p className="eyebrow">{t("requestService.confirmation.eyebrow")}</p>
            <h1>{t("requestService.confirmation.heading")}</h1>
            <p>{t("requestService.confirmation.body")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="request-page">
      <div className="container">
        <p className="eyebrow">{t("requestService.eyebrow")}</p>
        <h1 className="request-page__heading">{t("requestService.heading")}</h1>
        <p className="request-page__intro">{t("requestService.intro")}</p>

        <form className="form-grid request-page__form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">{t("requestService.form.name")}</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="email">{t("requestService.form.email")}</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="phone">{t("requestService.form.phone")}</label>
            <input id="phone" name="phone" type="tel" />
          </div>
          <div className="field">
            <label htmlFor="service">{t("requestService.form.serviceType")}</label>
            <select
              id="service"
              name="service"
              defaultValue={preselectedService}
              required
            >
              <option value="" disabled>
                {t("requestService.form.selectService")}
              </option>
              {SERVICES.map((service) => (
                <option key={service.slug} value={service.slug}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="propertyType">{t("requestService.form.propertyType")}</label>
            <select id="propertyType" name="propertyType" defaultValue="" required>
              <option value="" disabled>
                {t("requestService.form.selectPropertyType")}
              </option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="budget">{t("requestService.form.budgetRange")}</label>
            <select id="budget" name="budget" defaultValue="" required>
              <option value="" disabled>
                {t("requestService.form.selectBudgetRange")}
              </option>
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div className="field field--full">
            <label htmlFor="description">{t("requestService.form.description")}</label>
            <textarea
              id="description"
              name="description"
              placeholder={t("requestService.form.descriptionPlaceholder")}
              required
            />
          </div>

          <div className="field field--full">
            <label>{t("requestService.form.preferredContact")}</label>
            <div className="field__radio-group">
              <label className="field__radio-option">
                <input
                  type="radio"
                  name="preferredContact"
                  value="email"
                  defaultChecked
                />
                {t("requestService.form.contactEmail")}
              </label>
              <label className="field__radio-option">
                <input type="radio" name="preferredContact" value="phone" />
                {t("requestService.form.contactPhone")}
              </label>
            </div>
          </div>

          <div className="field--full">
            <button type="submit" className="btn btn-solid">
              {t("requestService.form.submit")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
