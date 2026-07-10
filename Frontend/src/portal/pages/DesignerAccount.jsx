import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Wallet } from "@phosphor-icons/react";
import * as walletActions from "../../api/actions/designerWallet";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

export function DesignerAccount() {
  const { t } = useTranslation("staff");
  const { showSuccess, showError } = useToast();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState("");
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const w = await walletActions.getMyDesignerWallet();
      const tx = await walletActions.getMyDesignerWalletTransactions();
      setWallet(w);
      setTransactions(tx);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const amountTooHigh = wallet && amount && Number(amount) > Number(wallet.assignedBalance);

  async function handleTransfer(e) {
    e.preventDefault();
    setTransferring(true);
    try {
      const updated = await walletActions.transferToPersonalAccount(Number(amount));
      setWallet(updated);
      setAmount("");
      const tx = await walletActions.getMyDesignerWalletTransactions();
      setTransactions(tx);
      showSuccess(t("designerAccount.transferSuccess"));
    } catch (e) {
      showError(e.message || t("designerAccount.transferError"));
    } finally { setTransferring(false); }
  }

  if (loading) return <p className="portal-loading">{t("designerAccount.loading")}</p>;

  return (
    <div>
      <h1 className="portal-page-title">{t("designerAccount.title")}</h1>
      <p className="portal-page-sub">{t("designerAccount.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      <div className="portal-stat-grid" style={{ marginBottom: "2rem" }}>
        <div className="portal-stat-card">
          <div className="portal-stat-card__label">{t("designerAccount.pendingAmount")}</div>
          <div className="portal-stat-card__value">{Number(wallet?.pendingAmount || 0).toLocaleString()}</div>
        </div>
        <div className="portal-stat-card wallet-hero-card">
          <span className="wallet-hero-card__icon"><Wallet size={22} weight="fill" /></span>
          <div className="portal-stat-card__label">{t("designerAccount.assignedAmount")}</div>
          <div className="portal-stat-card__value portal-stat-card__value--accent">
            {Number(wallet?.assignedBalance || 0).toLocaleString()}
          </div>
        </div>
        <div className="portal-stat-card">
          <div className="portal-stat-card__label">{t("designerAccount.personalAccount")}</div>
          <div className="portal-stat-card__value">{Number(wallet?.personalBalance || 0).toLocaleString()}</div>
        </div>
      </div>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("designerAccount.transferSectionTitle")}</h2>
        <form onSubmit={handleTransfer}>
          <div className="field field--full" style={{ maxWidth: 220, marginBottom: "1.25rem" }}>
            <label>{t("designerAccount.amountLabel")}</label>
            <input type="number" min="0" step="0.01" required value={amount}
              onChange={(e) => setAmount(e.target.value)} />
          </div>
          {amountTooHigh && <p className="portal-error">{t("designerAccount.amountTooHigh")}</p>}
          <button type="submit" className="btn btn-solid" disabled={transferring || !amount || amountTooHigh}>
            {transferring ? t("designerAccount.transferring") : t("designerAccount.transferButton")}
          </button>
        </form>
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("designerAccount.historySectionTitle")}</h2>
        <div className="portal-table-wrap">
          <table className="portal-table">
            <thead>
              <tr><th>{t("designerAccount.columnDate")}</th><th>{t("designerAccount.columnType")}</th><th>{t("designerAccount.columnAmount")}</th><th>{t("designerAccount.columnBalanceAfter")}</th></tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${tx.type === "TRANSFER_TO_PERSONAL" ? "progress" : "approved"}`}>
                      {tx.type === "TRANSFER_TO_PERSONAL" ? t("designerAccount.typeTransferToPersonal") : t("designerAccount.typeOther", { type: tx.type.replace(/_/g, " ") })}
                    </span>
                  </td>
                  <td>{Number(tx.amount).toLocaleString()}</td>
                  <td>{Number(tx.balanceAfter).toLocaleString()}</td>
                </tr>
              ))}
              {!transactions.length && (
                <tr><td colSpan={4} className="portal-empty">{t("designerAccount.noTransactions")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
