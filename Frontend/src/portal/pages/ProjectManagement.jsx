import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as projectActions from "../../api/actions/projects";
import * as requestActions from "../../api/actions/requests";
import * as designerActions from "../../api/actions/designerProfile";
import * as staffActions from "../../api/actions/staff";
import * as docActions from "../../api/actions/documents";
import { getClientByUser } from "../../api/actions/clients";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

const STATUS_BADGE = {
  NOT_READY: "not-ready", PENDING: "pending", READY: "ready",
  PLANNING: "pending", ACTIVE: "active", ON_HOLD: "review",
  COMPLETED: "completed", CANCELLED: "cancelled",
};

const STATUS_LABEL_KEYS = {
  NOT_READY: "projectManagement.status.notReady",
  PENDING: "projectManagement.status.pending",
  READY: "projectManagement.status.ready",
  PLANNING: "projectManagement.status.planning",
  ACTIVE: "projectManagement.status.active",
  ON_HOLD: "projectManagement.status.onHold",
  COMPLETED: "projectManagement.status.completed",
  CANCELLED: "projectManagement.status.cancelled",
};

const FINISHED_STATUSES = ["COMPLETED", "CANCELLED"];
const ALL_STATUSES = ["NOT_READY", "PENDING", "READY", "PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

function UnassignedProjectsPanel() {
  const { t } = useTranslation("staff");
  const { showSuccess, showError } = useToast();
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState({});
  const [assessingId, setAssessingId] = useState(null);
  const [modeById, setModeById] = useState({});
  const [choiceById, setChoiceById] = useState({});
  const [individualCandidates, setIndividualCandidates] = useState(null);
  const [staffCandidates, setStaffCandidates] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setUnassigned(await projectActions.getUnassignedProjects());
    } catch (e) { showError(e.message || t("projectManagement.unassigned.loadError")); }
    finally { setLoading(false); }
  }

  async function handleAssess(projectId) {
    setAssessingId(projectId);
    try {
      const result = await projectActions.assessProjectRequirement(projectId);
      setAssessments((a) => ({ ...a, [projectId]: result }));
    } catch (e) { showError(e.message || t("projectManagement.unassigned.assessmentFailed")); }
    finally { setAssessingId(null); }
  }

  async function chooseMode(projectId, mode) {
    setModeById((m) => ({ ...m, [projectId]: mode }));
    if (mode === "INDIVIDUAL" && individualCandidates === null) {
      try {
        const profiles = await designerActions.getAllDesignerProfiles();
        setIndividualCandidates(profiles.filter((p) => p.approvalStatus === "APPROVED"));
      } catch (e) { showError(e.message || t("projectManagement.unassigned.loadCandidatesError")); }
    }
    if (mode === "STAFF" && staffCandidates === null) {
      try {
        setStaffCandidates(await staffActions.getAllStaffs());
      } catch (e) { showError(e.message || t("projectManagement.unassigned.loadStaffError")); }
    }
  }

  async function handleAssign(projectId) {
    const mode = modeById[projectId];
    const choice = choiceById[projectId];
    if (!mode || !choice) return;
    setAssigningId(projectId);
    try {
      await projectActions.assignProject(projectId, mode === "INDIVIDUAL"
        ? { assignmentType: "INDIVIDUAL", designerUserId: Number(choice) }
        : { assignmentType: "STAFF", staffId: Number(choice) });
      showSuccess(t("projectManagement.unassigned.assignSuccess"));
      setUnassigned((u) => u.filter((p) => p.id !== projectId));
    } catch (e) { showError(e.message || t("projectManagement.unassigned.assignError")); }
    finally { setAssigningId(null); }
  }

  if (loading) return <p className="portal-loading">{t("projectManagement.unassigned.loading")}</p>;
  if (!unassigned.length) return null;

  return (
    <section className="portal-section">
      <h2 className="portal-section__title">{t("projectManagement.unassigned.title")}</h2>
      {unassigned.map((p) => {
        const assessment = assessments[p.id];
        const mode = modeById[p.id];
        return (
          <div key={p.id} style={{ padding: "1rem 0", borderBottom: "1px solid var(--color-line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 600 }}>{p.requestName || p.clientName || t("projectManagement.untitledProject")}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
                  {t("projectManagement.unassigned.invested", { amount: Number(p.investedAmount || 0).toLocaleString() })}
                </p>
              </div>
              <button className="btn" disabled={assessingId === p.id} onClick={() => handleAssess(p.id)}>
                {assessingId === p.id ? t("projectManagement.unassigned.assessing") : t("projectManagement.unassigned.aiRequirementAssessment")}
              </button>
            </div>

            {assessment && (
              <div style={{
                marginTop: "0.75rem", padding: "0.75rem 1rem", borderRadius: 12,
                background: "var(--color-bg-alt)", border: "1px solid var(--color-line)",
                borderLeft: "3px solid var(--color-accent)",
              }}>
                <p style={{ fontWeight: 600 }}>
                  {t("projectManagement.unassigned.aiRecommends", { mode: assessment.recommendedMode, score: assessment.complexityScore })}
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)", marginTop: "0.3rem" }}>
                  {assessment.reasoning}
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem" }}>
              <button className="btn" style={mode === "INDIVIDUAL" ? { borderColor: "var(--color-accent)" } : {}}
                onClick={() => chooseMode(p.id, "INDIVIDUAL")}>{t("projectManagement.unassigned.selfCandidate")}</button>
              <button className="btn" style={mode === "STAFF" ? { borderColor: "var(--color-accent)" } : {}}
                onClick={() => chooseMode(p.id, "STAFF")}>{t("projectManagement.unassigned.staff")}</button>
            </div>

            {mode === "INDIVIDUAL" && (
              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem", alignItems: "center" }}>
                <select value={choiceById[p.id] || ""} onChange={(e) => setChoiceById((c) => ({ ...c, [p.id]: e.target.value }))}>
                  <option value="">{t("projectManagement.unassigned.selectApprovedDesigner")}</option>
                  {(individualCandidates || []).map((d) => (
                    <option key={d.userId} value={d.userId}>{d.fullName}</option>
                  ))}
                </select>
                <button className="btn btn-solid" disabled={!choiceById[p.id] || assigningId === p.id}
                  onClick={() => handleAssign(p.id)}>
                  {assigningId === p.id ? t("projectManagement.unassigned.assigning") : t("projectManagement.unassigned.assign")}
                </button>
              </div>
            )}

            {mode === "STAFF" && (
              <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.75rem", alignItems: "center" }}>
                <select value={choiceById[p.id] || ""} onChange={(e) => setChoiceById((c) => ({ ...c, [p.id]: e.target.value }))}>
                  <option value="">{t("projectManagement.unassigned.selectStaffTeam")}</option>
                  {(staffCandidates || []).map((s) => (
                    <option key={s.id} value={s.id}>{t("projectManagement.unassigned.staffOptionLabel", { name: s.name, count: s.members.length })}</option>
                  ))}
                </select>
                <button className="btn btn-solid" disabled={!choiceById[p.id] || assigningId === p.id}
                  onClick={() => handleAssign(p.id)}>
                  {assigningId === p.id ? t("projectManagement.unassigned.assigning") : t("projectManagement.unassigned.assign")}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

function DesignerProjectsView() {
  const { t } = useTranslation("staff");
  const { showSuccess, showError } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [requestDetails, setRequestDetails] = useState({});
  const [photoFiles, setPhotoFiles] = useState({});
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    projectActions.getMyProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function toggleOpen(p) {
    const nextOpen = openId === p.id ? null : p.id;
    setOpenId(nextOpen);
    if (nextOpen && p.requestId && !requestDetails[p.requestId]) {
      try {
        const detail = await requestActions.getRequestById(p.requestId);
        setRequestDetails((d) => ({ ...d, [p.requestId]: detail }));
      } catch (e) { setError(e.message); }
    }
  }

  async function handleToggleMilestone(projectId, updatedMilestones) {
    try {
      const result = await projectActions.updateMilestones(projectId, updatedMilestones);
      setProjects((list) => list.map((x) => x.id === projectId ? result : x));
    } catch (e) { setError(e.message); }
  }

  function handlePhotoChange(projectId, file) {
    setPhotoFiles((f) => ({ ...f, [projectId]: file }));
  }

  async function handleUploadPhoto(projectId) {
    const file = photoFiles[projectId];
    if (!file) return;
    setUploadingId(projectId);
    try {
      await docActions.uploadDocumentFile(projectId, file);
      setPhotoFiles((f) => ({ ...f, [projectId]: null }));
      showSuccess(t("projectManagement.designerView.photoUploadSuccess"));
    } catch (e) {
      showError(e.message || t("projectManagement.designerView.photoUploadError"));
    } finally {
      setUploadingId(null);
    }
  }

  if (loading) return <p className="portal-loading">{t("projectManagement.designerView.loading")}</p>;

  return (
    <div>
      <h1 className="portal-page-title">{t("projectManagement.designerView.title")}</h1>
      <p className="portal-page-sub">{t("projectManagement.designerView.subtitle")}</p>
      {error && <p className="portal-error">{error}</p>}

      {!projects.length ? <p className="portal-empty">{t("projectManagement.designerView.empty")}</p> : (
        projects.map((p) => {
          const open = openId === p.id;
          const detail = p.requestId ? requestDetails[p.requestId] : null;
          const milestones = p.milestones || [];
          const achievedCount = milestones.filter((m) => m.isAchieved).length;
          return (
            <section key={p.id} className="portal-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 className="portal-section__title" style={{ border: "none", marginBottom: "0.4rem" }}>
                    {p.requestName || t("projectManagement.untitledProject")}
                  </h2>
                  <span className={`badge badge--${STATUS_BADGE[p.operationalStatus] || "draft"}`}>
                    {t(STATUS_LABEL_KEYS[p.operationalStatus] || p.operationalStatus)}
                  </span>
                  <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
                    {t("projectManagement.milestonesComplete", { achieved: achievedCount, total: milestones.length })}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--color-accent)" }}>
                  {p.visualProgressPercent}%
                </div>
              </div>

              <div style={{ marginTop: "1.25rem" }}>
                <h3 className="portal-section__title" style={{ fontSize: "0.95rem", border: "none", marginBottom: "0.5rem" }}>
                  {t("projectManagement.designerView.progressTitle")}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem" }}>
                  {milestones.map((m, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.45rem 0", borderBottom: "1px solid var(--color-line)" }}>
                      <input
                        type="checkbox"
                        checked={m.isAchieved}
                        onChange={() => {
                          const updated = milestones.map((x, idx) =>
                            idx === i ? { ...x, isAchieved: !x.isAchieved } : x
                          );
                          handleToggleMilestone(p.id, updated);
                        }}
                      />
                      <span style={{
                        flex: 1,
                        textDecoration: m.isAchieved ? "line-through" : "none",
                        color: m.isAchieved ? "var(--color-ink-soft)" : "var(--color-ink)",
                      }}>
                        {m.name}
                      </span>
                    </li>
                  ))}
                  {!milestones.length && (
                    <li style={{ color: "var(--color-ink-soft)", fontSize: "0.875rem" }}>
                      {t("projectManagement.noMilestones")}
                    </li>
                  )}
                </ul>

                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoChange(p.id, e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    className="btn btn-solid"
                    disabled={!photoFiles[p.id] || uploadingId === p.id}
                    onClick={() => handleUploadPhoto(p.id)}
                  >
                    {uploadingId === p.id
                      ? t("projectManagement.designerView.uploadingPhoto")
                      : t("projectManagement.designerView.uploadPhoto")}
                  </button>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)", marginTop: "-0.75rem", marginBottom: "1.25rem" }}>
                  {t("projectManagement.designerView.photoHint")}
                </p>
              </div>

              <button type="button" className="btn" style={{ fontSize: "0.8rem" }}
                onClick={() => toggleOpen(p)}>
                {open ? t("projectManagement.collapse") : t("projectManagement.designerView.viewClientRequestDetails")}
              </button>

              {open && (
                <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--color-line)" }}>
                  {!detail ? <p className="portal-loading">{t("projectManagement.designerView.loadingDetails")}</p> : (
                    <div className="portal-form-row">
                      <div className="field"><label>{t("projectManagement.designerView.roomType")}</label><input disabled value={detail.roomType || ""} /></div>
                      <div className="field"><label>{t("projectManagement.designerView.budget")}</label><input disabled value={Number(detail.budgetLimit || 0).toLocaleString()} /></div>
                      <div className="field"><label>{t("projectManagement.designerView.timeline")}</label><input disabled value={detail.timeline || ""} /></div>
                      <div className="field field--full">
                        <label>{t("projectManagement.designerView.requestDetails")}</label>
                        <textarea disabled rows={3} value={detail.requestDetails || ""} />
                      </div>
                      <div className="field">
                        <label>{t("projectManagement.designerView.styleTags")}</label>
                        <input disabled value={(detail.styleTags || []).join(", ")} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}

export function ProjectManagement() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [newMilestone, setNewMilestone] = useState({});
  const [openId, setOpenId]         = useState(null);
  const [tab, setTab]               = useState("ACTIVE");

  const isClient = user?.role === "CLIENT";
  const isAdmin  = user?.role === "ADMIN";
  const isPM     = user?.role === "PROJECT_MANAGER";
  const isStaff  = user?.role === "STAFF";

  useEffect(() => {
    if (isStaff) return;
    async function load() {
      try {
        if (isClient) {
          const clientProfile = await getClientByUser(user.userId);
          const p = await projectActions.getProjectsByClient(clientProfile.id);
          setProjects(p);
        } else {
          const p = await projectActions.getAllProjects();
          setProjects(p);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (isStaff) return <DesignerProjectsView />;

  async function handleToggleMilestone(projectId, updatedMilestones) {
    try {
      const result = await projectActions.updateMilestones(projectId, updatedMilestones);
      setProjects((p) => p.map((x) => x.id === projectId ? result : x));
    } catch (e) { setError(e.message); }
  }

  async function handleAddMilestone(e, projectId, currentMilestones) {
    e.preventDefault();
    const name = (newMilestone[projectId] || "").trim();
    if (!name) return;
    const updated = [...currentMilestones, { name, isAchieved: false }];
    try {
      const result = await projectActions.updateMilestones(projectId, updated);
      setProjects((p) => p.map((x) => x.id === projectId ? result : x));
      setNewMilestone((m) => ({ ...m, [projectId]: "" }));
    } catch (e) { setError(e.message); }
  }

  async function handleStatusChange(id, operationalStatus) {
    try {
      const result = await projectActions.updateProjectStatus(id, operationalStatus);
      setProjects((p) => p.map((x) => x.id === id ? result : x));
    } catch (e) { setError(e.message); }
  }

  const activeProjects   = projects.filter((p) => !FINISHED_STATUSES.includes(p.operationalStatus));
  const visibleProjects  = tab === "ACTIVE" ? activeProjects : projects;

  return (
    <div>
      <h1 className="portal-page-title">
        {isClient ? t("projectManagement.myProjectsTitle") : t("projectManagement.title")}
      </h1>
      <p className="portal-page-sub">
        {isClient
          ? t("projectManagement.clientSubtitle")
          : t("projectManagement.subtitle")}
      </p>

      {error && <p className="portal-error">{error}</p>}

      {(isAdmin || isPM) && <UnassignedProjectsPanel />}

      <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("projectManagement.stats.activeProjects")}</p>
          <p className="portal-stat-card__value">{activeProjects.length}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("projectManagement.stats.totalProjects")}</p>
          <p className="portal-stat-card__value">{projects.length}</p>
        </div>
      </div>

      <div className="gallery-tabs" style={{ marginBottom: "1.5rem" }}>
        <button type="button" className={"gallery-tab" + (tab === "ACTIVE" ? " is-active" : "")}
          onClick={() => setTab("ACTIVE")}>
          {t("projectManagement.tabs.active", { count: activeProjects.length })}
        </button>
        <button type="button" className={"gallery-tab" + (tab === "ALL" ? " is-active" : "")}
          onClick={() => setTab("ALL")}>
          {t("projectManagement.tabs.all", { count: projects.length })}
        </button>
      </div>

      {loading ? <p className="portal-loading">{t("projectManagement.loading")}</p> : (
        visibleProjects.map((p) => {
          const open = openId === p.id;
          const milestones = p.milestones || [];
          const achievedCount = milestones.filter((m) => m.isAchieved).length;

          return (
            <section key={p.id} className="portal-section">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 className="portal-section__title" style={{ border: "none", marginBottom: "0.4rem" }}>
                    {p.requestName || p.clientName || t("projectManagement.untitledProject")}
                  </h2>
                  <span className={`badge badge--${STATUS_BADGE[p.operationalStatus] || "draft"}`}>
                    {t(STATUS_LABEL_KEYS[p.operationalStatus] || p.operationalStatus)}
                  </span>
                  <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
                    {t("projectManagement.milestonesComplete", { achieved: achievedCount, total: milestones.length })}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--color-accent)", lineHeight: 1 }}>
                    {p.visualProgressPercent}%
                  </div>
                  <div className="progress-bar" style={{ width: 120, height: 6, marginTop: 6 }}>
                    <div className="progress-bar__fill" style={{ width: p.visualProgressPercent + "%" }} />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <button type="button" className="btn" style={{ fontSize: "0.8rem" }}
                  onClick={() => setOpenId(open ? null : p.id)}>
                  {open ? t("projectManagement.collapse") : t("projectManagement.viewTasks")}
                </button>
              </div>

              {open && (
                <div style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid var(--color-line)" }}>
                  {!isClient && (
                    <p style={{ fontSize: "0.875rem", color: "var(--color-ink-soft)", marginTop: 0, marginBottom: "1.25rem" }}>
                      {t("projectManagement.client")} <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>{p.clientName}</span>
                    </p>
                  )}

                  {isAdmin && (
                    <div className="field" style={{ maxWidth: 240, marginBottom: "1.25rem" }}>
                      <label>{t("projectManagement.projectStatus")}</label>
                      <select value={p.operationalStatus}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}>
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{t(STATUS_LABEL_KEYS[s] || s)}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1rem" }}>
                    {milestones.map((m, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem",
                        padding: "0.45rem 0", borderBottom: "1px solid var(--color-line)" }}>
                        <input
                          type="checkbox"
                          checked={m.isAchieved}
                          disabled={isClient}
                          onChange={() => {
                            const updated = milestones.map((x, idx) =>
                              idx === i ? { ...x, isAchieved: !x.isAchieved } : x
                            );
                            handleToggleMilestone(p.id, updated);
                          }}
                        />
                        <span style={{
                          flex: 1,
                          textDecoration: m.isAchieved ? "line-through" : "none",
                          color: m.isAchieved ? "var(--color-ink-soft)" : "var(--color-ink)",
                        }}>
                          {m.name}
                        </span>
                      </li>
                    ))}
                    {!milestones.length && (
                      <li style={{ color: "var(--color-ink-soft)", fontSize: "0.875rem" }}>
                        {t("projectManagement.noMilestones")}
                      </li>
                    )}
                  </ul>

                  {isAdmin && (
                    <form onSubmit={(e) => handleAddMilestone(e, p.id, milestones)}
                      style={{ display: "flex", gap: "0.5rem" }}>
                      <input style={{ flex: 1 }} placeholder={t("projectManagement.addMilestonePlaceholder")}
                        value={newMilestone[p.id] || ""}
                        onChange={(e) => setNewMilestone((m) => ({ ...m, [p.id]: e.target.value }))} />
                      <button type="submit" className="btn btn-solid">{t("projectManagement.add")}</button>
                    </form>
                  )}
                </div>
              )}
            </section>
          );
        })
      )}

      {!loading && !visibleProjects.length && (
        <p className="portal-empty">
          {isClient
            ? t("projectManagement.empty.client")
            : tab === "ACTIVE" ? t("projectManagement.empty.active") : t("projectManagement.empty.all")}
        </p>
      )}
    </div>
  );
}
