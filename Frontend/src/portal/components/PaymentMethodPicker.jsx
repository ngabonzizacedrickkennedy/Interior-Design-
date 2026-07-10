import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { VisaIcon, MastercardIcon, PaypalIcon, BankIcon } from "./paymentIcons";
import "./PaymentMethodPicker.css";

const METHOD_DEFS = [
  { id: "Visa",           Icon: VisaIcon,       kind: "card",   brand: "visa" },
  { id: "Mastercard",     Icon: MastercardIcon, kind: "card",   brand: "mastercard" },
  { id: "PayPal",         Icon: PaypalIcon,     kind: "paypal" },
  { id: "Bank Transfer",  Icon: BankIcon,       kind: "bank" },
];

function formatCardNumber(digits) {
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidFor(method, card, paypalEmail) {
  if (method.kind === "card") {
    const digits = card.number;
    return (
      card.name.trim().length > 1 &&
      digits.length >= 13 && digits.length <= 16 &&
      /^\d{2}\/\d{2}$/.test(card.expiry) &&
      /^\d{3,4}$/.test(card.cvv)
    );
  }
  if (method.kind === "paypal") {
    return /\S+@\S+\.\S+/.test(paypalEmail);
  }
  return true;
}

export function PaymentMethodPicker({ onChange }) {
  const { t } = useTranslation("portal");
  const METHODS = [
    { ...METHOD_DEFS[0], label: t("paymentPicker.visa") },
    { ...METHOD_DEFS[1], label: t("paymentPicker.mastercard") },
    { ...METHOD_DEFS[2], label: t("paymentPicker.paypal") },
    { ...METHOD_DEFS[3], label: t("paymentPicker.bankTransfer") },
  ];
  const [methodId, setMethodId] = useState(METHODS[3].id);
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [paypalEmail, setPaypalEmail] = useState("");

  const selected = METHODS.find((m) => m.id === methodId);

  useEffect(() => {
    onChange?.({ method: methodId, valid: isValidFor(selected, card, paypalEmail) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methodId, card, paypalEmail]);

  return (
    <div className="payment-picker">
      <div className="payment-picker__methods">
        {METHODS.map((m) => (
          <button
            type="button"
            key={m.id}
            className={"payment-picker__method" + (methodId === m.id ? " is-selected" : "")}
            onClick={() => setMethodId(m.id)}
          >
            <m.Icon />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {selected.kind === "card" && (
        <div className="payment-picker__panel">
          <div className={`payment-card-preview payment-card-preview--${selected.brand}`}>
            <div className="payment-card-preview__chip" />
            <div className="payment-card-preview__number">
              {card.number ? formatCardNumber(card.number) : "•••• •••• •••• ••••"}
            </div>
            <div className="payment-card-preview__row">
              <span>{card.name || t("paymentPicker.cardHolder")}</span>
              <span>{card.expiry || "MM/YY"}</span>
            </div>
          </div>

          <div className="portal-form-row">
            <div className="field field--full">
              <label>{t("paymentPicker.cardholderName")}</label>
              <input
                type="text"
                placeholder={t("paymentPicker.cardholderNamePlaceholder")}
                autoComplete="off"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
              />
            </div>
            <div className="field field--full">
              <label>{t("paymentPicker.cardNumber")}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                autoComplete="off"
                value={formatCardNumber(card.number)}
                onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })}
              />
            </div>
            <div className="field">
              <label>{t("paymentPicker.expiry")}</label>
              <input
                type="text"
                placeholder="MM/YY"
                autoComplete="off"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>{t("paymentPicker.cvv")}</label>
              <input
                type="password"
                inputMode="numeric"
                placeholder="•••"
                maxLength={4}
                autoComplete="off"
                value={card.cvv}
                onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
              />
            </div>
          </div>
          <p className="payment-picker__note">
            {t("paymentPicker.cardSimulatedNote")}
          </p>
        </div>
      )}

      {selected.kind === "paypal" && (
        <div className="payment-picker__panel">
          <div className="field field--full">
            <label>{t("paymentPicker.paypalEmail")}</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>
        </div>
      )}

      {selected.kind === "bank" && (
        <div className="payment-picker__panel payment-picker__bank-details">
          <div className="payment-picker__bank-row">
            <span>{t("paymentPicker.accountName")}</span>
            <strong>Space Design Group Ltd</strong>
          </div>
          <div className="payment-picker__bank-row">
            <span>{t("paymentPicker.accountNumber")}</span>
            <strong>•••• •••• 4821</strong>
          </div>
          <div className="payment-picker__bank-row">
            <span>{t("paymentPicker.swiftBic")}</span>
            <strong>SDGLGB2L</strong>
          </div>
          <p className="payment-picker__note">
            {t("paymentPicker.bankTransferNote")}
          </p>
        </div>
      )}
    </div>
  );
}
