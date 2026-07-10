import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { uploadMyAvatar, updateMyProfile } from "../../api/actions/users";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../../components/toast/ToastContext";
import "../PortalLayout.css";

function initialsOf(text) {
  if (!text) return "?";
  return text.trim().split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function Profile() {
  const { t } = useTranslation("portal");
  const { user, patchUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const ROLE_LABELS = {
    CLIENT: t("role.client"),
    STAFF: t("role.designer"),
    PROJECT_MANAGER: t("role.projectManager"),
    ADMIN: t("role.administrator"),
  };
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user?.fullName]);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarUploading(true);
    setError(null);
    try {
      const profile = await uploadMyAvatar(file);
      patchUser({ avatarUrl: profile.avatarUrl || null });
      showSuccess(t("profile.photoUpdated"));
    } catch (err) {
      setError(err.message);
      showError(err.message || t("profile.photoUploadError"));
    } finally {
      setAvatarUploading(false);
    }
  }

  const isDirty = fullName.trim().length > 0 && fullName.trim() !== (user?.fullName || "").trim();

  async function handleSaveName(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const profile = await updateMyProfile(fullName);
      patchUser({ fullName: profile.fullName });
      setSaved(true);
      showSuccess(t("profile.profileUpdated"));
    } catch (err) {
      setError(err.message);
      showError(err.message || t("profile.saveError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="portal-page-title">{t("profile.title")}</h1>
      <p className="portal-page-sub">{t("profile.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      <section className="portal-section">
        <h2 className="portal-section__title">{t("profile.profilePicture")}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <span className="account-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              initialsOf(user?.fullName || user?.email)
            )}
          </span>
          <div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              className="btn"
              disabled={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarUploading ? t("profile.uploading") : t("profile.changePhoto")}
            </button>
            <p style={{ fontSize: "0.78rem", color: "var(--color-ink-soft)", marginTop: "0.5rem" }}>
              {t("profile.photoHint")}
            </p>
          </div>
        </div>
      </section>

      <section className="portal-section">
        <h2 className="portal-section__title">{t("profile.personalDetails")}</h2>
        <form onSubmit={handleSaveName}>
          <div className="portal-form-row">
            <div className="field">
              <label>{t("profile.fullName")}</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setSaved(false); }}
              />
            </div>
            <div className="field">
              <label>{t("profile.email")}</label>
              <input type="email" value={user?.email || ""} disabled />
            </div>
            <div className="field">
              <label>{t("profile.role")}</label>
              <input type="text" value={ROLE_LABELS[user?.role] || user?.role || ""} disabled />
            </div>
          </div>
          {saved && <p style={{ color: "var(--color-accent)", fontSize: "0.85rem", marginBottom: "1rem" }}>{t("profile.saved")}</p>}
          <button
            type="submit"
            className={"btn" + (isDirty ? " btn-solid" : "")}
            disabled={saving || !isDirty}
          >
            {saving ? t("profile.saving") : t("profile.saveChanges")}
          </button>
        </form>
      </section>
    </div>
  );
}
