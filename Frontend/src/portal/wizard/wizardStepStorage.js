const STEP_PREFIX = "wizard-step:";
const FIELDS_PREFIX = "wizard-fields:";

export function saveStep(requestId, step) {
  localStorage.setItem(STEP_PREFIX + requestId, String(step));
}

export function readSavedStep(requestId) {
  const raw = localStorage.getItem(STEP_PREFIX + requestId);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

export function saveFields(requestId, fields) {
  localStorage.setItem(FIELDS_PREFIX + requestId, JSON.stringify(fields));
}

export function readSavedFields(requestId) {
  const raw = localStorage.getItem(FIELDS_PREFIX + requestId);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearWizardProgress(requestId) {
  localStorage.removeItem(STEP_PREFIX + requestId);
  localStorage.removeItem(FIELDS_PREFIX + requestId);
}
