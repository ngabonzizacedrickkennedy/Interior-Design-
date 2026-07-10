import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./auth/AuthContext";
import { LockIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from "./authIcons";
import { AuthSidePanel } from "./AuthSidePanel";
import { useToast } from "../components/toast/ToastContext";
import "./PortalLogin.css";

export function PortalResetPassword() {
  const { t } = useTranslation("auth");
  const { resetPassword, loading, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");
    clearError();

    if (password !== confirmPassword) {
      setLocalError(t("resetPassword.passwordsMismatch"));
      showError(t("resetPassword.passwordsMismatch"));
      return;
    }
    if (password.length < 6) {
      setLocalError(t("resetPassword.passwordTooShort"));
      showError(t("resetPassword.passwordTooShort"));
      return;
    }

    try {
      await resetPassword(token, password);
      setDone(true);
      showSuccess(t("resetPassword.successToast"));
    } catch (err) {
      showError(err.message || t("resetPassword.errorFallback"));
    }
  }

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <Link to="/" className="auth-home-link">
        <ArrowLeftIcon />
        <span>{t("home")}</span>
      </Link>

      <AuthSidePanel />

      <div className="auth-page__content">
        <div className="auth-card">
          {!token ? (
            <>
              <h2 className="auth-card__title">{t("resetPassword.invalidLinkTitle")}</h2>
              <p className="auth-card__sub">{t("resetPassword.invalidLinkSubtitle")}</p>
              <p className="auth-card__switch">
                <Link to="/portal/forgot-password" className="auth-card__link">
                  {t("resetPassword.requestNewLink")}
                </Link>
              </p>
            </>
          ) : done ? (
            <>
              <h2 className="auth-card__title">{t("resetPassword.updatedTitle")}</h2>
              <p className="auth-card__sub">{t("resetPassword.updatedSubtitle")}</p>
              <p className="auth-card__switch">
                <Link to="/portal/login" className="auth-card__link">
                  {t("resetPassword.backToSignIn")}
                </Link>
              </p>
            </>
          ) : (
            <>
              <h2 className="auth-card__title">{t("resetPassword.title")}</h2>
              <p className="auth-card__sub">{t("resetPassword.subtitle")}</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {displayError && <p className="auth-form__error">{displayError}</p>}

                <div className="auth-field">
                  <label htmlFor="password">{t("resetPassword.newPasswordLabel")}</label>
                  <div className="auth-input">
                    <LockIcon />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="auth-input__toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t("resetPassword.hidePassword") : t("resetPassword.showPassword")}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="auth-field">
                  <label htmlFor="confirmPassword">{t("resetPassword.confirmNewPasswordLabel")}</label>
                  <div className="auth-input">
                    <LockIcon />
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button type="submit" className="auth-form__submit" disabled={loading}>
                  {loading ? t("resetPassword.updating") : t("resetPassword.resetButton")}
                </button>
              </form>

              <p className="auth-card__switch">
                <Link to="/portal/login" className="auth-card__link">
                  {t("resetPassword.backToSignIn")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
