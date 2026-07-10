export const initialWizardState = {
  requestId: null,
  step: 0,
  fields: {
    requestName: "",
    roomType: "",
    requestDetails: "",
    lengthMeters: "",
    widthMeters: "",
    ceilingHeightMeters: "",
    spatialNotes: "",
    budgetMin: "",
    budgetMax: "",
    styleTags: [],
    worksFromHome: false,
    entertainsOften: false,
    hasKids: false,
    hasPets: false,
    storageNeeds: "",
    windowDirection: "",
    naturalLightLevel: "",
    artificialLightingNotes: "",
    timeline: "",
    avoidNotes: "",
    sourcingLocation: "",
  },
  attachments: [],
  loading: true,
  saving: false,
  error: null,
};

export function wizardReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, fields: { ...state.fields, [action.field]: action.value } };

    case "SET_STEP":
      return { ...state, step: action.step };

    case "APPLY_LOCAL_FIELDS":
      return { ...state, fields: { ...state.fields, ...action.fields } };

    case "SET_LOADING":
      return { ...state, loading: action.value };

    case "SET_SAVING":
      return { ...state, saving: action.value };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "SET_REQUEST_ID":
      return { ...state, requestId: action.requestId };

    case "ADD_ATTACHMENT":
      return { ...state, attachments: [...state.attachments, action.attachment] };

    case "REMOVE_ATTACHMENT":
      return {
        ...state,
        attachments: state.attachments.filter((a) => a.id !== action.attachmentId),
      };

    case "UPDATE_ATTACHMENT_NOTE":
      return {
        ...state,
        attachments: state.attachments.map((a) =>
          a.id === action.attachmentId ? { ...a, note: action.note } : a
        ),
      };

    case "HYDRATE":
      return {
        ...state,
        requestId: action.request.id,
        fields: {
          requestName: action.request.requestName || "",
          roomType: action.request.roomType || "",
          requestDetails: action.request.requestDetails || "",
          lengthMeters: action.request.lengthMeters ?? "",
          widthMeters: action.request.widthMeters ?? "",
          ceilingHeightMeters: action.request.ceilingHeightMeters ?? "",
          spatialNotes: action.request.spatialNotes || "",
          budgetMin: action.request.budgetMin ?? "",
          budgetMax: action.request.budgetMax ?? "",
          styleTags: action.request.styleTags || [],
          worksFromHome: !!action.request.worksFromHome,
          entertainsOften: !!action.request.entertainsOften,
          hasKids: !!action.request.hasKids,
          hasPets: !!action.request.hasPets,
          storageNeeds: action.request.storageNeeds || "",
          windowDirection: action.request.windowDirection || "",
          naturalLightLevel: action.request.naturalLightLevel || "",
          artificialLightingNotes: action.request.artificialLightingNotes || "",
          timeline: action.request.timeline || "",
          avoidNotes: action.request.avoidNotes || "",
          sourcingLocation: action.request.sourcingLocation || "",
        },
        attachments: action.request.attachments || [],
        loading: false,
      };

    default:
      return state;
  }
}

export function attachmentsByCategory(attachments, category) {
  return attachments.filter((a) => a.category === category);
}
