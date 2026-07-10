import { NavLink, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SunDim, MoonStars } from "@phosphor-icons/react";
import { useAuth } from "../portal/auth/AuthContext";
import { ROLE_DEFAULT_ROUTE } from "../portal/auth/roles";
import { useTheme } from "../theme/ThemeContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import "./Header.css";

const NAV_LINKS = [
  { to: "/", key: "nav.home" },
  { to: "/portfolio", key: "nav.portfolio" },
  { to: "/services", key: "nav.services" },
  { to: "/about", key: "nav.about" },
  { to: "/testimonials", key: "nav.testimonials" },
  { to: "/contact", key: "nav.contact" },
];

export function Header() {
  const { t } = useTranslation("marketing");
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const portalRoute = user
    ? ROLE_DEFAULT_ROUTE[user.role] || "/portal/clients"
    : "/portal/login";

  const portalLabel = user
    ? user.fullName?.split(" ")[0] || t("nav.myPortal")
    : t("nav.signIn");

  return (
    <header className="header">
      <div className="container header__row">
        <NavLink to="/" className="header__mark" end>
          Space Design Group
        </NavLink>

        <div className="header__right">
          <nav className="header__nav">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => (isActive ? "is-active" : undefined)}
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <LanguageSwitcher />

          <button
            type="button"
            className="header__theme-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t("nav.switchToLight") : t("nav.switchToDark")}
            title={theme === "dark" ? t("nav.switchToLight") : t("nav.switchToDark")}
          >
            {theme === "dark" ? <SunDim weight="regular" /> : <MoonStars weight="regular" />}
          </button>

          <Link to={portalRoute} className="header__portal-btn">
            {user && (
              <span className="header__portal-dot" aria-hidden="true" />
            )}
            {portalLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
