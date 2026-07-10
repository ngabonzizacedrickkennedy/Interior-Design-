import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./auth/AuthContext";
import { ROLE_DEFAULT_ROUTE } from "./auth/roles";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from "./authIcons";
import { OtpStep } from "./OtpStep";
import { AuthSidePanel } from "./AuthSidePanel";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useToast } from "../components/toast/ToastContext";
import "./PortalLogin.css";

export function PortalLogin() {
  const { t } = useTranslation("auth");
  const { login, verifyOtp, loading, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToDashboard(role) {
    const route = ROLE_DEFAULT_ROUTE[role] || "/portal/clients";
    navigate(route, { replace: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const result = await login(form.email, form.password);
      if (result.otpRequired) {
        setPendingEmail(result.email);
      } else {
        showSuccess(t("login.welcomeBackToast"));
        goToDashboard(result.role);
      }
    } catch (err) {
      showError(err.message || t("login.errorFallback"));
    }
  }

  async function handleVerify(code) {
    try {
      const user = await verifyOtp(pendingEmail, code);
      showSuccess(t("login.welcomeBackToast"));
      goToDashboard(user.role);
    } catch (err) {
      showError(err.message || t("login.verifyErrorFallback"));
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
          {pendingEmail ? (
            <OtpStep
              email={pendingEmail}
              loading={loading}
              error={error}
              onVerify={handleVerify}
              onBack={() => {
                clearError();
                setPendingEmail(null);
              }}
            />
          ) : (
            <>
              <h2 className="auth-card__title">{t("login.title")}</h2>
              <p className="auth-card__sub">{t("login.subtitle")}</p>

              <form className="auth-form" onSubmit={handleSubmit}>
                {error && <p className="auth-form__error">{error}</p>}

                <div className="auth-field">
                  <label htmlFor="email">{t("login.emailLabel")}</label>
                  <div className="auth-input">
                    <MailIcon />
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <div className="auth-field__row">
                    <label htmlFor="password">{t("login.passwordLabel")}</label>
                    <Link to="/portal/forgot-password" className="auth-field__forgot">
                      {t("login.forgotPassword")}
                    </Link>
                  </div>
                  <div className="auth-input">
                    <LockIcon />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="auth-input__toggle"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? t("login.hidePassword") : t("login.showPassword")}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="auth-form__submit" disabled={loading}>
                  {loading ? t("login.signingIn") : t("login.signInButton")}
                </button>
              </form>

              <GoogleSignInButton
                onSuccess={(user) => {
                  showSuccess(t("login.welcomeBackToast"));
                  goToDashboard(user.role);
                }}
                onError={(message) => showError(message)}
              />

              <p className="auth-card__switch">
                {t("login.noAccount")}{" "}
                <Link to="/portal/register" className="auth-card__link">
                  {t("login.createAccount")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
