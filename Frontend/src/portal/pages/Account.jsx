import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyWallet, getMyWalletTransactions, deposit, invest } from "../../api/actions/wallet";
import { getMyRequests } from "../../api/actions/requests";
import { Wallet } from "@phosphor-icons/react";
import { PaymentMethodPicker } from "../components/PaymentMethodPicker";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

export function Account() {
  const { t } = useTranslation("portal");
  const { showSuccess, showError } = useToast();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [depositForm, setDepositForm] = useState({ amount: "" });
  const [payment, setPayment] = useState({ method: "Bank Transfer", valid: true });
  const [depositSaving, setDepositSaving] = useState(false);

  const [investForm, setInvestForm] = useState({ requestId: "", amount: "" });
  const [investSaving, setInvestSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const w = await getMyWallet();
      const [tx, reqs] = await Promise.all([
        getMyWalletTransactions(),
        getMyRequests(),
      ]);
      setWallet(w);
      setTransactions(tx);
      setRequests(reqs);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const investableRequests = requests.filter(
    (r) => r.executionStatus !== "DRAFT" && r.investmentStatus !== "INVESTED"
  );

  function handleSelectRequest(requestId) {
    const selected = requests.find((r) => String(r.id) === requestId);
    setInvestForm({
      requestId,
      amount: selected ? String(selected.budgetLimit || "") : "",
    });
  }

  async function handleDeposit(e) {
    e.preventDefault();
    setDepositSaving(true);
    setError(null);
    try {
      const updated = await deposit({ amount: Number(depositForm.amount), method: payment.method });
      setWallet(updated);
      setDepositForm({ amount: "" });
      const tx = await getMyWalletTransactions();
      setTransactions(tx);
      showSuccess(t("account.depositSuccess"));
    } catch (e) {
      setError(e.message);
      showError(e.message || t("account.depositError"));
    } finally {
      setDepositSaving(false);
    }
  }

  async function handleInvest(e) {
    e.preventDefault();
    setInvestSaving(true);
    setError(null);
    try {
      const updated = await invest({ requestId: Number(investForm.requestId), amount: Number(investForm.amount) });
      setWallet(updated);
      setInvestForm({ requestId: "", amount: "" });
      const [tx, reqs] = await Promise.all([getMyWalletTransactions(), getMyRequests()]);
      setTransactions(tx);
      setRequests(reqs);
      showSuccess(t("account.investSuccess"));
    } catch (e) {
      setError(e.message);
      showError(e.message || t("account.investError"));
    } finally {
      setInvestSaving(false);
    }
  }

  const investAmountTooHigh =
    wallet && investForm.amount && Number(investForm.amount) > Number(wallet.balance);

  if (loading) return <p className="portal-loading">{t("account.loading")}</p>;

  return (
    <div>
      <h1 className="portal-page-title">{t("account.title")}</h1>
      <p className="portal-page-sub">{t("account.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      <div className="portal-stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="portal-stat-card wallet-hero-card">
          <span className="wallet-hero-card__icon"><Wallet size={22} weight="fill" /></span>
          <div className="portal-stat-card__label">{t("account.walletBalance")}</div>
          <div className="portal-stat-card__value portal-stat-card__value--accent">
            {Number(wallet?.balance || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("account.depositFunds")}</h2>
        <form onSubmit={handleDeposit}>
          <div className="field field--full" style={{ maxWidth: 220, marginBottom: "1.25rem" }}>
            <label>{t("account.amount")}</label>
            <input type="number" min="0" step="0.01" required value={depositForm.amount}
              onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} />
          </div>

          <PaymentMethodPicker onChange={setPayment} />

          <button type="submit" className="btn btn-solid" disabled={depositSaving || !payment.valid}>
            {depositSaving ? t("account.depositing") : t("account.deposit")}
          </button>
        </form>
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("account.investInRequest")}</h2>
        {investableRequests.length === 0 ? (
          <p className="portal-empty">{t("account.noInvestableRequests")}</p>
        ) : (
          <form onSubmit={handleInvest}>
            <div className="portal-form-row">
              <div className="field">
                <label>{t("account.request")}</label>
                <select required value={investForm.requestId}
                  onChange={(e) => handleSelectRequest(e.target.value)}>
                  <option value="">{t("account.selectRequest")}</option>
                  {investableRequests.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.requestName || r.roomType || t("account.request")} — {Number(r.budgetLimit || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t("account.amount")}</label>
                <input type="number" min="0" step="0.01" required value={investForm.amount}
                  onChange={(e) => setInvestForm({ ...investForm, amount: e.target.value })} />
              </div>
            </div>
            {investAmountTooHigh && (
              <p className="portal-error">{t("account.amountExceedsBalance")}</p>
            )}
            <button
              type="submit"
              className="btn btn-solid"
              disabled={investSaving || !investForm.requestId || investAmountTooHigh}
            >
              {investSaving ? t("account.investing") : t("account.invest")}
            </button>
          </form>
        )}
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("account.transactionHistory")}</h2>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr>
                <th>{t("account.columnDate")}</th><th>{t("account.columnType")}</th><th>{t("account.columnAmount")}</th><th>{t("account.columnMethodRequest")}</th><th>{t("account.columnBalanceAfter")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${tx.type === "DEPOSIT" ? "approved" : "progress"}`}>
                      {tx.type === "DEPOSIT" ? t("account.typeDeposit") : t("account.typeInvestment")}
                    </span>
                  </td>
                  <td>{Number(tx.amount).toLocaleString()}</td>
                  <td>{tx.type === "DEPOSIT" ? tx.method : t("account.requestHash", { id: tx.relatedRequestId })}</td>
                  <td>{Number(tx.balanceAfter).toLocaleString()}</td>
                </tr>
              ))}
              {!transactions.length && (
                <tr><td colSpan={5} className="portal-empty">{t("account.noTransactions")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
