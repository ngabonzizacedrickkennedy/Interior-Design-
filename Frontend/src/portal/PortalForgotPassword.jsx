import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./auth/AuthContext";
import { MailIcon, ArrowLeftIcon } from "./authIcons";
import { AuthSidePanel } from "./AuthSidePanel";
import { useToast } from "../components/toast/ToastContext";
import "./PortalLogin.css";

export function PortalForgotPassword() {
  const { t } = useTranslation("auth");
  const { forgotPassword, loading, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    clearError();
    try {
      await forgotPassword(email);
      setSent(true);
      showSuccess(t("forgotPassword.successToast"));
    } catch (err) {
      showError(err.message || t("forgotPassword.errorFallback"));
    }
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-home-link">
        <ArrowLeftIcon />
        <span>{t("home")}</span>
      </Link>

      <AuthSidePanel />

      <div className="auth-page__content">
        <div className="auth-card">
          {sent ? (
            <>
              <h2 className="auth-card__title">{t("forgotPassword.sentTitle")}</h2>
              <p className="auth-card__sub">
                {t("forgotPassword.sentSubtitlePrefix")} <strong>{email}</strong>
                {t("forgotPassword.sentSubtitleSuffix")}
              </p>

              <p className="auth-card__switch">
                <Link to="/portal/login" className="auth-card__link">
                  {t("forgotPassword.backToSignIn")}
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-card__title">{t("forgotPassword.title")}</h2>
              <p className="auth-card__sub">{t("forgotPassword.subtitle")}</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {error && <p className="auth-form__error">{error}</p>}

                <div className="auth-field">
                  <label htmlFor="email">{t("forgotPassword.emailLabel")}</label>
                  <div className="auth-input">
                    <MailIcon />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" className="auth-form__submit" disabled={loading}>
                  {loading ? t("forgotPassword.sending") : t("forgotPassword.sendButton")}
                </button>
              </form>

              <p className="auth-card__switch">
                {t("forgotPassword.rememberedIt")}{" "}
                <Link to="/portal/login" className="auth-card__link">
                  {t("forgotPassword.signIn")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
