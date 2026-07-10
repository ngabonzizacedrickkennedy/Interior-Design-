import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as taskActions from "../../api/actions/tasks";
import "../PortalLayout.css";

export function TasksResources() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState("ALL");
  const [form, setForm] = useState({ projectId: "", assignedDesignerId: "", taskTitle: "", deadlineDate: "" });
  const [assignableMembers, setAssignableMembers] = useState([]);

  const isStaff   = user?.role === "STAFF";
  const canCreate = user?.role === "PROJECT_MANAGER";

  useEffect(() => {
    async function load() {
      try {
        const [ts, p] = await Promise.all([
          isStaff ? taskActions.getTasksByDesigner(user.userId) : taskActions.getAllTasks(),
          canCreate ? taskActions.getAssignableProjects() : Promise.resolve([]),
        ]);
        setTasks(ts);
        setProjects(p);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  async function handleProjectSelect(projectId) {
    setForm((f) => ({ ...f, projectId, assignedDesignerId: "" }));
    if (!projectId) { setAssignableMembers([]); return; }
    try {
      const members = await taskActions.getAssignableMembers(projectId);
      setAssignableMembers(members);
      if (members.length === 1) {
        setForm((f) => ({ ...f, assignedDesignerId: String(members[0].userId) }));
      }
    } catch (e) { setError(e.message); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const created = await taskActions.createTask({
        projectId: Number(form.projectId),
        assignedDesignerId: form.assignedDesignerId ? Number(form.assignedDesignerId) : null,
        taskTitle: form.taskTitle,
        deadlineDate: form.deadlineDate || null,
      });
      setTasks((ts) => [...ts, created]);
      setForm({ projectId: "", assignedDesignerId: "", taskTitle: "", deadlineDate: "" });
      setAssignableMembers([]);
    } catch (e) { setError(e.message); }
  }

  async function handleToggle(id) {
    try {
      const updated = await taskActions.toggleTaskCompletion(id);
      setTasks((ts) => ts.map((x) => x.id === id ? updated : x));
    } catch (e) { setError(e.message); }
  }

  function isOverdue(task) {
    return !task.isCompleted && task.deadlineDate && new Date(task.deadlineDate) < new Date();
  }

  const filtered = tasks.filter((task) => {
    if (filter === "DONE")    return task.isCompleted;
    if (filter === "PENDING") return !task.isCompleted;
    if (filter === "OVERDUE") return isOverdue(task);
    return true;
  });

  const done     = tasks.filter((task) => task.isCompleted).length;
  const overdue  = tasks.filter((task) => isOverdue(task)).length;

  return (
    <div>
      <h1 className="portal-page-title">{isStaff ? t("tasksResources.titleStaff") : t("tasksResources.title")}</h1>
      <p className="portal-page-sub">
        {isStaff
          ? t("tasksResources.subtitleStaff")
          : t("tasksResources.subtitle")}
      </p>

      <div className="portal-stat-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("tasksResources.stats.total")}</p>
          <p className="portal-stat-card__value">{tasks.length}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("tasksResources.stats.completed")}</p>
          <p className="portal-stat-card__value portal-stat-card__value--accent">{done}</p>
        </div>
        <div className="portal-stat-card">
          <p className="portal-stat-card__label">{t("tasksResources.stats.pending")}</p>
          <p className="portal-stat-card__value">{tasks.length - done}</p>
        </div>
        {overdue > 0 && (
          <div className="portal-stat-card" style={{ borderLeft: "3px solid #ef4444" }}>
            <p className="portal-stat-card__label" style={{ color: "#ef4444" }}>{t("tasksResources.stats.overdue")}</p>
            <p className="portal-stat-card__value" style={{ color: "#ef4444" }}>{overdue}</p>
          </div>
        )}
      </div>

      {error && <p className="portal-error">{error}</p>}

      {canCreate && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("tasksResources.createTask.title")}</h2>
          <form onSubmit={handleCreate}>
            <div className="portal-form-row">
              <div className="field">
                <label>{t("tasksResources.createTask.projectLabel")}</label>
                <select value={form.projectId} required
                  onChange={(e) => handleProjectSelect(e.target.value)}>
                  <option value="">{t("tasksResources.createTask.selectProject")}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.requestName || p.clientName}</option>
                  ))}
                </select>
              </div>
              {form.projectId && assignableMembers.length > 1 && (
                <div className="field">
                  <label>{t("tasksResources.createTask.assignToLabel")}</label>
                  <select value={form.assignedDesignerId} required
                    onChange={(e) => setForm({ ...form, assignedDesignerId: e.target.value })}>
                    <option value="">{t("tasksResources.createTask.selectStaffMember")}</option>
                    {assignableMembers.map((m) => (
                      <option key={m.userId} value={m.userId}>{m.fullName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="field">
                <label>{t("tasksResources.createTask.taskTitleLabel")}</label>
                <input value={form.taskTitle} required
                  onChange={(e) => setForm({ ...form, taskTitle: e.target.value })} />
              </div>
              <div className="field">
                <label>{t("tasksResources.createTask.deadlineLabel")}</label>
                <input type="date" value={form.deadlineDate}
                  onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-solid">{t("tasksResources.createTask.submitButton")}</button>
          </form>
        </section>
      )}

      <section className="portal-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="portal-section__title" style={{ border: "none", margin: 0 }}>{t("tasksResources.taskReports.title")}</h2>
          <div className="portal-actions">
            {["ALL", "PENDING", "DONE", "OVERDUE"].map((f) => (
              <button key={f} className={`btn${filter === f ? " btn-solid" : ""}`}
                style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem" }}
                onClick={() => setFilter(f)}>
                {t(`tasksResources.filters.${f}`)}
              </button>
            ))}
          </div>
        </div>
        {loading ? <p className="portal-loading">{t("tasksResources.taskReports.loading")}</p> : (
          <div className="portal-table-wrap">
            <table className="portal-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>{t("tasksResources.taskReports.columns.task")}</th>
                  <th>{t("tasksResources.taskReports.columns.project")}</th>
                  <th>{t("tasksResources.taskReports.columns.assignedTo")}</th>
                  <th>{t("tasksResources.taskReports.columns.deadline")}</th>
                  <th>{t("tasksResources.taskReports.columns.status")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <tr key={task.id} className={isOverdue(task) ? "is-overdue" : ""}>
                    <td>
                      <input type="checkbox" checked={task.isCompleted}
                        onChange={() => handleToggle(task.id)} />
                    </td>
                    <td style={{
                      textDecoration: task.isCompleted ? "line-through" : "none",
                      color: task.isCompleted ? "var(--color-ink-soft)" : "var(--color-ink)",
                      fontWeight: isOverdue(task) ? 600 : 400,
                    }}>
                      {task.taskTitle}
                      {isOverdue(task) && (
                        <span style={{ marginLeft: "0.5rem", color: "#ef4444", fontSize: "0.75rem", fontWeight: 600 }}>
                          {t("tasksResources.taskReports.overdueTag")}
                        </span>
                      )}
                    </td>
                    <td style={{ color: "var(--color-ink-soft)" }}>
                      {task.projectName || "—"}
                    </td>
                    <td>
                      {task.assignedDesignerName || (
                        <span style={{ color: "var(--color-ink-soft)" }}>{t("tasksResources.taskReports.unassigned")}</span>
                      )}
                    </td>
                    <td style={{ color: isOverdue(task) ? "#ef4444" : "var(--color-ink-soft)" }}>
                      {task.deadlineDate || <span style={{ color: "var(--color-line)" }}>{t("tasksResources.taskReports.noDate")}</span>}
                    </td>
                    <td>
                      <span className={`badge badge--${task.isCompleted ? "completed" : isOverdue(task) ? "cancelled" : "pending"}`}>
                        {task.isCompleted ? t("tasksResources.taskReports.status.done") : isOverdue(task) ? t("tasksResources.taskReports.status.overdue") : t("tasksResources.taskReports.status.pending")}
                      </span>
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={6} className="portal-empty">
                    {filter !== "ALL" ? t("tasksResources.taskReports.noFilteredTasks", { filter: t(`tasksResources.filters.${filter}`).toLowerCase() }) : t("tasksResources.taskReports.noTasks")}
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
