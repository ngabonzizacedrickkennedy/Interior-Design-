import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SunDim, MoonStars } from "@phosphor-icons/react";
import { getUnreadNotifications, markNotificationRead } from "../api/actions/notifications";
import { BellIcon } from "./navIcons";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

function initialsOf(text) {
  if (!text) return "?";
  return text
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PortalHeader({ user, roleLabel, theme, onToggleTheme }) {
  const { t } = useTranslation("portal");
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const showBell = user?.role !== "ADMIN";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getUnreadNotifications(user.userId);
        if (!cancelled) setNotifications(data);
      } catch {}
    }
    if (user?.userId && showBell) load();
    return () => {
      cancelled = true;
    };
  }, [user?.userId, showBell]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

  async function handleNotificationClick(n) {
    setNotifOpen(false);
    navigate("/portal/notifications");
    try {
      await markNotificationRead(n.id);
      setNotifications((list) => list.filter((x) => x.id !== n.id));
    } catch {}
  }

  return (
    <header className="portal-header">
      <div className="portal-header__spacer" />

      <div className="portal-header__actions">
        <LanguageSwitcher />

        <button
          type="button"
          className="portal-header__icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? t("header.switchToLight") : t("header.switchToDark")}
          title={theme === "dark" ? t("header.switchToLight") : t("header.switchToDark")}
        >
          {theme === "dark" ? <SunDim weight="regular" /> : <MoonStars weight="regular" />}
        </button>

        {showBell && (
          <div className="portal-header__notif" ref={notifRef}>
            <button
              type="button"
              className="portal-header__icon-btn"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label={t("header.notifications")}
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span className="portal-header__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div className="portal-header__dropdown">
                <div className="portal-header__dropdown-title">{t("header.notifications")}</div>
                {notifications.length === 0 ? (
                  <p className="portal-header__dropdown-empty">{t("header.caughtUp")}</p>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="portal-header__dropdown-item"
                      onClick={() => handleNotificationClick(n)}
                    >
                      <span className="portal-header__dropdown-msg">{n.messageBody}</span>
                      <span className="portal-header__dropdown-meta">
                        {n.createdAt?.replace("T", " ").slice(0, 16)}
                      </span>
                    </button>
                  ))
                )}
                <button
                  type="button"
                  className="portal-header__dropdown-viewall"
                  onClick={() => {
                    setNotifOpen(false);
                    navigate("/portal/notifications");
                  }}
                >
                  {t("header.viewAll")}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="portal-header__profile">
          <span className="portal-header__avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              initialsOf(user?.fullName || user?.email)
            )}
          </span>
          <span className="portal-header__profile-text">
            <span className="portal-header__profile-name">{user?.fullName || user?.email}</span>
            <span className="portal-header__profile-role">{roleLabel}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
