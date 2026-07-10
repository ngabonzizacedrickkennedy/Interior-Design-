import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../components/toast/ToastContext";
import * as designerActions from "../../api/actions/designerProfile";
import * as interviewActions from "../../api/actions/interviews";
import "../PortalLayout.css";

const SpeechRecognitionApi =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={"staff-tab" + (active ? " is-active" : "")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function ProfessionalBackground() {
  const { t } = useTranslation("staff");
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState("background");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [links, setLinks] = useState({ githubUrl: "", portfolioUrl: "", otherLinkUrl: "" });
  const [savingLinks, setSavingLinks] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvFileLabel, setCvFileLabel] = useState(t("professionalBackground.cv.noFileChosen"));
  const [uploadingCv, setUploadingCv] = useState(false);

  const [session, setSession] = useState(null);
  const [interviewActive, setInterviewActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [interviewError, setInterviewError] = useState(null);
  const [sttError, setSttError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognizerRef = useRef(null);
  const stopRequestedRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await designerActions.getMyDesignerProfile();
        setProfile(p);
        setLinks({
          githubUrl: p.githubUrl || "",
          portfolioUrl: p.portfolioUrl || "",
          otherLinkUrl: p.otherLinkUrl || "",
        });
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
    interviewActions.getMyLatestInterview().then(setSession).catch(() => {});
    return () => stopMedia();
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [interviewActive]);

  function stopMedia() {
    stopRequestedRef.current = true;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch { /* already stopped */ }
      recognizerRef.current = null;
    }
    window.speechSynthesis?.cancel();
  }

  function stopRecognition() {
    stopRequestedRef.current = true;
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch { /* already stopped */ }
      recognizerRef.current = null;
    }
  }

  function startRecognition() {
    if (!SpeechRecognitionApi) return;
    stopRecognition();
    stopRequestedRef.current = false;

    const recognizer = new SpeechRecognitionApi();
    recognizer.lang = "en-US";
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setLiveTranscript(text);
    };
    recognizer.onerror = (e) => {
      console.error("Speech recognition error:", e.error);
      if (e.error !== "no-speech" && e.error !== "aborted") setSttError(e.error);
    };
    recognizer.onend = () => {
      if (!stopRequestedRef.current) {
        try { recognizer.start(); } catch { /* already running */ }
      }
    };

    try { recognizer.start(); } catch { /* already running */ }
    recognizerRef.current = recognizer;
  }

  async function handleSaveLinks(e) {
    e.preventDefault();
    setSavingLinks(true);
    try {
      const updated = await designerActions.updateMyDesignerProfileLinks(links);
      setProfile(updated);
      showSuccess(t("professionalBackground.links.saveSuccess"));
    } catch (e) {
      showError(e.message || t("professionalBackground.links.saveError"));
    } finally { setSavingLinks(false); }
  }

  function handleCvFileChange(e) {
    const f = e.target.files?.[0];
    if (f) { setCvFile(f); setCvFileLabel(f.name); }
  }

  async function handleUploadCv() {
    if (!cvFile) return;
    setUploadingCv(true);
    try {
      const updated = await designerActions.uploadMyCv(cvFile);
      setProfile(updated);
      setCvFile(null);
      setCvFileLabel(t("professionalBackground.cv.noFileChosen"));
      showSuccess(t("professionalBackground.cv.uploadSuccess"));
    } catch (e) {
      showError(e.message || t("professionalBackground.cv.uploadError"));
    } finally { setUploadingCv(false); }
  }

  async function setupMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      /* camera/mic denied - interview still works via manual transcript entry */
    }
  }

  function askQuestion(text) {
    setLiveTranscript("");
    setSttError(null);
    stopRecognition();

    if (window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => { setSpeaking(false); startRecognition(); };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } else {
      startRecognition();
    }
  }

  async function startInterview() {
    setStarting(true);
    setInterviewError(null);
    try {
      const s = await interviewActions.generateInterview();
      setSession(s);
      setQuestionIndex(0);
      setAnswers([]);
      setLiveTranscript("");
      setInterviewActive(true);
      await setupMedia();
      askQuestion(s.questions[0]);
    } catch (e) {
      setInterviewError(e.message || t("professionalBackground.interview.startError"));
    } finally { setStarting(false); }
  }

  function repeatQuestion() {
    if (session) askQuestion(session.questions[questionIndex]);
  }

  async function handleNext() {
    const updatedAnswers = [...answers, { question: session.questions[questionIndex], answer: liveTranscript }];
    setAnswers(updatedAnswers);
    setLiveTranscript("");

    if (questionIndex + 1 < session.questions.length) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      askQuestion(session.questions[nextIndex]);
      return;
    }

    setSubmitting(true);
    try {
      stopMedia();
      const result = await interviewActions.submitInterview(session.id, updatedAnswers);
      setSession(result);
      setInterviewActive(false);
      showSuccess(t("professionalBackground.interview.submitSuccess"));
    } catch (e) {
      setInterviewError(e.message || t("professionalBackground.interview.scoreError"));
    } finally { setSubmitting(false); }
  }

  if (loading) return <p className="portal-loading">{t("professionalBackground.loading")}</p>;

  return (
    <div>
      <h1 className="portal-page-title">{t("professionalBackground.title")}</h1>
      <p className="portal-page-sub">{t("professionalBackground.subtitle")}</p>

      {error && <p className="portal-error">{error}</p>}

      <div className="staff-tabs">
        <TabButton active={activeTab === "background"} onClick={() => setActiveTab("background")}>
          {t("professionalBackground.tabs.background")}
        </TabButton>
        <TabButton active={activeTab === "interview"} onClick={() => setActiveTab("interview")}>
          {t("professionalBackground.tabs.interview")}
        </TabButton>
      </div>

      {activeTab === "background" && (
        <>
          <section className="portal-section">
            <h2 className="portal-section__title">{t("professionalBackground.cv.title")}</h2>
            {profile?.cvFileUrl && (
              <div style={{ marginBottom: "1rem" }}>
                <p>
                  {t("professionalBackground.cv.currentFile")} <a href={profile.cvFileUrl} target="_blank" rel="noreferrer">{profile.cvOriginalFilename}</a>
                </p>
                {profile.cvAnalyzedAt && (
                  <div style={{
                    marginTop: "0.5rem",
                    padding: "0.85rem 1rem",
                    borderRadius: 12,
                    background: "var(--color-bg-alt)",
                    border: "1px solid var(--color-line)",
                    borderLeft: "3px solid var(--color-accent)",
                  }}>
                    {profile.cvIsValidDocument === false ? (
                      <p style={{ fontWeight: 600 }}>{t("professionalBackground.cv.notValidDocument")}</p>
                    ) : (
                      <p style={{ fontWeight: 600 }}>{t("professionalBackground.cv.strengthScore", { score: profile.cvStrengthScore })}</p>
                    )}
                    <p style={{ fontSize: "0.9rem", color: "var(--color-ink-soft)", marginTop: "0.4rem" }}>
                      {profile.cvReasoning}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="portal-form-row">
              <div className="field">
                <label>{t("professionalBackground.cv.uploadLabel")}</label>
                <input type="file" accept="application/pdf" onChange={handleCvFileChange} />
                <small style={{ color: "var(--color-ink-soft)", display: "block", marginTop: "0.25rem" }}>
                  {cvFileLabel}
                </small>
              </div>
            </div>
            <button className="btn btn-solid" disabled={!cvFile || uploadingCv} onClick={handleUploadCv}>
              {uploadingCv ? t("professionalBackground.cv.uploadingAndAnalyzing") : t("professionalBackground.cv.uploadButton")}
            </button>
          </section>

          <section className="portal-section">
            <h2 className="portal-section__title">{t("professionalBackground.links.title")}</h2>
            <form onSubmit={handleSaveLinks}>
              <div className="portal-form-row">
                <div className="field">
                  <label>{t("professionalBackground.links.github")}</label>
                  <input type="url" placeholder="https://github.com/yourname"
                    value={links.githubUrl}
                    onChange={(e) => setLinks({ ...links, githubUrl: e.target.value })} />
                </div>
                <div className="field">
                  <label>{t("professionalBackground.links.portfolio")}</label>
                  <input type="url" placeholder="https://yourportfolio.com"
                    value={links.portfolioUrl}
                    onChange={(e) => setLinks({ ...links, portfolioUrl: e.target.value })} />
                </div>
                <div className="field">
                  <label>{t("professionalBackground.links.other")}</label>
                  <input type="url" placeholder="https://..."
                    value={links.otherLinkUrl}
                    onChange={(e) => setLinks({ ...links, otherLinkUrl: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-solid" disabled={savingLinks}>
                {savingLinks ? t("professionalBackground.links.saving") : t("professionalBackground.links.save")}
              </button>
            </form>
          </section>
        </>
      )}

      {activeTab === "interview" && (
        <section className="portal-section">
          <h2 className="portal-section__title">{t("professionalBackground.interview.title")}</h2>

          {!profile?.cvFileUrl ? (
            <p className="portal-empty">{t("professionalBackground.interview.uploadCvFirst")}</p>
          ) : interviewError ? (
            <p className="portal-error">{interviewError}</p>
          ) : interviewActive && session ? (
            <div>
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                <video ref={videoRef} autoPlay muted playsInline
                  style={{ width: 280, height: 210, borderRadius: 12, background: "#000", boxShadow: "0 8px 24px rgba(33,31,26,0.15)" }} />
                <div style={{ flex: 1, minWidth: 260 }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-ink-soft)" }}>
                    {t("professionalBackground.interview.questionProgress", { current: questionIndex + 1, total: session.questions.length })} {speaking && t("professionalBackground.interview.aiSpeaking")}
                  </p>
                  <p style={{ fontWeight: 600, fontSize: "1.05rem", marginTop: "0.25rem" }}>
                    {session.questions[questionIndex]}
                  </p>
                  <button type="button" className="btn" style={{ marginTop: "0.5rem" }} onClick={repeatQuestion}>
                    {t("professionalBackground.interview.repeatQuestion")}
                  </button>
                  {!SpeechRecognitionApi && (
                    <p style={{ fontSize: "0.8rem", color: "var(--color-ink-soft)", marginTop: "0.75rem" }}>
                      {t("professionalBackground.interview.noSpeechSupport")}
                    </p>
                  )}
                  {sttError && (
                    <p className="portal-error" style={{ marginTop: "0.75rem" }}>
                      {t("professionalBackground.interview.micError", { error: sttError })}
                    </p>
                  )}
                  <div className="field" style={{ marginTop: "1rem" }}>
                    <label>{t("professionalBackground.interview.yourAnswer")}</label>
                    <textarea rows={5} value={liveTranscript}
                      onChange={(e) => setLiveTranscript(e.target.value)} />
                  </div>
                  <button className="btn btn-solid" disabled={submitting} onClick={handleNext}>
                    {submitting
                      ? t("professionalBackground.interview.scoring")
                      : questionIndex + 1 < session.questions.length ? t("professionalBackground.interview.nextQuestion") : t("professionalBackground.interview.send")}
                  </button>
                </div>
              </div>
            </div>
          ) : session?.status === "COMPLETED" ? (
            <div>
              <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>{t("professionalBackground.interview.score", { score: session.overallScore })}</p>
              <p style={{ color: "var(--color-ink-soft)", marginTop: "0.4rem" }}>{session.reasoning}</p>
              <button className="btn btn-solid" style={{ marginTop: "1rem" }} disabled={starting} onClick={startInterview}>
                {starting ? t("professionalBackground.interview.starting") : t("professionalBackground.interview.retake")}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--color-ink-soft)" }}>
                {t("professionalBackground.interview.description")}
              </p>
              <button className="btn btn-solid" style={{ marginTop: "1rem" }} disabled={starting} onClick={startInterview}>
                {starting ? t("professionalBackground.interview.starting") : t("professionalBackground.interview.startInterview")}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
