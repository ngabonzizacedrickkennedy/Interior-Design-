import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "./auth/AuthContext";
import { ROLE_DEFAULT_ROUTE } from "./auth/roles";
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon, ArrowLeftIcon } from "./authIcons";
import { OtpStep } from "./OtpStep";
import { AuthSidePanel } from "./AuthSidePanel";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { useToast } from "../components/toast/ToastContext";
import "./PortalLogin.css";

export function PortalRegister() {
  const { t } = useTranslation("auth");
  const ROLES = [
    { value: "CLIENT", label: t("register.roles.client") },
    { value: "STAFF",  label: t("register.roles.designer") },
  ];
  const { register, verifyOtp, loading, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [form, setForm] = useState({
    fullName:        "",
    email:           "",
    password:        "",
    confirmPassword: "",
    role:            "CLIENT",
  });
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null);

  function goToDashboard(role) {
    const route = ROLE_DEFAULT_ROUTE[role] || "/portal/requests";
    navigate(route, { replace: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLocalError("");

    if (form.password !== form.confirmPassword) {
      setLocalError(t("register.passwordsMismatch"));
      showError(t("register.passwordsMismatch"));
      return;
    }
    if (form.password.length < 6) {
      setLocalError(t("register.passwordTooShort"));
      showError(t("register.passwordTooShort"));
      return;
    }

    try {
      const result = await register(form.fullName, form.email, form.password, form.role);
      if (result.otpRequired) {
        setPendingEmail(result.email);
      } else {
        showSuccess(t("register.successToast"));
        goToDashboard(result.role);
      }
    } catch (err) {
      showError(err.message || t("register.errorFallback"));
    }
  }

  async function handleVerify(code) {
    try {
      const user = await verifyOtp(pendingEmail, code);
      showSuccess(t("register.successToast"));
      goToDashboard(user.role);
    } catch (err) {
      showError(err.message || t("register.verifyErrorFallback"));
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
          <h2 className="auth-card__title">{t("register.title")}</h2>
          <p className="auth-card__sub">{t("register.subtitle")}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {displayError && <p className="auth-form__error">{displayError}</p>}

            <div className="auth-field">
              <label>{t("register.registeringAs")}</label>
              <div className="auth-role-group" role="radiogroup" aria-label={t("register.registeringAs")}>
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={
                      "auth-role-option" +
                      (form.role === r.value ? " is-selected" : "")
                    }
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={form.role === r.value}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                    <span className="auth-role-option__dot" />
                    <span className="auth-role-option__label">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="fullName">{t("register.fullNameLabel")}</label>
              <div className="auth-input">
                <UserIcon />
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-email">{t("register.emailLabel")}</label>
              <div className="auth-input">
                <MailIcon />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="reg-password">{t("register.passwordLabel")}</label>
              <div className="auth-input">
                <LockIcon />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-input__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t("register.hidePassword") : t("register.showPassword")}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">{t("register.confirmPasswordLabel")}</label>
              <div className="auth-input">
                <LockIcon />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-input__toggle"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? t("register.hidePassword") : t("register.showPassword")}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-form__submit" disabled={loading}>
              {loading ? t("register.creatingAccount") : t("register.createAccountButton")}
            </button>
          </form>

          <GoogleSignInButton
            role={form.role}
            onSuccess={(user) => {
              showSuccess(t("register.successToast"));
              goToDashboard(user.role);
            }}
            onError={(message) => showError(message)}
          />

          <p className="auth-card__switch">
            {t("register.alreadyHaveAccount")}{" "}
            <Link to="/portal/login" className="auth-card__link">
              {t("register.signIn")}
            </Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
