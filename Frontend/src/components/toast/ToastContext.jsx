import { createContext, useCallback, useContext, useRef, useState } from "react";
import { ToastContainer } from "./ToastContainer";

const ToastContext = createContext(null);

let idCounter = 0;

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback((message, options = {}) => {
    const { type = "success", duration = DEFAULT_DURATION } = options;
    const id = ++idCounter;
    setToasts((current) => [...current, { id, message, type, duration }]);

    if (duration > 0) {
      const timer = setTimeout(() => dismissToast(id), duration);
      timers.current.set(id, timer);
    }
    return id;
  }, [dismissToast]);

  const showSuccess = useCallback(
    (message, options) => showToast(message, { ...options, type: "success" }),
    [showToast]
  );

  const showError = useCallback(
    (message, options) => showToast(message, { ...options, type: "error" }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
