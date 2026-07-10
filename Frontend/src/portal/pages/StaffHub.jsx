import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import * as staffActions from "../../api/actions/staff";
import * as designerActions from "../../api/actions/designerProfile";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

export function StaffHub() {
  const { t } = useTranslation("staff");
  const { showSuccess, showError } = useToast();
  const [staffs, setStaffs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [summaryLoadingId, setSummaryLoadingId] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [s, inv] = await Promise.all([
        staffActions.getMyStaffs(),
        staffActions.getPendingStaffInvitations(),
      ]);
      setStaffs(s);
      setInvitations(inv);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function openCreate() {
    setShowCreate(true);
    try {
      setCandidates(await designerActions.getDesignerCandidates());
    } catch (e) { showError(e.message || t("staffHub.errors.loadCandidates")); }
  }

  function toggleSelected(userId) {
    setSelected((s) => s.includes(userId) ? s.filter((id) => id !== userId) : [...s, userId]);
  }

  async function handleAiSummary(profileId) {
    setSummaryLoadingId(profileId);
    try {
      const result = await designerActions.getDesignerAiSummary(profileId);
      setSummaries((s) => ({ ...s, [profileId]: result.summary }));
    } catch (e) {
      showError(e.message || t("staffHub.errors.aiSummary"));
    } finally { setSummaryLoadingId(null); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const staff = await staffActions.createStaff(name);
      if (selected.length) {
        await staffActions.inviteToStaff(staff.id, selected);
      }
      showSuccess(t("staffHub.success.staffCreated"));
      setShowCreate(false);
      setName("");
      setSelected([]);
      setSummaries({});
      await load();
    } catch (e) {
      showError(e.message || t("staffHub.errors.createStaff"));
    } finally { setCreating(false); }
  }

  async function handleAccept(membershipId) {
    try {
      await staffActions.acceptStaffInvitation(membershipId);
      showSuccess(t("staffHub.success.invitationAccepted"));
      await load();
    } catch (e) { showError(e.message || t("staffHub.errors.acceptInvitation")); }
  }

  async function handleDecline(membershipId) {
    try {
      await staffActions.declineStaffInvitation(membershipId);
      showSuccess(t("staffHub.success.invitationDeclined"));
      await load();
    } catch (e) { showError(e.message || t("staffHub.errors.declineInvitation")); }
  }

  return (
    <div>
      <h1 className="portal-page-title">{t("staffHub.title")}</h1>
      <p className="portal-page-sub">{t("staffHub.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <button className="btn btn-solid" onClick={() => (showCreate ? setShowCreate(false) : openCreate())}>
          {showCreate ? t("staffHub.cancelButton") : t("staffHub.createButton")}
        </button>
      </div>

      {showCreate && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("staffHub.createForm.title")}</h2>
          <form onSubmit={handleCreate}>
            <div className="field field--full" style={{ maxWidth: 320, marginBottom: "1.25rem" }}>
              <label>{t("staffHub.createForm.teamNameLabel")}</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>{t("staffHub.createForm.inviteHeading")}</h3>
            <div className="portal-table-wrap">
              <table className="portal-table">
                <thead>
                  <tr><th></th><th>{t("staffHub.createForm.columns.name")}</th><th>{t("staffHub.createForm.columns.cvScore")}</th><th>{t("staffHub.createForm.columns.aiSummary")}</th></tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <input type="checkbox" checked={selected.includes(c.userId)}
                          onChange={() => toggleSelected(c.userId)} />
                      </td>
                      <td style={{ fontWeight: 500 }}>{c.fullName}</td>
                      <td>{c.cvStrengthScore != null ? `${c.cvStrengthScore}/10` : "—"}</td>
                      <td>
                        <button type="button" className="btn" style={{ fontSize: "0.78rem", padding: "0.2rem 0.6rem" }}
                          disabled={summaryLoadingId === c.id}
                          onClick={() => handleAiSummary(c.id)}>
                          {summaryLoadingId === c.id ? t("staffHub.createForm.generating") : t("staffHub.createForm.aiSummaryButton")}
                        </button>
                        {summaries[c.id] && (
                          <p style={{ fontSize: "0.82rem", color: "var(--color-ink-soft)", marginTop: "0.35rem", maxWidth: 320 }}>
                            {summaries[c.id]}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!candidates.length && (
                    <tr><td colSpan={4} className="portal-empty">{t("staffHub.createForm.noCandidates")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <button type="submit" className="btn btn-solid" style={{ marginTop: "1rem" }} disabled={creating || !name}>
              {creating ? t("staffHub.createForm.creating") : t("staffHub.createForm.submitButton")}
            </button>
          </form>
        </section>
      )}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("staffHub.invitations.title")}</h2>
        {loading ? <p className="portal-loading">{t("staffHub.invitations.loading")}</p> : !invitations.length ? (
          <p className="portal-empty">{t("staffHub.invitations.empty")}</p>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead><tr><th>{t("staffHub.invitations.columns.staffTeam")}</th><th>{t("staffHub.invitations.columns.invited")}</th><th>{t("staffHub.invitations.columns.actions")}</th></tr></thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 500 }}>{inv.staffName}</td>
                    <td>{new Date(inv.invitedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="portal-actions">
                        <button className="btn btn-solid" style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                          onClick={() => handleAccept(inv.id)}>{t("staffHub.invitations.accept")}</button>
                        <button className="btn" style={{ fontSize: "0.78rem", padding: "0.25rem 0.65rem" }}
                          onClick={() => handleDecline(inv.id)}>{t("staffHub.invitations.decline")}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("staffHub.myStaffs.title")}</h2>
        {loading ? <p className="portal-loading">{t("staffHub.myStaffs.loading")}</p> : !staffs.length ? (
          <p className="portal-empty">{t("staffHub.myStaffs.empty")}</p>
        ) : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead><tr><th>{t("staffHub.myStaffs.columns.name")}</th><th>{t("staffHub.myStaffs.columns.creator")}</th><th>{t("staffHub.myStaffs.columns.members")}</th><th>{t("staffHub.myStaffs.columns.assignedBalance")}</th><th></th></tr></thead>
              <tbody>
                {staffs.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td>{s.creatorName}</td>
                    <td>{s.members.length}</td>
                    <td>{Number(s.assignedBalance).toLocaleString()}</td>
                    <td><Link className="btn" to={`/portal/staff/${s.id}`}>{t("staffHub.myStaffs.view")}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
