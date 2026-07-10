


import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as adminActions from "../../api/actions/admin";
import "../PortalLayout.css";

const ROLES   = ["CLIENT", "STAFF", "PROJECT_MANAGER", "ADMIN"];
const RBADGE  = { CLIENT: "draft", STAFF: "review", PROJECT_MANAGER: "progress", ADMIN: "approved" };

export function SecurityAccess() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const [users, setUsers]     = useState([]);
  const [audit, setAudit]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [search, setSearch]   = useState("");

  // ADMIN-only guard
  if (user?.role !== "ADMIN") {
    return (
      <div className="portal-access-denied">
        <h2>{t("securityAccess.accessRestricted.title")}</h2>
        <p>{t("securityAccess.accessRestricted.message")}</p>
      </div>
    );
  }

  useEffect(() => {
    async function load() {
      try {
        const [u, a] = await Promise.all([
          adminActions.getAllUsers(),
          adminActions.getAuditTrail(),
        ]);
        setUsers(u);
        setAudit(a);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleRoleChange(id, role) {
    try {
      const updated = await adminActions.changeUserRole(id, role);
      setUsers((u) => u.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  async function handleToggle(id) {
    try {
      const updated = await adminActions.toggleUserEnabled(id);
      setUsers((u) => u.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  const filteredUsers = users.filter((u) =>
    !search || u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount  = users.filter((u) => u.role === "ADMIN").length;
  const activeCount = users.filter((u) => u.enabled).length;

  return (
    <div>
      <h1 className="portal-page-title">{t("securityAccess.title")}</h1>
      <p className="portal-page-sub">{t("securityAccess.subtitle")}</p>

      <div className="portal-role-banner" style={{ marginBottom: "1.75rem" }}>
        <div className="portal-role-banner__text">
          <h2>{t("securityAccess.systemOverview.title")}</h2>
          <p>{t("securityAccess.systemOverview.description")}</p>
        </div>
        <div className="portal-role-banner__stats">
          <div className="portal-role-banner__stat">
            <span className="portal-role-banner__stat-value">{users.length}</span>
            <span className="portal-role-banner__stat-label">{t("securityAccess.stats.totalUsers")}</span>
          </div>
          <div className="portal-role-banner__stat">
            <span className="portal-role-banner__stat-value">{activeCount}</span>
            <span className="portal-role-banner__stat-label">{t("securityAccess.stats.active")}</span>
          </div>
          <div className="portal-role-banner__stat">
            <span className="portal-role-banner__stat-value">{adminCount}</span>
            <span className="portal-role-banner__stat-label">{t("securityAccess.stats.admins")}</span>
          </div>
        </div>
      </div>

      {error && <p className="portal-error">{error}</p>}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("securityAccess.userManagement.title")}</h2>
        <div className="portal-search-bar">
          <input placeholder={t("securityAccess.userManagement.searchPlaceholder")}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? <p className="portal-loading">{t("securityAccess.userManagement.loading")}</p> : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t("securityAccess.userManagement.columns.name")}</th><th>{t("securityAccess.userManagement.columns.email")}</th>
                  <th>{t("securityAccess.userManagement.columns.role")}</th><th>{t("securityAccess.userManagement.columns.status")}</th><th>{t("securityAccess.userManagement.columns.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>{u.fullName}</td>
                    <td style={{ color: "var(--color-ink-soft)" }}>{u.email}</td>
                    <td>
                      <span className={`badge badge--${RBADGE[u.role] || "draft"}`}>
                        {t(`securityAccess.roles.${u.role}`, u.role?.replace("_", " "))}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge--${u.enabled ? "active" : "cancelled"}`}>
                        {u.enabled ? t("securityAccess.userManagement.status.active") : t("securityAccess.userManagement.status.disabled")}
                      </span>
                    </td>
                    <td>
                      <div className="portal-actions">
                        <select value={u.role} style={{ fontSize: "0.8rem" }}
                          disabled={u.id === user.userId}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{t(`securityAccess.roles.${r}`, r.replace("_", " "))}</option>
                          ))}
                        </select>
                        <button className="btn"
                          style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                          disabled={u.id === user.userId}
                          onClick={() => handleToggle(u.id)}>
                          {u.enabled ? t("securityAccess.userManagement.actions.disable") : t("securityAccess.userManagement.actions.enable")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!filteredUsers.length && (
                  <tr><td colSpan={5} className="portal-empty">{t("securityAccess.userManagement.noResults")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("securityAccess.auditTrail.title")}</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--color-ink-soft)", marginBottom: "1rem" }}>
          {t("securityAccess.auditTrail.description")}
        </p>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr><th>{t("securityAccess.auditTrail.columns.timestamp")}</th><th>{t("securityAccess.auditTrail.columns.operator")}</th><th>{t("securityAccess.auditTrail.columns.action")}</th></tr>
            </thead>
            <tbody>
              {audit.map((a) => (
                <tr key={a.id}>
                  <td style={{ whiteSpace: "nowrap", fontFamily: "monospace", fontSize: "0.82rem", color: "var(--color-ink-soft)" }}>
                    {a.timestampLogged?.replace("T", " ").slice(0, 16)}
                  </td>
                  <td style={{ fontWeight: 500 }}>{a.operatorName}</td>
                  <td>{a.historicalAction}</td>
                </tr>
              ))}
              {!audit.length && (
                <tr><td colSpan={3} className="portal-empty">{t("securityAccess.auditTrail.noResults")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
