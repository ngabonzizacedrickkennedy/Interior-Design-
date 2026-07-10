import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  MailIcon,
  InstagramIcon,
  PinterestIcon,
  TwitterIcon,
} from "./icons/SocialIcons";
import "./Footer.css";

const SOCIAL_LINKS = [
  { key: "email", href: "mailto:hello@spacedesigngroup.com", Icon: MailIcon },
  { key: "instagram", href: "#", Icon: InstagramIcon },
  { key: "pinterest", href: "#", Icon: PinterestIcon },
  { key: "twitter", href: "#", Icon: TwitterIcon },
];

const EXPLORE_LINKS = [
  { to: "/portfolio", key: "nav.portfolio" },
  { to: "/services", key: "nav.services" },
  { to: "/about", key: "nav.about" },
  { to: "/testimonials", key: "nav.testimonials" },
];

export function Footer() {
  const { t } = useTranslation("marketing");
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <span className="footer__mark">Space Design Group</span>
          <p className="footer__tagline">{t("footer.tagline")}</p>
          <div className="footer__links">
            {SOCIAL_LINKS.map(({ key, href, Icon }) => {
              const label = t(`footer.social.${key}`);
              return (
                <a key={key} href={href} aria-label={label} title={label}>
                  <Icon className="footer__icon" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="footer__column">
          <span className="footer__column-title">{t("footer.explore")}</span>
          <nav>
            {EXPLORE_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>{t(link.key)}</Link>
            ))}
          </nav>
        </div>

        <div className="footer__column">
          <span className="footer__column-title">{t("footer.studio")}</span>
          <address>
            <span>{t("footer.location")}</span>
            <a href="mailto:hello@spacedesigngroup.com">hello@spacedesigngroup.com</a>
          </address>
        </div>

        <div className="footer__column">
          <span className="footer__column-title">{t("footer.getStarted")}</span>
          <nav>
            <Link to="/portal/register">{t("footer.startProject")}</Link>
            <Link to="/portal/login">{t("footer.signIn")}</Link>
          </nav>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
      </div>
    </footer>
  );
}
