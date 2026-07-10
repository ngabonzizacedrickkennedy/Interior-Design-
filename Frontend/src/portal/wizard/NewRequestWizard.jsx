import { useEffect, useReducer, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { wizardReducer, initialWizardState } from "./wizardReducer";
import { saveStep, readSavedStep, saveFields, readSavedFields, clearWizardProgress } from "./wizardStepStorage";
import { createDraftRequest, updateDraftRequest, submitRequest, getRequestById } from "../../api/actions/requests";
import { useToast } from "../../components/toast/ToastContext";
import { WizardProgressBar } from "./WizardProgressBar";
import { StepRoomPhotos } from "./steps/StepRoomPhotos";
import { StepDimensions } from "./steps/StepDimensions";
import { StepBudget } from "./steps/StepBudget";
import { StepStylePreferences } from "./steps/StepStylePreferences";
import { StepSpaceUsage } from "./steps/StepSpaceUsage";
import { StepExistingFurniture } from "./steps/StepExistingFurniture";
import { StepLighting } from "./steps/StepLighting";
import { StepTimeline } from "./steps/StepTimeline";
import { StepAvoidAndLocation } from "./steps/StepAvoidAndLocation";
import { StepReview } from "./steps/StepReview";
import "../PortalLayout.css";
import "./wizard.css";

function buildSteps(t) {
  return [
    { key: "roomPhotos", label: t("wizard.stepLabels.roomPhotos"), Component: StepRoomPhotos },
    { key: "dimensions", label: t("wizard.stepLabels.dimensions"), Component: StepDimensions },
    { key: "budget", label: t("wizard.stepLabels.budget"), Component: StepBudget },
    { key: "style", label: t("wizard.stepLabels.style"), Component: StepStylePreferences },
    { key: "usage", label: t("wizard.stepLabels.spaceUsage"), Component: StepSpaceUsage },
    { key: "furniture", label: t("wizard.stepLabels.existingFurniture"), Component: StepExistingFurniture },
    { key: "lighting", label: t("wizard.stepLabels.lighting"), Component: StepLighting },
    { key: "timeline", label: t("wizard.stepLabels.timeline"), Component: StepTimeline },
    { key: "avoid", label: t("wizard.stepLabels.avoidAndLocation"), Component: StepAvoidAndLocation },
    { key: "review", label: t("wizard.stepLabels.review"), Component: StepReview },
  ];
}

function buildWizardPayload(fields) {
  return {
    requestName: fields.requestName || null,
    roomType: fields.roomType || null,
    requestDetails: fields.requestDetails || null,
    lengthMeters: fields.lengthMeters === "" ? null : Number(fields.lengthMeters),
    widthMeters: fields.widthMeters === "" ? null : Number(fields.widthMeters),
    ceilingHeightMeters: fields.ceilingHeightMeters === "" ? null : Number(fields.ceilingHeightMeters),
    spatialNotes: fields.spatialNotes || null,
    budgetMin: fields.budgetMin === "" ? null : Number(fields.budgetMin),
    budgetMax: fields.budgetMax === "" ? null : Number(fields.budgetMax),
    styleTags: fields.styleTags,
    worksFromHome: fields.worksFromHome,
    entertainsOften: fields.entertainsOften,
    hasKids: fields.hasKids,
    hasPets: fields.hasPets,
    storageNeeds: fields.storageNeeds || null,
    windowDirection: fields.windowDirection || null,
    naturalLightLevel: fields.naturalLightLevel || null,
    artificialLightingNotes: fields.artificialLightingNotes || null,
    timeline: fields.timeline || null,
    avoidNotes: fields.avoidNotes || null,
    sourcingLocation: fields.sourcingLocation || null,
  };
}

export function NewRequestWizard() {
  const { t } = useTranslation("portal");
  const STEPS = buildSteps(t);
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);
  const { showSuccess, showError } = useToast();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draftId");
  const navigate = useNavigate();
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    async function init() {
      try {
        const request = draftId ? await getRequestById(draftId) : await createDraftRequest();
        dispatch({ type: "HYDRATE", request });

        if (!draftId) {
          navigate(`/portal/requests/new?draftId=${request.id}`, { replace: true });
        } else {
          const savedStep = readSavedStep(request.id);
          if (savedStep !== null) {
            dispatch({ type: "SET_STEP", step: Math.max(0, Math.min(savedStep, STEPS.length - 1)) });
          }
          const savedFields = readSavedFields(request.id);
          if (savedFields) {
            dispatch({ type: "APPLY_LOCAL_FIELDS", fields: savedFields });
          }
        }
      } catch (err) {
        dispatch({ type: "SET_ERROR", error: err.message });
        dispatch({ type: "SET_LOADING", value: false });
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.loading && state.requestId) {
      saveStep(state.requestId, state.step);
    }
  }, [state.step, state.requestId, state.loading]);

  useEffect(() => {
    if (!state.loading && state.requestId) {
      saveFields(state.requestId, state.fields);
    }
  }, [state.fields, state.requestId, state.loading]);

  function setField(field, value) {
    dispatch({ type: "SET_FIELD", field, value });
  }

  async function saveDraft() {
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await updateDraftRequest(state.requestId, buildWizardPayload(state.fields));
    } finally {
      dispatch({ type: "SET_SAVING", value: false });
    }
  }

  async function goNext() {
    try {
      await saveDraft();
      dispatch({ type: "SET_STEP", step: Math.min(state.step + 1, STEPS.length - 1) });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err.message });
      showError(err.message || t("wizard.saveProgressError"));
    }
  }

  function goBack() {
    dispatch({ type: "SET_STEP", step: Math.max(state.step - 1, 0) });
  }

  async function handleSubmit() {
    if (state.saving) return;
    dispatch({ type: "SET_SAVING", value: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      await updateDraftRequest(state.requestId, buildWizardPayload(state.fields));
      await submitRequest(state.requestId);
      clearWizardProgress(state.requestId);
      showSuccess(t("wizard.submitSuccess"));
      navigate("/portal/dashboard");
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err.message });
      dispatch({ type: "SET_SAVING", value: false });
      showError(err.message || t("wizard.submitError"));
    }
  }

  if (state.loading) {
    return <p className="portal-loading">{t("wizard.loading")}</p>;
  }

  const StepComponent = STEPS[state.step].Component;
  const isLastStep = state.step === STEPS.length - 1;

  return (
    <div>
      <h1 className="portal-page-title">{t("wizard.pageTitle")}</h1>
      <p className="portal-page-sub">
        {t("wizard.pageSubtitle")}
      </p>

      {state.error && <p className="portal-error">{state.error}</p>}

      <WizardProgressBar steps={STEPS} currentStep={state.step} />

      <section className="portal-section">
        <StepComponent state={state} setField={setField} dispatch={dispatch} requestId={state.requestId} />

        <div className="wizard-nav">
          <button type="button" className="btn" onClick={goBack} disabled={state.step === 0 || state.saving}>
            {t("wizard.back")}
          </button>
          {isLastStep ? (
            <button type="button" className="btn btn-solid" onClick={handleSubmit} disabled={state.saving}>
              {state.saving ? t("wizard.submitting") : t("wizard.submitRequest")}
            </button>
          ) : (
            <button type="button" className="btn btn-solid" onClick={goNext} disabled={state.saving}>
              {state.saving ? t("wizard.savingStep") : t("wizard.next")}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
