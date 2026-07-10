import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../components/toast/ToastContext";
import { sendContactMessage } from "../api/actions/contact";
import "./Contact.css";

export function Contact() {
  const { t } = useTranslation("marketing");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useToast();

  async function handleSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    setSending(true);
    try {
      await sendContactMessage(data);
      setSubmitted(true);
      showSuccess(t("contact.toast.messageSent"));
    } catch (e) {
      showError(e.message || t("contact.toast.messageFailed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="contact-page">
      <div className="container contact-page__layout">
        <div className="contact-page__details reveal">
          <p className="eyebrow">{t("contact.eyebrow")}</p>
          <h1 className="contact-page__heading">{t("contact.heading")}</h1>
          <p className="contact-page__intro">{t("contact.intro")}</p>

          <dl className="contact-page__info">
            <div>
              <dt>{t("contact.info.studio")}</dt>
              <dd>KG 548 St, House 1, Kacyiru, Kigali, Rwanda</dd>
            </div>
            <div>
              <dt>{t("contact.info.email")}</dt>
              <dd>
                <a href="mailto:hello@spacedesigngroup.com">
                  hello@spacedesigngroup.com
                </a>
              </dd>
            </div>
            <div>
              <dt>{t("contact.info.phone")}</dt>
              <dd>
                <a href="tel:+250788123456">+250 788 123 456</a>
              </dd>
            </div>
            <div>
              <dt>{t("contact.info.hours")}</dt>
              <dd>{t("contact.info.hoursValue")}</dd>
            </div>
          </dl>

          {/* TODO: Swap the query below for the studio's exact address once
              finalized — this currently pins KG 548 St, Kacyiru, Kigali. */}
          <iframe
            className="contact-page__map"
            title={t("contact.map.title")}
            src="https://www.google.com/maps?q=KG+548+St,+Kacyiru,+Kigali,+Rwanda&z=17&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="contact-page__form-wrap reveal">
          {submitted ? (
            <div className="contact-page__confirmation">
              <h2>{t("contact.confirmation.heading")}</h2>
              <p>{t("contact.confirmation.body")}</p>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">{t("contact.form.name")}</label>
                <input id="name" name="name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="email">{t("contact.form.email")}</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="phone">{t("contact.form.phone")}</label>
                <input id="phone" name="phone" type="tel" />
              </div>
              <div className="field field--full">
                <label htmlFor="message">{t("contact.form.message")}</label>
                <textarea id="message" name="message" required />
              </div>
              <div className="field--full">
                <button type="submit" className="btn btn-solid" disabled={sending}>
                  {sending ? t("contact.form.sending") : t("contact.form.submit")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
