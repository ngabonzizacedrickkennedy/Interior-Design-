import { Fragment, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as clientActions from "../../api/actions/clients";
import * as adminActions from "../../api/actions/admin";
import "../PortalLayout.css";

export function ClientManagement() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId]   = useState(null);
  const [editBuf, setEditBuf]       = useState({});
  const [noteInput, setNoteInput]   = useState({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({
    contactName: "", contactEmail: "", contactPhone: "", propertyType: "House",
  });
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [managerForm, setManagerForm] = useState({ fullName: "", email: "", password: "" });
  const [managerMessage, setManagerMessage] = useState(null);
  const [creatingManager, setCreatingManager] = useState(false);

  const canEdit    = user?.role === "ADMIN";
  const canCreate  = user?.role === "ADMIN";
  const isAdmin    = user?.role === "ADMIN";

  if (user?.role === "PROJECT_MANAGER") {
    return (
      <div className="portal-access-denied">
        <h2>{t("clientManagement.accessRestrictedTitle")}</h2>
        <p>{t("clientManagement.accessRestrictedMessage")}</p>
      </div>
    );
  }

  useEffect(() => {
    clientActions.getAllClients()
      .then(setClients)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const created = await clientActions.createClient(user.userId, newForm);
      setClients((c) => [...c, created]);
      setNewForm({ contactName: "", contactEmail: "", contactPhone: "", propertyType: "House" });
      setShowNewForm(false);
    } catch (e) { setError(e.message); }
  }

  async function handleCreateManager(e) {
    e.preventDefault();
    if (creatingManager) return;
    setCreatingManager(true);
    setManagerMessage(null);
    try {
      const created = await adminActions.createManager(managerForm);
      setManagerMessage({ type: "success", text: t("clientManagement.managerCreatedSuccess", { name: created.fullName }) });
      setManagerForm({ fullName: "", email: "", password: "" });
      setShowManagerForm(false);
    } catch (e) {
      setManagerMessage({ type: "error", text: e.message });
    } finally {
      setCreatingManager(false);
    }
  }

  async function handleSave(id) {
    try {
      const updated = await clientActions.updateClient(id, editBuf);
      setClients((c) => c.map((x) => x.id === id ? updated : x));
      setEditingId(null);
    } catch (e) { setError(e.message); }
  }

  async function handleAddNote(clientId) {
    const note = noteInput[clientId]?.trim();
    if (!note) return;
    try {
      const updated = await clientActions.addCommunicationLog(clientId, {
        noteEntry: note, channel: "Note",
      });
      setClients((c) => c.map((x) => x.id === clientId ? updated : x));
      setNoteInput((n) => ({ ...n, [clientId]: "" }));
    } catch (e) { setError(e.message); }
  }

  const filtered = clients.filter((c) =>
    !search ||
    c.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    c.contactEmail?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="portal-page-title">{t("clientManagement.title")}</h1>
      <p className="portal-page-sub">{t("clientManagement.subtitle")}</p>

      <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("clientManagement.kpi.totalClients")}</p>
          <p className="portal-stat-card__value">{clients.length}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("clientManagement.kpi.withActiveHistory")}</p>
          <p className="portal-stat-card__value">
            {clients.filter((c) => c.communicationHistory?.length > 0).length}
          </p>
        </div>
      </div>

      {error && <p className="portal-error">{error}</p>}

      {isAdmin && (
        <section className="portal-section" style={{
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 10%, var(--color-bg)), var(--color-bg-alt))",
          borderColor: "var(--color-accent)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h2 className="portal-section__title" style={{ border: "none", marginBottom: "0.25rem" }}>
                {t("clientManagement.managerAccounts")}
              </h2>
              <p style={{ color: "var(--color-ink-soft)", fontSize: "0.875rem", margin: 0 }}>
                {t("clientManagement.managerAccountsNote")}
              </p>
            </div>
            <button className="btn btn-solid" onClick={() => setShowManagerForm((v) => !v)}>
              {showManagerForm ? t("clientManagement.cancel") : t("clientManagement.createManagerButton")}
            </button>
          </div>

          {managerMessage && (
            <p className={managerMessage.type === "error" ? "portal-error" : "portal-success"}
              style={{ marginTop: "1rem" }}>
              {managerMessage.text}
            </p>
          )}

          {showManagerForm && (
            <form onSubmit={handleCreateManager} style={{ marginTop: "1.25rem" }}>
              <div className="portal-form-row">
                <div className="field">
                  <label>{t("clientManagement.field.fullName")}</label>
                  <input value={managerForm.fullName} required
                    onChange={(e) => setManagerForm({ ...managerForm, fullName: e.target.value })} />
                </div>
                <div className="field">
                  <label>{t("clientManagement.field.email")}</label>
                  <input type="email" value={managerForm.email} required
                    onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })} />
                </div>
                <div className="field">
                  <label>{t("clientManagement.field.temporaryPassword")}</label>
                  <input type="password" value={managerForm.password} required
                    onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-solid" disabled={creatingManager}>
                {creatingManager ? t("clientManagement.creating") : t("clientManagement.createManagerAccountButton")}
              </button>
            </form>
          )}
        </section>
      )}

      {canCreate && (
        <div style={{ marginBottom: "1rem" }}>
          <button className="btn btn-solid" onClick={() => setShowNewForm((v) => !v)}>
            {showNewForm ? t("clientManagement.cancel") : t("clientManagement.registerNewClientButton")}
          </button>
        </div>
      )}

      {showNewForm && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("clientManagement.newClientRegistration")}</h2>
          <form onSubmit={handleCreate}>
            <div className="portal-form-row">
              <div className="field">
                <label>{t("clientManagement.field.fullName")}</label>
                <input value={newForm.contactName} required
                  onChange={(e) => setNewForm({ ...newForm, contactName: e.target.value })} />
              </div>
              <div className="field">
                <label>{t("clientManagement.field.email")}</label>
                <input type="email" value={newForm.contactEmail} required
                  onChange={(e) => setNewForm({ ...newForm, contactEmail: e.target.value })} />
              </div>
              <div className="field">
                <label>{t("clientManagement.field.phone")}</label>
                <input value={newForm.contactPhone}
                  onChange={(e) => setNewForm({ ...newForm, contactPhone: e.target.value })} />
              </div>
              <div className="field">
                <label>{t("clientManagement.field.propertyType")}</label>
                <select value={newForm.propertyType}
                  onChange={(e) => setNewForm({ ...newForm, propertyType: e.target.value })}>
                  {["House", "Apartment", "Office", "Retail", "Other"].map((pt) => (
                    <option key={pt} value={pt}>{t(`clientManagement.propertyType.${pt}`)}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-solid">{t("clientManagement.saveClientButton")}</button>
          </form>
        </section>
      )}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("clientManagement.clientDatabase")}</h2>
        <div className="portal-search-bar">
          <input placeholder={t("clientManagement.searchPlaceholder")}
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? <p className="portal-loading">{t("clientManagement.loadingClients")}</p> : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>{t("clientManagement.column.name")}</th><th>{t("clientManagement.column.email")}</th><th>{t("clientManagement.column.phone")}</th>
                  <th>{t("clientManagement.column.property")}</th><th>{t("clientManagement.column.history")}</th>
                  {canEdit && <th>{t("clientManagement.column.actions")}</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <Fragment key={c.id}>
                    <tr>
                      <td style={{ fontWeight: 500 }}>
                        {editingId === c.id
                          ? <input value={editBuf.contactName || ""}
                              onChange={(e) => setEditBuf({ ...editBuf, contactName: e.target.value })} />
                          : c.contactName}
                      </td>
                      <td style={{ color: "var(--color-ink-soft)" }}>
                        {editingId === c.id
                          ? <input value={editBuf.contactEmail || ""}
                              onChange={(e) => setEditBuf({ ...editBuf, contactEmail: e.target.value })} />
                          : c.contactEmail}
                      </td>
                      <td>{c.contactPhone}</td>
                      <td>{t(`clientManagement.propertyType.${c.propertyType}`, c.propertyType)}</td>
                      <td>
                        <button className="btn" style={{ padding: "0.25rem 0.7rem", fontSize: "0.8rem" }}
                          onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                          {expandedId === c.id ? t("clientManagement.hide") : t("clientManagement.viewHistoryCount", { count: c.communicationHistory?.length ?? 0 })}
                        </button>
                      </td>
                      {canEdit && (
                        <td>
                          {editingId === c.id
                            ? (
                              <div className="portal-actions">
                                <button className="btn btn-solid"
                                  style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                                  onClick={() => handleSave(c.id)}>{t("clientManagement.save")}</button>
                                <button className="btn"
                                  style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                                  onClick={() => setEditingId(null)}>{t("clientManagement.cancel")}</button>
                              </div>
                            ) : (
                              <button className="btn"
                                style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                                onClick={() => { setEditingId(c.id); setEditBuf({ contactName: c.contactName, contactEmail: c.contactEmail }); }}>
                                {t("clientManagement.edit")}
                              </button>
                            )}
                        </td>
                      )}
                    </tr>

                    {expandedId === c.id && (
                      <tr>
                        <td colSpan={canEdit ? 6 : 5}
                          style={{ padding: "1rem 1.25rem", background: "var(--color-bg-alt)" }}>
                          <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                            {t("clientManagement.communicationHistory")}
                          </p>
                          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 0.75rem", fontSize: "0.875rem" }}>
                            {(c.communicationHistory || []).map((h) => (
                              <li key={h.id}
                                style={{ padding: "0.35rem 0", borderBottom: "1px solid var(--color-line)" }}>
                                <span style={{ color: "var(--color-ink-soft)", marginRight: "0.5rem" }}>
                                  {h.recordedAt?.slice(0, 10)}
                                </span>
                                <span style={{ fontWeight: 500, marginRight: "0.5rem" }}>{h.channel}</span>
                                {h.noteEntry}
                              </li>
                            ))}
                            {!c.communicationHistory?.length && (
                              <li style={{ color: "var(--color-ink-soft)" }}>{t("clientManagement.noEntriesYet")}</li>
                            )}
                          </ul>
                          {canEdit && (
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <input style={{ flex: 1 }} placeholder={t("clientManagement.logNotePlaceholder")}
                                value={noteInput[c.id] || ""}
                                onChange={(e) => setNoteInput((n) => ({ ...n, [c.id]: e.target.value }))} />
                              <button className="btn btn-solid" onClick={() => handleAddNote(c.id)}>
                                {t("clientManagement.addNote")}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={canEdit ? 6 : 5} className="portal-empty">
                    {search ? t("clientManagement.noClientsMatchSearch") : t("clientManagement.noClientsRegisteredYet")}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
