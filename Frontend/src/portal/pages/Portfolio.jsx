import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as docActions from "../../api/actions/documents";
import { getAllProjects } from "../../api/actions/projects";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

export function Portfolio() {
  const { t } = useTranslation("staff");
  const { user } = useAuth();
  const { showError } = useToast();
  const [docs, setDocs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analyses, setAnalyses] = useState({});

  if (user?.role !== "ADMIN") {
    return (
      <div className="portal-access-denied">
        <h2>{t("adminPortfolio.accessRestricted.title")}</h2>
        <p>{t("adminPortfolio.accessRestricted.message")}</p>
      </div>
    );
  }

  useEffect(() => {
    async function load() {
      try {
        const [d, p] = await Promise.all([docActions.getApprovedDocuments(), getAllProjects()]);
        setDocs(d);
        setProjects(p);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  async function handleAnalyze(docId) {
    setAnalyzingId(docId);
    try {
      const result = await docActions.analyzeDocument(docId);
      setAnalyses((a) => ({ ...a, [docId]: result }));
    } catch (e) { showError(e.message || t("adminPortfolio.analysisFailed")); }
    finally { setAnalyzingId(null); }
  }

  const grouped = docs.reduce((acc, d) => {
    const key = projects.find((p) => p.id === d.projectId)?.requestName
      || projects.find((p) => p.id === d.projectId)?.clientName
      || t("adminPortfolio.projectFallback", { id: d.projectId });
    if (!acc[key]) acc[key] = [];
    acc[key].push(d);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="portal-page-title">{t("adminPortfolio.title")}</h1>
      <p className="portal-page-sub">{t("adminPortfolio.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      {loading ? <p className="portal-loading">{t("adminPortfolio.loading")}</p> : (
        Object.entries(grouped).length === 0
          ? <p className="portal-empty">{t("adminPortfolio.empty")}</p>
          : Object.entries(grouped).map(([projectName, files]) => (
              <section key={projectName} className="portal-section">
                <h2 className="portal-section__title">{projectName}</h2>
                {files.map((d) => (
                  <div key={d.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--color-line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                        {d.fileStorageUrl?.split("/").pop() || d.fileStorageUrl} (v{d.fileVersion})
                      </span>
                      <button className="btn" disabled={analyzingId === d.id} onClick={() => handleAnalyze(d.id)}>
                        {analyzingId === d.id ? t("adminPortfolio.analyzing") : t("adminPortfolio.aiAnalysis")}
                      </button>
                    </div>
                    {analyses[d.id] && (
                      <div style={{
                        marginTop: "0.6rem", padding: "0.75rem 1rem", borderRadius: 12,
                        background: "var(--color-bg-alt)", border: "1px solid var(--color-line)",
                        borderLeft: "3px solid var(--color-accent)",
                      }}>
                        <p style={{ fontWeight: 600, marginBottom: "0.3rem" }}>{t("adminPortfolio.recommendedComplete")}</p>
                        {analyses[d.id].recommendedTaskTitles.length ? (
                          <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                            {analyses[d.id].recommendedTaskTitles.map((title) => <li key={title}>{title}</li>)}
                          </ul>
                        ) : (
                          <p style={{ color: "var(--color-ink-soft)" }}>{t("adminPortfolio.noMilestonesReady")}</p>
                        )}
                        <p style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)", marginTop: "0.4rem" }}>
                          {analyses[d.id].reasoning}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)", marginTop: "0.4rem" }}>
                          {t("adminPortfolio.goToProjectManagement")}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </section>
            ))
      )}
    </div>
  );
}
