import { useState } from "react";
import { useTranslation } from "react-i18next";

export function OtpStep({ email, loading, error, onVerify, onBack }) {
  const { t } = useTranslation("auth");
  const [code, setCode] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    onVerify(code);
  }

  return (
    <>
      <h2 className="auth-card__title">{t("otp.title")}</h2>
      <p className="auth-card__sub">
        {t("otp.subtitlePrefix")} <strong>{email}</strong>
        {t("otp.subtitleSuffix")}
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <p className="auth-form__error">{error}</p>}

        <div className="auth-field">
          <label htmlFor="otp">{t("otp.codeLabel")}</label>
          <div className="auth-input">
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder={t("otp.codePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-form__submit"
          disabled={loading || code.length !== 6}
        >
          {loading ? t("otp.verifying") : t("otp.verifyButton")}
        </button>
      </form>

      <p className="auth-card__switch">
        <button type="button" className="auth-card__link-btn" onClick={onBack}>
          {t("otp.useDifferentAccount")}
        </button>
      </p>
    </>
  );
}
