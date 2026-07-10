import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import * as quotationActions from "../../api/actions/quotations";
import { getClientByUser } from "../../api/actions/clients";
import { getRequestsByClient } from "../../api/actions/requests";
import "../PortalLayout.css";

const BADGE = {
  DRAFT: "draft", AWAITING_ADMIN_REVIEW: "ai-review", PENDING_APPROVAL: "pending",
  APPROVED: "approved", CHANGE_REQUESTED: "change", REJECTED: "rejected",
};

export function Quotations() {
  const { t } = useTranslation("portal");
  const { user } = useAuth();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [openId, setOpenId]         = useState(null);
  const [newItem, setNewItem]       = useState({ itemDescription: "", baseCost: "" });

  const isClient  = user?.role === "CLIENT";
  const canEdit   = user?.role === "PROJECT_MANAGER" || user?.role === "ADMIN";

  useEffect(() => {
    async function load() {
      try {
        if (isClient) {
          const profile = await getClientByUser(user.userId);
          const clientRequests = await getRequestsByClient(profile.id);
          const results = await Promise.allSettled(
            clientRequests.map((r) => quotationActions.getQuotationByRequest(r.id))
          );
          setQuotations(
            results.filter((r) => r.status === "fulfilled").map((r) => r.value)
          );
        } else {
          setQuotations(await quotationActions.getAllQuotations());
        }
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  async function addItem(qId) {
    if (!newItem.itemDescription || !newItem.baseCost) return;
    try {
      const updated = await quotationActions.addLineItem(qId, {
        itemDescription: newItem.itemDescription,
        baseCost: Number(newItem.baseCost),
      });
      setQuotations((q) => q.map((x) => x.id === qId ? updated : x));
      setNewItem({ itemDescription: "", baseCost: "" });
    } catch (e) { setError(e.message); }
  }

  async function removeItem(qId, itemId) {
    try {
      const updated = await quotationActions.removeLineItem(qId, itemId);
      setQuotations((q) => q.map((x) => x.id === qId ? updated : x));
    } catch (e) { setError(e.message); }
  }

  async function doAction(qId, action) {
    try {
      const updated = await action(qId);
      setQuotations((q) => q.map((x) => x.id === qId ? updated : x));
    } catch (e) { setError(e.message); }
  }

  const approved = quotations.filter((q) => q.approvalState === "APPROVED").length;
  const awaitingReview = quotations.filter((q) => q.approvalState === "AWAITING_ADMIN_REVIEW").length;

  const APPROVAL_STATE_LABELS = {
    DRAFT: t("quotations.stateDraft"),
    AWAITING_ADMIN_REVIEW: t("quotations.stateAwaitingAdminReview"),
    PENDING_APPROVAL: t("quotations.statePendingApproval"),
    APPROVED: t("quotations.stateApproved"),
    CHANGE_REQUESTED: t("quotations.stateChangeRequested"),
    REJECTED: t("quotations.stateRejected"),
  };

  return (
    <div>
      <h1 className="portal-page-title">{isClient ? t("quotations.clientTitle") : t("quotations.staffTitle")}</h1>
      <p className="portal-page-sub">
        {isClient
          ? t("quotations.clientSubtitle")
          : t("quotations.staffSubtitle")}
      </p>

      {!isClient && (
        <div className="portal-role-banner" style={{ marginBottom: "1.75rem" }}>
          <div className="portal-role-banner__text">
            <h2>{t("quotations.overview")}</h2>
            <p>{t("quotations.overviewDescription")}</p>
          </div>
          <div className="portal-role-banner__stats">
            <div className="portal-role-banner__stat">
              <span className="portal-role-banner__stat-value">{quotations.length}</span>
              <span className="portal-role-banner__stat-label">{t("quotations.total")}</span>
            </div>
            <div className="portal-role-banner__stat">
              <span className="portal-role-banner__stat-value">{awaitingReview}</span>
              <span className="portal-role-banner__stat-label">{t("quotations.awaitingAiReview")}</span>
            </div>
            <div className="portal-role-banner__stat">
              <span className="portal-role-banner__stat-value">{approved}</span>
              <span className="portal-role-banner__stat-label">{t("quotations.approved")}</span>
            </div>
            <div className="portal-role-banner__stat">
              <span className="portal-role-banner__stat-value">{quotations.length - approved}</span>
              <span className="portal-role-banner__stat-label">{t("quotations.pending")}</span>
            </div>
          </div>
        </div>
      )}

      {error && <p className="portal-error">{error}</p>}
      {loading && <p className="portal-loading">{t("quotations.loading")}</p>}

      {!loading && quotations.map((q) => {
        const open = openId === q.id;
        const awaitingAdminReview = q.approvalState === "AWAITING_ADMIN_REVIEW";
        const editable = canEdit && q.approvalState === "DRAFT";
        return (
          <section key={q.id} className={"portal-section" + (awaitingAdminReview ? " is-highlighted" : "")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: open ? "1.25rem" : 0 }}>
              <div>
                <h2 className="portal-section__title" style={{ border: "none", marginBottom: "0.4rem" }}>
                  {q.clientName}
                  {q.aiGenerated && (
                    <span style={{ marginLeft: "0.6rem", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.04em",
                  color: "var(--color-accent)", border: "1px solid var(--color-accent)",
                      borderRadius: 999, padding: "0.1rem 0.55rem", verticalAlign: "middle" }}>
                      {t("quotations.aiEstimate")}
                    </span>
                  )}
                </h2>
                <span className={`badge badge--${BADGE[q.approvalState] || "draft"}`}>
                  {APPROVAL_STATE_LABELS[q.approvalState] || q.approvalState}
                </span>
                <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
                  {t("quotations.lineItemsSummary", { count: q.lineItems?.length || 0, total: q.finalTotal?.toLocaleString() })}
                </span>
              </div>
              <button className="btn" style={{ fontSize: "0.8rem" }}
                onClick={() => setOpenId(open ? null : q.id)}>
                {open ? t("quotations.collapse") : t("quotations.expand")}
              </button>
            </div>

            {open && (
              <>
                {q.aiGenerated && (
                  <div style={{
                    background: "var(--color-bg-alt)", border: "1px solid var(--color-line)",
                    borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "1.25rem",
                  }}>
                    <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.4rem" }}>
                      {t("quotations.aiRecommendation")}
                      <span style={{ marginLeft: "0.5rem", fontWeight: 500, color: "var(--color-ink-soft)" }}>
                        {t("quotations.verdict")}: {q.aiVerdict === "SUFFICIENT" ? t("quotations.verdictSufficient") : t("quotations.verdictInsufficient")}
                      </span>
                    </p>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-ink-soft)", margin: "0 0 0.5rem" }}>
                      {q.aiReasoning}
                    </p>
                    <p style={{ fontSize: "0.95rem", fontWeight: 600, margin: 0 }}>
                      {t("quotations.recommendedAmount", { amount: Number(q.aiRecommendedAmount || 0).toLocaleString() })}
                    </p>

                    {awaitingAdminReview && canEdit && (
                      <div className="portal-actions" style={{ marginTop: "1rem" }}>
                        <button className="btn btn-solid" onClick={() => doAction(q.id, quotationActions.admitQuotation)}>
                          {t("quotations.admit")}
                        </button>
                        <button className="btn" style={{ color: "#dc2626", borderColor: "#dc2626" }}
                          onClick={() => doAction(q.id, quotationActions.denyQuotation)}>
                          {t("quotations.deny")}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!awaitingAdminReview && (
                  <div className="portal-table-wrap">
                    <table className="portal-table">
                      <thead>
                        <tr>
                          <th>{t("quotations.columnDescription")}</th>
                          <th style={{ textAlign: "right" }}>{t("quotations.columnCost")}</th>
                          {editable && <th style={{ width: 80 }}></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {(q.lineItems || []).map((li) => (
                          <tr key={li.id}>
                            <td>{li.itemDescription}</td>
                            <td style={{ textAlign: "right" }}>${li.baseCost?.toLocaleString()}</td>
                            {editable && (
                              <td>
                                <button className="btn" style={{ padding: "0.2rem 0.55rem", fontSize: "0.75rem" }}
                                  onClick={() => removeItem(q.id, li.id)}>
                                  {t("quotations.remove")}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td style={{ color: "var(--color-ink-soft)", fontSize: "0.85rem" }}>{t("quotations.tax")}</td>
                          <td style={{ textAlign: "right" }}>${q.calculatedTax?.toLocaleString()}</td>
                          {editable && <td></td>}
                        </tr>
                        <tr>
                          <td style={{ fontWeight: 700, fontFamily: "var(--font-display)" }}>{t("quotations.total")}</td>
                          <td style={{ textAlign: "right", fontWeight: 700, color: "var(--color-accent)", fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>
                            ${q.finalTotal?.toLocaleString()}
                          </td>
                          {editable && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                {editable && (
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                    <input style={{ flex: 2, minWidth: 160 }} placeholder={t("quotations.lineItemDescriptionPlaceholder")}
                      value={newItem.itemDescription}
                      onChange={(e) => setNewItem({ ...newItem, itemDescription: e.target.value })} />
                    <input type="number" style={{ flex: 1, minWidth: 120 }} placeholder={t("quotations.costPlaceholder")}
                      value={newItem.baseCost}
                      onChange={(e) => setNewItem({ ...newItem, baseCost: e.target.value })} />
                    <button className="btn btn-solid" onClick={() => addItem(q.id)}>{t("quotations.addItem")}</button>
                  </div>
                )}

                {q.approvalState === "PENDING_APPROVAL" && (
                  <div className="portal-actions" style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--color-line)" }}>
                    {(isClient || canEdit) && (
                      <button className="btn btn-solid" onClick={() => doAction(q.id, quotationActions.approveQuotation)}>
                        {t("quotations.approveQuotation")}
                      </button>
                    )}
                    {isClient && (
                      <button className="btn" style={{ color: "#dc2626", borderColor: "#dc2626" }}
                        onClick={() => doAction(q.id, quotationActions.rejectQuotation)}>
                        {t("quotations.deny")}
                      </button>
                    )}
                    {(isClient || canEdit) && (
                      <button className="btn" onClick={() => doAction(q.id, quotationActions.requestQuotationChange)}>
                        {t("quotations.requestChanges")}
                      </button>
                    )}
                  </div>
                )}

                {editable && q.lineItems?.length > 0 && (
                  <div className="portal-actions" style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--color-line)" }}>
                    <button className="btn" onClick={() => doAction(q.id, quotationActions.submitQuotation)}>
                      {t("quotations.sendToClient")}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}

      {!loading && !quotations.length && (
        <p className="portal-empty">
          {isClient ? t("quotations.noneForClient") : t("quotations.noneFound")}
        </p>
      )}
    </div>
  );
}
