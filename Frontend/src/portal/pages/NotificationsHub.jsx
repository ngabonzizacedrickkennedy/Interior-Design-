import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as notifActions from "../../api/actions/notifications";
import { getAllUsers } from "../../api/actions/admin";
import "../PortalLayout.css";

const CHANNELS = ["IN_APP", "EMAIL", "SMS"];
const CHANNEL_BADGE = { EMAIL: "review", SMS: "pending", IN_APP: "active" };

export function NotificationsHub() {
  const { t } = useTranslation("portal");
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [form, setForm] = useState({ recipientUserId: "", dispatchChannel: "IN_APP", messageBody: "" });

  const canSend = user?.role === "ADMIN";

  useEffect(() => {
    async function load() {
      try {
        const notifs = await notifActions.getNotificationsByUser(user.userId);
        setNotifications(notifs);
        if (canSend) {
          const allUsers = await getAllUsers();
          setUsers(allUsers.filter((u) => u.id !== user.userId));
        }
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  async function handleSend(e) {
    e.preventDefault();
    if (!form.recipientUserId) return;
    try {
      await notifActions.sendNotification({
        recipientUserId: Number(form.recipientUserId),
        dispatchChannel: form.dispatchChannel,
        messageBody:     form.messageBody,
      });
      setForm({ recipientUserId: "", dispatchChannel: "IN_APP", messageBody: "" });
    } catch (e) { setError(e.message); }
  }

  async function markRead(id) {
    try {
      const updated = await notifActions.markNotificationRead(id);
      setNotifications((n) => n.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.wasRead);
    for (const n of unread) await markRead(n.id);
  }

  const unreadCount = notifications.filter((n) => !n.wasRead).length;
  const CHANNEL_LABELS = {
    IN_APP: t("notifications.channelInApp"),
    EMAIL: t("notifications.channelEmail"),
    SMS: t("notifications.channelSms"),
  };

  return (
    <div>
      <h1 className="portal-page-title">{t("notifications.title")}</h1>
      <p className="portal-page-sub">
        {unreadCount > 0
          ? t("notifications.unreadSummary", { count: unreadCount })
          : t("notifications.allRead")}
      </p>

      {error && <p className="portal-error">{error}</p>}

      {canSend && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("notifications.sendNotification")}</h2>
          <form onSubmit={handleSend}>
            <div className="portal-form-row">
              <div className="field">
                <label>{t("notifications.recipient")}</label>
                <select value={form.recipientUserId} required
                  onChange={(e) => setForm({ ...form, recipientUserId: e.target.value })}>
                  <option value="">{t("notifications.selectUser")}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role?.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("notifications.channel")}</label>
                <select value={form.dispatchChannel}
                  onChange={(e) => setForm({ ...form, dispatchChannel: e.target.value })}>
                  {CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_LABELS[c] || c}</option>)}
                </select>
              </div>
              <div className="field field--full">
                <label>{t("notifications.message")}</label>
                <textarea rows={3} value={form.messageBody} required
                  placeholder={t("notifications.messagePlaceholder")}
                  onChange={(e) => setForm({ ...form, messageBody: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-solid">{t("notifications.sendNotification")}</button>
          </form>
        </section>
      )}

      <section className="portal-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="portal-section__title" style={{ border: "none", margin: 0 }}>
            {t("notifications.myNotifications")}
          </h2>
          {unreadCount > 0 && (
            <button className="btn" style={{ fontSize: "0.8rem" }} onClick={markAllRead}>
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>

        {loading ? <p className="portal-loading">{t("notifications.loadingNotifications")}</p> : (
          <div>
            {notifications.length === 0 && (
              <p className="portal-empty">{t("notifications.noNotificationsYet")}</p>
            )}
            {notifications.map((n) => (
              <div key={n.id} className="notif-card">
                <div className={`notif-card__dot${n.wasRead ? " notif-card__dot--read" : ""}`} />
                <div className="notif-card__body">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                    <span className={`badge badge--${CHANNEL_BADGE[n.dispatchChannel] || "draft"}`}
                      style={{ fontSize: "0.7rem" }}>
                      {CHANNEL_LABELS[n.dispatchChannel] || n.dispatchChannel}
                    </span>
                    {!n.wasRead && (
                      <span style={{ fontSize: "0.7rem", color: "var(--color-accent)", fontWeight: 600 }}>
                        {t("notifications.newBadge")}
                      </span>
                    )}
                  </div>
                  <p className="notif-card__msg">{n.messageBody}</p>
                  <p className="notif-card__meta">
                    {n.createdAt?.replace("T", " ").slice(0, 16)}
                  </p>
                </div>
                {!n.wasRead && (
                  <button className="btn" style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem", flexShrink: 0 }}
                    onClick={() => markRead(n.id)}>
                    {t("notifications.markRead")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
