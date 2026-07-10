import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./auth/AuthContext";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function GoogleSignInButton({ role, onSuccess, onError }) {
  const { t } = useTranslation("auth");
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response) => {
        try {
          const user = await loginWithGoogle(response.credential, role);
          onSuccess?.(user);
        } catch (err) {
          onError?.(err.message || t("google.signInFailed"));
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: 320,
      text: "continue_with",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (!CLIENT_ID) return null;

  return (
    <div className="auth-google">
      <div className="auth-google__divider">
        <span>{t("google.divider")}</span>
      </div>
      <div ref={buttonRef} className="auth-google__button" />
    </div>
  );
}
