import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../../components/toast/ToastContext";
import * as staffActions from "../../api/actions/staff";
import * as docActions from "../../api/actions/documents";
import "../PortalLayout.css";

const TABS = ["Account", "Projects", "Design Files", "Messaging"];

export function StaffDetail() {
  const { t } = useTranslation("staff");
  const { id } = useParams();
  const staffId = Number(id);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [staff, setStaff] = useState(null);
  const [account, setAccount] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Account");
  const [splitting, setSplitting] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [docs, setDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [fileLabel, setFileLabel] = useState("No file chosen");
  const [uploading, setUploading] = useState(false);

  const [messages, setMessages] = useState([]);
  const [messageBody, setMessageBody] = useState("");
  const pollRef = useRef(null);
  const lastMessageAt = useRef(null);

  const isCreator = staff && user && staff.creatorId === user.userId;

  useEffect(() => {
    load();
  }, [staffId]);

  async function load() {
    setLoading(true);
    try {
      const [s, a, p] = await Promise.all([
        staffActions.getStaffById(staffId),
        staffActions.getStaffAccount(staffId),
        staffActions.getStaffProjects(staffId),
      ]);
      setStaff(s);
      setAccount(a);
      setProjects(p);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (activeTab !== "Messaging") return;
    loadMessages();
    pollRef.current = setInterval(loadMessages, 7000);
    return () => clearInterval(pollRef.current);
  }, [activeTab, staffId]);

  async function loadMessages() {
    try {
      const msgs = await staffActions.getStaffMessages(staffId);
      setMessages(msgs);
      if (msgs.length) lastMessageAt.current = msgs[msgs.length - 1].createdAt;
    } catch (e) { /* silent on poll */ }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!messageBody.trim()) return;
    try {
      await staffActions.postStaffMessage(staffId, messageBody.trim());
      setMessageBody("");
      await loadMessages();
    } catch (e) { showError(e.message || t("staffDetail.errors.sendMessage")); }
  }

  async function handleSplit() {
    setSplitting(true);
    try {
      const updated = await staffActions.splitStaffBalance(staffId);
      setStaff(updated);
      const a = await staffActions.getStaffAccount(staffId);
      setAccount(a);
      showSuccess(t("staffDetail.success.splitBalance"));
    } catch (e) { showError(e.message || t("staffDetail.errors.splitBalance")); }
    finally { setSplitting(false); }
  }

  async function loadDocsForProject(projectId) {
    setSelectedProjectId(projectId);
    if (!projectId) { setDocs([]); return; }
    try {
      setDocs(await docActions.getDocumentsByProject(projectId));
    } catch (e) { showError(e.message || t("staffDetail.errors.loadDesignFiles")); }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setFileLabel(f.name); }
  }

  async function handleUploadFile() {
    if (!file || !selectedProjectId) return;
    setUploading(true);
    try {
      const created = await docActions.uploadDocumentFile(selectedProjectId, file);
      setDocs((d) => [...d, created]);
      setFile(null);
      setFileLabel(t("staffDetail.designFiles.noFileChosen"));
      showSuccess(t("staffDetail.success.uploadFile"));
    } catch (e) { showError(e.message || t("staffDetail.errors.uploadFile")); }
    finally { setUploading(false); }
  }

  if (loading) return <p className="portal-loading">{t("staffDetail.loading")}</p>;
  if (error) return <p className="portal-error">{error}</p>;
  if (!staff) return null;

  const TAB_LABELS = {
    Account: t("staffDetail.tabs.account"),
    Projects: t("staffDetail.tabs.projects"),
    "Design Files": t("staffDetail.tabs.designFiles"),
    Messaging: t("staffDetail.tabs.messaging"),
  };

  return (
    <div>
      <h1 className="portal-page-title">{staff.name}</h1>
      <p className="portal-page-sub">{t("staffDetail.subtitle", { creatorName: staff.creatorName, memberCount: staff.members.length })}</p>

      <div className="staff-tabs">
        {TABS.map((tab) => (
          <button key={tab} type="button" className={"staff-tab" + (activeTab === tab ? " is-active" : "")}
            onClick={() => setActiveTab(tab)}>
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {activeTab === "Account" && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("staffDetail.account.title")}</h2>
          <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
            <div className="portal-stat-card">
              <div className="portal-stat-card__label">{t("staffDetail.account.pendingAmount")}</div>
              <div className="portal-stat-card__value">{Number(account?.pendingAmount || 0).toLocaleString()}</div>
            </div>
            <div className="portal-stat-card">
              <div className="portal-stat-card__label">{t("staffDetail.account.assignedAmount")}</div>
              <div className="portal-stat-card__value portal-stat-card__value--accent">
                {Number(account?.assignedBalance || 0).toLocaleString()}
              </div>
            </div>
          </div>
          {isCreator && (
            <button className="btn btn-solid" disabled={splitting || Number(account?.assignedBalance || 0) <= 0}
              onClick={handleSplit}>
              {splitting ? t("staffDetail.account.splitting") : t("staffDetail.account.splitButton")}
            </button>
          )}
        </section>
      )}

      {activeTab === "Projects" && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("staffDetail.projects.title")}</h2>
          {!projects.length ? <p className="portal-empty">{t("staffDetail.projects.empty")}</p> : (
            <div className="portal-table-wrap">
              <table className="portal-table">
                <thead><tr><th>{t("staffDetail.projects.columns.client")}</th><th>{t("staffDetail.projects.columns.request")}</th><th>{t("staffDetail.projects.columns.progress")}</th><th>{t("staffDetail.projects.columns.status")}</th></tr></thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id}>
                      <td>{p.clientName}</td>
                      <td>{p.requestName}</td>
                      <td>{p.visualProgressPercent}%</td>
                      <td><span className="badge badge--progress">{t(`staffDetail.projectStatus.${p.operationalStatus}`, p.operationalStatus)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "Design Files" && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("staffDetail.designFiles.title")}</h2>
          <div className="portal-form-row">
            <div className="field">
              <label>{t("staffDetail.designFiles.projectLabel")}</label>
              <select value={selectedProjectId} onChange={(e) => loadDocsForProject(e.target.value)}>
                <option value="">{t("staffDetail.designFiles.selectProject")}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.requestName || t("staffDetail.designFiles.projectFallback", { id: p.id })}</option>
                ))}
              </select>
            </div>
            {selectedProjectId && (
              <div className="field">
                <label>{t("staffDetail.designFiles.uploadLabel")}</label>
                <input type="file" onChange={handleFileChange} />
                <small style={{ color: "var(--color-ink-soft)", display: "block", marginTop: "0.25rem" }}>{fileLabel}</small>
              </div>
            )}
          </div>
          {selectedProjectId && (
            <button className="btn btn-solid" disabled={!file || uploading} onClick={handleUploadFile}>
              {uploading ? t("staffDetail.designFiles.uploading") : t("staffDetail.designFiles.uploadButton")}
            </button>
          )}

          {selectedProjectId && (
            <div className="portal-table-wrap" style={{ marginTop: "1.5rem" }}>
              <table className="portal-table">
                <thead><tr><th>{t("staffDetail.designFiles.columns.file")}</th><th>{t("staffDetail.designFiles.columns.version")}</th><th>{t("staffDetail.designFiles.columns.status")}</th></tr></thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {d.fileStorageUrl?.split("/").pop()}
                      </td>
                      <td>v{d.fileVersion}</td>
                      <td>
                        <span className={`badge badge--${d.approvalBadgeStatus === "APPROVED" ? "approved" : d.approvalBadgeStatus === "REJECTED" ? "cancelled" : "pending"}`}>
                          {t(`staffDetail.approvalStatus.${d.approvalBadgeStatus}`, d.approvalBadgeStatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!docs.length && <tr><td colSpan={3} className="portal-empty">{t("staffDetail.designFiles.empty")}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "Messaging" && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("staffDetail.messaging.title")}</h2>
          <div className="staff-chat">
            {messages.map((m) => {
              const mine = m.senderId === user?.userId;
              return (
                <div key={m.id} className={"staff-chat__row" + (mine ? " staff-chat__row--mine" : " staff-chat__row--theirs")}>
                  <div className="staff-chat__bubble">
                    {!mine && <p className="staff-chat__sender">{m.senderName}</p>}
                    <p className="staff-chat__msg">{m.body}</p>
                  </div>
                  <p className="staff-chat__time">{new Date(m.createdAt).toLocaleTimeString()}</p>
                </div>
              );
            })}
            {!messages.length && <p className="portal-empty">{t("staffDetail.messaging.empty")}</p>}
          </div>
          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.6rem" }}>
            <input type="text" style={{ flex: 1 }} placeholder={t("staffDetail.messaging.placeholder")}
              value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
            <button type="submit" className="btn btn-solid">{t("staffDetail.messaging.send")}</button>
          </form>
        </section>
      )}
    </div>
  );
}
