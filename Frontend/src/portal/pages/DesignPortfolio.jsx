import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as docActions from "../../api/actions/documents";
import { getAllProjects, getMyProjects } from "../../api/actions/projects";
import "../PortalLayout.css";

const APPROVAL_BADGE = { PENDING: "pending", APPROVED: "approved", REJECTED: "cancelled" };

export function DesignPortfolio() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const [docs, setDocs]         = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [form, setForm] = useState({ projectId: "", file: null });
  const [fileLabel, setFileLabel] = useState(null);
  const [showForm, setShowForm]   = useState(false);
  const [uploading, setUploading] = useState(false);

  const isStaff     = user?.role === "STAFF";
  const canUpload   = user?.role === "STAFF" || user?.role === "PROJECT_MANAGER" || user?.role === "ADMIN";
  const canApprove  = user?.role === "PROJECT_MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    async function load() {
      try {
        const [d, p] = await Promise.all([
          docActions.getAllDocuments(),
          isStaff ? getMyProjects() : getAllProjects(),
        ]);
        setDocs(d);
        setProjects(p);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) { setFileLabel(f.name); setForm((p) => ({ ...p, file: f })); }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!form.projectId || !form.file) return;
    setUploading(true);
    try {
      const created = await docActions.uploadDocumentFile(Number(form.projectId), form.file);
      setDocs((d) => [...d, created]);
      setForm({ projectId: "", file: null });
      setFileLabel(null);
      setShowForm(false);
    } catch (e) { setError(e.message); }
    finally { setUploading(false); }
  }

  async function handleApprove(id) {
    try {
      const updated = await docActions.approveDocument(id);
      setDocs((d) => d.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  async function handleReject(id) {
    try {
      const updated = await docActions.rejectDocument(id);
      setDocs((d) => d.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  async function handleNewVersion(id) {
    try {
      const updated = await docActions.incrementDocumentVersion(id);
      setDocs((d) => d.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  // Group by project
  const grouped = docs.reduce((acc, d) => {
    const key = projects.find((p) => p.id === d.projectId)?.clientName || t("designPortfolio.projectFallbackName", { id: d.projectId });
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  const pending  = docs.filter((d) => d.approvalBadgeStatus === "PENDING").length;
  const approved = docs.filter((d) => d.approvalBadgeStatus === "APPROVED").length;

  return (
    <div>
      <h1 className="portal-page-title">{t("designPortfolio.title")}</h1>
      <p className="portal-page-sub">{t("designPortfolio.subtitle")}</p>

      <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("designPortfolio.totalDocuments")}</p>
          <p className="portal-stat-card__value">{docs.length}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("designPortfolio.approved")}</p>
          <p className="portal-stat-card__value portal-stat-card__value--accent">{approved}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("designPortfolio.awaitingReview")}</p>
          <p className="portal-stat-card__value">{pending}</p>
        </div>
      </div>

      {error && <p className="portal-error">{error}</p>}

      {canUpload && (
        <div style={{ marginBottom: "1rem" }}>
          <button className="btn btn-solid" onClick={() => setShowForm((v) => !v)}>
            {showForm ? t("designPortfolio.cancel") : t("designPortfolio.uploadDesignFile")}
          </button>
        </div>
      )}

      {showForm && canUpload && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("designPortfolio.uploadSectionTitle")}</h2>
          <form onSubmit={handleUpload}>
            <div className="portal-form-row">
              <div className="field">
                <label>{t("designPortfolio.projectLabel")}</label>
                <select value={form.projectId} required
                  onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">{t("designPortfolio.selectProject")}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.requestName || p.clientName}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("designPortfolio.fileLabel")}</label>
                <input type="file" onChange={handleFileChange} />
                <small style={{ color: "var(--color-ink-soft)", display: "block", marginTop: "0.25rem" }}>
                  {fileLabel || t("designPortfolio.noFileChosen")}
                </small>
              </div>
            </div>
            <button type="submit" className="btn btn-solid" disabled={uploading}>
              {uploading ? t("designPortfolio.uploading") : t("designPortfolio.upload")}
            </button>
          </form>
        </section>
      )}

      {loading ? <p className="portal-loading">{t("designPortfolio.loading")}</p> : (
        Object.entries(grouped).length === 0
          ? <p className="portal-empty">{t("designPortfolio.noDesignFiles")}</p>
          : Object.entries(grouped).map(([projectName, files]) => (
              <section key={projectName} className="portal-section">
                <h2 className="portal-section__title">{projectName}</h2>
                <div className="portal-table-wrap">
                  <table className="portal-table">
                    <thead>
                      <tr>
                        <th>{t("designPortfolio.columnFile")}</th><th>{t("designPortfolio.columnVersion")}</th>
                        <th>{t("designPortfolio.columnStatus")}</th>{canApprove && <th>{t("designPortfolio.columnActions")}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((d) => (
                        <tr key={d.id}>
                          <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                            {d.fileStorageUrl?.split("/").pop() || d.fileStorageUrl}
                          </td>
                          <td>
                            <span style={{
                              background: "var(--color-bg-alt)",
                              border: "1px solid var(--color-line)",
                              borderRadius: 999,
                              padding: "0.15rem 0.6rem",
                              fontSize: "0.8rem", fontWeight: 600,
                            }}>
                              v{d.fileVersion}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge--${APPROVAL_BADGE[d.approvalBadgeStatus] || "draft"}`}>
                              {d.approvalBadgeStatus === "PENDING" ? t("designPortfolio.statusPending")
                                : d.approvalBadgeStatus === "APPROVED" ? t("designPortfolio.statusApproved")
                                : d.approvalBadgeStatus === "REJECTED" ? t("designPortfolio.statusRejected")
                                : d.approvalBadgeStatus}
                            </span>
                          </td>
                          {canApprove && (
                            <td>
                              <div className="portal-actions">
                                <button className="btn"
                                  style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem" }}
                                  disabled={d.approvalBadgeStatus === "APPROVED"}
                                  onClick={() => handleApprove(d.id)}>
                                  {t("designPortfolio.approveButton")}
                                </button>
                                <button className="btn"
                                  style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem" }}
                                  disabled={d.approvalBadgeStatus === "REJECTED"}
                                  onClick={() => handleReject(d.id)}>
                                  {t("designPortfolio.rejectButton")}
                                </button>
                                {canUpload && (
                                  <button className="btn"
                                    style={{ fontSize: "0.75rem", padding: "0.2rem 0.55rem" }}
                                    onClick={() => handleNewVersion(d.id)}>
                                    {t("designPortfolio.newVersionButton")}
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
      )}
    </div>
  );
}
