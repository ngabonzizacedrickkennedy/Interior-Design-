export function WizardProgressBar({ steps, currentStep }) {
  return (
    <ol className="wizard-progress">
      {steps.map((s, idx) => (
        <li
          key={s.key}
          className={
            "wizard-progress__step" +
            (idx === currentStep ? " is-active" : "") +
            (idx < currentStep ? " is-done" : "")
          }
        >
          <span className="wizard-progress__index">{idx + 1}</span>
          <span className="wizard-progress__label">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
