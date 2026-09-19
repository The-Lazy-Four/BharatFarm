import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  selectVoice,
  speakFarmerSpeech,
  getIndianLocale,
  SupportedLangShort,
  VoiceSelectionResult
} from "../utils/voiceUtils";
import {
  SAHAYAK_GREETINGS,
  SAHAYAK_KNOWLEDGE_MODULES,
  matchSahayakDemoIntent
} from "../utils/sahayakDemoKnowledge";

/* CSS injected via style tag */
const CSS = `
  @keyframes callRingPulse {
    0%   { box-shadow: 0 0 0 0   rgba(16,185,129,.6); }
    70%  { box-shadow: 0 0 0 24px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0   rgba(16,185,129,0); }
  }
  @keyframes wave1 { 0%,100%{height:6px}  50%{height:26px} }
  @keyframes wave2 { 0%,100%{height:12px} 50%{height:36px} }
  @keyframes wave3 { 0%,100%{height:16px} 50%{height:28px} }
  @keyframes wave4 { 0%,100%{height:10px} 50%{height:22px} }
  @keyframes wave5 { 0%,100%{height:8px}  50%{height:32px} }
  @keyframes micPulse {
    0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(239,68,68,.7)}
    50%{transform:scale(1.06);box-shadow:0 0 0 16px rgba(239,68,68,0)}
  }
  @keyframes dtmfPress {
    0%{transform:scale(1)} 40%{transform:scale(.91);background:rgba(16,185,129,.25)} 100%{transform:scale(1)}
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes dialingDot {
    0%,80%,100%{opacity:.2;transform:scale(.7)} 40%{opacity:1;transform:scale(1)}
  }
  .csc-overlay{
    position:fixed;inset:0;
    background:rgba(5,10,20,.82);
    backdrop-filter:blur(10px);
    display:flex;align-items:center;justify-content:center;
    z-index:9999;padding:.75rem;
  }
  .csc-phone{
    background:linear-gradient(160deg,#0D1B2A 0%,#0F172A 60%,#0D1B2A 100%);
    border-radius:36px;
    width:100%;max-width:420px;
    height:94vh;max-height:860px;
    display:flex;flex-direction:column;
    box-shadow:0 30px 80px -12px rgba(0,0,0,.8),0 0 0 1.5px #1E293B;
    overflow:hidden;position:relative;
  }
  @media(max-width:450px){
    .csc-phone{border-radius:20px;height:100dvh;max-height:100dvh;}
    .csc-overlay{padding:0;align-items:flex-end;}
  }
  .dtmf-btn{
    background:rgba(30,41,59,.85);
    border:1px solid rgba(51,65,85,.7);
    border-radius:50%;
    width:64px;height:64px;
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    cursor:pointer;color:#F8FAFC;
    transition:background .1s,transform .1s;
    user-select:none;
    -webkit-tap-highlight-color:transparent;
    position:relative;
  }
  .dtmf-btn:active,.dtmf-btn.pressed{
    animation:dtmfPress .22s ease;
    background:rgba(16,185,129,.18);
    border-color:#10B981;
  }
  .dtmf-btn:disabled{opacity:.35;cursor:not-allowed;}
  .dtmf-main{font-size:1.4rem;font-weight:700;line-height:1;}
  .dtmf-sub{font-size:.5rem;color:#64748B;font-weight:700;letter-spacing:.06em;margin-top:1px;}
  .dtmf-svc{font-size:.44rem;color:#34D399;font-weight:800;margin-top:1px;letter-spacing:.02em;}
  .tx-bubble{
    animation:slideUp .24s ease;
    border-radius:16px;
    padding:.65rem .85rem;
    font-size:.82rem;
    line-height:1.45;
    word-break:break-word;
    white-space:pre-wrap;
    max-width:88%;
  }
  .tx-bubble.ai{
    background:#1E293B;border:1px solid #334155;
    align-self:flex-start;border-bottom-left-radius:4px;
  }
  .tx-bubble.farmer{
    background:linear-gradient(135deg,#064E3B,#065F46);
    border:1px solid rgba(52,211,153,.25);
    align-self:flex-end;border-bottom-right-radius:4px;
  }
  .tx-bubble.interim{
    background:rgba(180,83,9,.2);border:1px dashed #F59E0B;
    color:#FDE68A;align-self:flex-end;border-bottom-right-radius:4px;
    font-style:italic;
  }
  .view-tab{
    background:transparent;border:none;border-radius:20px;
    padding:.35rem .85rem;font-size:.74rem;font-weight:700;
    color:#94A3B8;cursor:pointer;transition:all .2s;
  }
  .view-tab.active{background:rgba(16,185,129,.18);color:#34D399;}
  .speech-pill{
    background:rgba(30,41,59,.8);border:1px solid #334155;
    border-radius:20px;padding:.32rem .75rem;
    font-size:.72rem;color:#CBD5E1;font-weight:600;
    cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0;
  }
  .speech-pill:hover{background:rgba(16,185,129,.12);border-color:#10B981;color:#FFF;}
  .speech-pill:disabled{opacity:.4;cursor:not-allowed;}
  .wave-bar{width:4px;border-radius:3px;background:#10B981;}
  .wave-bar:nth-child(1){animation:wave1 .9s  ease-in-out infinite;}
  .wave-bar:nth-child(2){animation:wave2 1.1s ease-in-out infinite;}
  .wave-bar:nth-child(3){animation:wave3 .8s  ease-in-out infinite;}
  .wave-bar:nth-child(4){animation:wave4 1.2s ease-in-out infinite;}
  .wave-bar:nth-child(5){animation:wave5 1.0s ease-in-out infinite;}
  .dialing-dot{width:10px;height:10px;border-radius:50%;background:#34D399;display:inline-block;}
  .dialing-dot:nth-child(1){animation:dialingDot 1.4s .0s infinite;}
  .dialing-dot:nth-child(2){animation:dialingDot 1.4s .2s infinite;}
  .dialing-dot:nth-child(3){animation:dialingDot 1.4s .4s infinite;}
`;

interface CallSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TxItem {
  speaker: "ai" | "farmer";
  text: string;
  dtmf?: string;
  time: string;
  detectedIntent?: string;
}

interface MenuOpt {
  key: string;
  label: string;
}

const KEYS = [
  { num: "1", alpha: "",     svc: "Before Sow" },
  { num: "2", alpha: "ABC",  svc: "Climate" },
  { num: "3", alpha: "DEF",  svc: "Group Sell" },
  { num: "4", alpha: "GHI",  svc: "Insurance" },
  { num: "5", alpha: "JKL",  svc: "Mandi" },
  { num: "6", alpha: "MNO",  svc: "Basic Needs" },
  { num: "7", alpha: "PQRS", svc: "" },
  { num: "8", alpha: "TUV",  svc: "Repeat" },
  { num: "9", alpha: "WXYZ", svc: "Menu" },
  { num: "*", alpha: "",     svc: "Back" },
  { num: "0", alpha: "+",    svc: "Help" },
  { num: "#", alpha: "",     svc: "End" },
];

const SCENARIOS = [
  { label: "🌦️ Kal baarish?", q: "Kal baarish hogi kya?", lang: "hi", tag: "Climate" },
  { label: "🌾 Mandi rate", q: "Mere paas wali mandi mein dhan ka kya rate hai?", lang: "hi", tag: "Mandi" },
  { label: "🌱 Kaun si fasal?", q: "Is baar kaunsa crop lagana sahi rahega?", lang: "hi", tag: "Before Sow" },
  { label: "🛡️ Fasal bima", q: "Insurance claim kaise verify hota hai?", lang: "hi", tag: "Insurance" },
  { label: "🤝 Group sell", q: "Mujhe group mein fasal bechni hai", lang: "hi", tag: "Aggregation" },
  { label: "📸 Leaf scan", q: "Leaf scanner kaise use karu?", lang: "hi", tag: "Basic Needs" },
  { label: "🌧️ বৃষ্টি হবে?", q: "আগামীকাল কি বৃষ্টি হবে?", lang: "bn", tag: "Climate" },
  { label: "🌾 ধানের দাম", q: "আজ ধানের মান্ডি দর কত?", lang: "bn", tag: "Mandi" },
  { label: "🌽 Best crop", q: "What should I sow this season?", lang: "en", tag: "Before Sow" },
  { label: "⚡ Mandi price", q: "What is the nearest mandi for paddy?", lang: "en", tag: "Mandi" }
];

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [callState, setCallState] = useState<"IDLE" | "DIALING" | "CONNECTED" | "ENDED">("IDLE");
  const [callDuration, setCallDuration] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [currentStep, setCurrentStep] = useState("WELCOME_LANGUAGE");
  const [language, setLanguage] = useState<SupportedLangShort>("hi");
  const [displayPrompt, setDisplayPrompt] = useState("");
  const [optionsMenu, setOptionsMenu] = useState<MenuOpt[]>([]);
  const [transcript, setTranscript] = useState<TxItem[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [speechSupported, setSpeechSupported] = useState(false);
  const [customQuery, setCustomQuery] = useState("");
  const [activeView, setActiveView] = useState<"call" | "transcript" | "quick">("call");
  const [pressedKey, setPressedKey] = useState("");
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);
  const [voiceInfo, setVoiceInfo] = useState<VoiceSelectionResult | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);

  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const txEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setSpeechSupported(true);
      const r = new SR();
      r.continuous = false;
      r.interimResults = true;

      r.onstart = () => {
        setIsListening(true);
        setInterimText("");
        setSttError(null);
      };

      r.onresult = (e: any) => {
        let interim = "";
        let final = "";
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (interim) setInterimText(interim);
        if (final) {
          setInterimText("");
          setIsListening(false);
          sendSpeech(final.trim());
        }
      };

      r.onerror = (err: any) => {
        setIsListening(false);
        setInterimText("");
        if (err.error === 'not-allowed') setSttError("Microphone access denied. Please allow microphone in browser.");
        else if (err.error === 'no-speech') setSttError("No speech detected. Tap Speak to try again.");
        else setSttError(`Speech recognition error (${err.error}). You can type below.`);
      };

      r.onend = () => setIsListening(false);
      recognitionRef.current = r;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoice = () => {
        const sel = selectVoice(language);
        setVoiceInfo(sel);
      };
      updateVoice();
      window.speechSynthesis.onvoiceschanged = updateVoice;
    }
  }, [language]);

  useEffect(() => {
    if (callState === "CONNECTED") {
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  useEffect(() => {
    txEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, interimText]);

  useEffect(() => {
    if (isOpen && callState === "IDLE") startCall();
    if (!isOpen) {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setCallState("IDLE");
    }
  }, [isOpen]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const speak = useCallback((text: string, lang: SupportedLangShort) => {
    if (!isSpeakerOn || isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
    setAiSpeaking(true);
    const sel = selectVoice(lang);
    setVoiceInfo(sel);

    speakFarmerSpeech(text, lang, {
      onStart: () => setAiSpeaking(true),
      onEnd: () => setAiSpeaking(false),
      onError: () => setAiSpeaking(false)
    });
  }, [isSpeakerOn, isMuted]);

  const handleResp = useCallback((data: any) => {
    if (data.currentStep) setCurrentStep(data.currentStep);
    let newLang: SupportedLangShort = language;
    if (data.language) {
      const l = data.language.substring(0, 2);
      if (l === "hi" || l === "en" || l === "bn") {
        newLang = l as SupportedLangShort;
        setLanguage(newLang);
      }
    }
    if (data.activeModule) setDetectedIntent(data.activeModule);
    const prompt = data.displayPrompt || data.spokenText || "";
    setDisplayPrompt(prompt);
    setOptionsMenu(data.optionsMenu || []);

    setTranscript(prev => [
      ...prev,
      { speaker: "ai", text: prompt, time: now(), detectedIntent: data.activeModule || undefined }
    ]);

    speak(data.spokenText || prompt, newLang);
    if (data.isCallEnded) endCall();
  }, [language, speak]);

  const fallbackWelcome = () => {
    setCallState("CONNECTED");
    const welcome = SAHAYAK_GREETINGS.INITIAL_IVR;
    setDisplayPrompt(welcome.display);
    setCurrentStep("WELCOME_LANGUAGE");
    setOptionsMenu([
      { key: "1", label: "1 → हिंदी (Hindi)" },
      { key: "2", label: "2 → English" },
      { key: "3", label: "3 → বাংলা (Bengali)" }
    ]);
    setTranscript([{ speaker: "ai", text: welcome.display, time: now() }]);
    speak(welcome.spoken, "hi");
  };

  const startCall = async () => {
    const sid = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setSessionId(sid);
    setCallState("DIALING");
    setCallDuration(0);
    setTranscript([]);
    setDetectedIntent(null);
    setSttError(null);

    try {
      const r = await fetch("/api/sahayak/call/incoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, callerPhone: "+91 98312 00001" })
      });
      const j = await r.json();
      if (j.success && j.data) {
        setCallState("CONNECTED");
        handleResp(j.data);
      } else {
        fallbackWelcome();
      }
    } catch {
      fallbackWelcome();
    }
  };

  const sendDtmf = async (digit: string) => {
    if (callState !== "CONNECTED" || !sessionId) return;
    if (digit === "#") {
      endCall();
      return;
    }
    setPressedKey(digit);
    setTimeout(() => setPressedKey(""), 300);

    if (currentStep === "WELCOME_LANGUAGE") {
      let selected: SupportedLangShort = "hi";
      if (digit === "1") selected = "hi";
      else if (digit === "2") selected = "en";
      else if (digit === "3") selected = "bn";
      setLanguage(selected);
    }

    setTranscript(prev => [
      ...prev,
      { speaker: "farmer", text: `[Key ${digit} pressed]`, dtmf: digit, time: now() }
    ]);

    try {
      const r = await fetch("/api/sahayak/call/dtmf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, digits: digit })
      });
      const j = await r.json();
      if (j.success && j.data) handleResp(j.data);
    } catch (e) {
      console.error("DTMF error:", e);
    }
  };

  const sendSpeech = async (text: string) => {
    if (callState !== "CONNECTED" || !sessionId || !text.trim()) return;

    const match = matchSahayakDemoIntent(text);
    if (match.isLanguageSwitch) {
      const newL = match.targetLang || (language === 'hi' ? 'en' : 'hi');
      setLanguage(newL);
      const prompt = SAHAYAK_GREETINGS.WELCOME_AFTER_LANG[newL];
      setTranscript(prev => [
        ...prev,
        { speaker: "farmer", text, time: now() },
        { speaker: "ai", text: prompt.display, time: now() }
      ]);
      speak(prompt.spoken, newL);
      return;
    }

    if (match.moduleCode) setDetectedIntent(match.moduleCode);
    setTranscript(prev => [...prev, { speaker: "farmer", text, time: now() }]);
    setCustomQuery("");

    try {
      const r = await fetch("/api/sahayak/call/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, speechText: text, language })
      });
      const j = await r.json();
      if (j.success && j.data) {
        handleResp(j.data);
      } else if (match.moduleCode && SAHAYAK_KNOWLEDGE_MODULES[match.moduleCode]) {
        const mod = SAHAYAK_KNOWLEDGE_MODULES[match.moduleCode];
        const answer = mod.sampleAnswer[language] || mod.sampleAnswer.hi;
        setTranscript(prev => [...prev, { speaker: "ai", text: answer, time: now(), detectedIntent: match.moduleCode }]);
        speak(answer, language);
      }
    } catch (e) {
      if (match.moduleCode && SAHAYAK_KNOWLEDGE_MODULES[match.moduleCode]) {
        const mod = SAHAYAK_KNOWLEDGE_MODULES[match.moduleCode];
        const answer = mod.sampleAnswer[language] || mod.sampleAnswer.hi;
        setTranscript(prev => [...prev, { speaker: "ai", text: answer, time: now(), detectedIntent: match.moduleCode }]);
        speak(answer, language);
      }
    }
  };

  const toggleMic = () => {
    if (!speechSupported || !recognitionRef.current) {
      inputRef.current?.focus();
      return;
    }
    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
      setInterimText("");
    } else {
      if (aiSpeaking && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setAiSpeaking(false);
      }
      try {
        recognitionRef.current.lang = getIndianLocale(language);
        recognitionRef.current.start();
        setIsListening(true);
        setSttError(null);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const stopAiSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setAiSpeaking(false);
    }
  };

  const endCall = async () => {
    window.speechSynthesis?.cancel();
    setAiSpeaking(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
    if (sessionId) {
      try {
        await fetch("/api/sahayak/call/terminate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId })
        });
      } catch {}
    }
    setCallState("ENDED");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!isOpen) return null;

  return (
    <div className="csc-overlay">
      <style>{CSS}</style>
      <div className="csc-phone">

        {/* STATUS BAR */}
        <div style={{ padding: ".6rem 1.2rem .35rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".7rem", color: "#64748B", flexShrink: 0 }}>
          <span style={{ fontWeight: 800 }}>BharatFarm Sahayak AI</span>
          <div style={{ display: "flex", gap: ".45rem", alignItems: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>signal_cellular_alt</span>
            <span>5G</span>
            <span className="material-symbols-outlined" style={{ fontSize: "14px", marginLeft: "4px" }}>battery_full</span>
          </div>
        </div>

        {/* CALL HEADER */}
        <div style={{ textAlign: "center", padding: ".4rem 1rem .3rem", flexShrink: 0 }}>
          <div style={{ position: "relative", width: "62px", height: "62px", margin: "0 auto .45rem" }}>
            <div
              style={{
                width: "100%", height: "100%", borderRadius: "50%",
                background: callState === "CONNECTED"
                  ? (aiSpeaking ? "linear-gradient(135deg,#059669,#10B981)" : isListening ? "linear-gradient(135deg,#D97706,#F59E0B)" : "linear-gradient(135deg,#0F766E,#14B8A6)")
                  : "#1E293B",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: callState === "CONNECTED" ? "callRingPulse 2.4s ease-out infinite" : undefined,
                border: "2px solid rgba(52,211,153,.35)"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "30px", color: "#F8FAFC" }}>
                {isListening ? "mic" : aiSpeaking ? "record_voice_over" : "support_agent"}
              </span>
            </div>
            {aiSpeaking && (
              <div style={{
                position: "absolute", bottom: "-4px", left: "50%", transform: "translateX(-50%)",
                background: "#065F46", border: "1px solid #10B981", borderRadius: "10px",
                padding: "1px 5px", display: "flex", gap: "2px", alignItems: "center"
              }}>
                <div className="wave-bar" style={{ width: "2px" }} />
                <div className="wave-bar" style={{ width: "2px" }} />
                <div className="wave-bar" style={{ width: "2px" }} />
              </div>
            )}
          </div>

          <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#F8FAFC", letterSpacing: "-.02em" }}>
            Kisan Helpline (1800-BHARAT)
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: ".45rem", marginTop: ".15rem" }}>
            {callState === "CONNECTED" && (
              <>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: ".76rem", color: "#34D399", fontWeight: 700 }}>
                  {aiSpeaking ? "AI Speaking..." : isListening ? "Listening..." : "Connected"} · {fmt(callDuration)}
                </span>
                <span style={{ fontSize: ".65rem", background: "rgba(51,65,85,.7)", color: "#CBD5E1", padding: "1px 6px", borderRadius: "8px", fontWeight: 700 }}>
                  {language === "hi" ? "हिंदी (hi-IN)" : language === "bn" ? "বাংলা (bn-IN)" : "English (en-IN)"}
                </span>
              </>
            )}
            {callState === "DIALING" && (
              <span style={{ fontSize: ".78rem", color: "#94A3B8" }}>
                Connecting to AI Assistant<span className="dialing-dot" style={{ margin: "0 2px" }} />
              </span>
            )}
            {callState === "ENDED" && (
              <span style={{ fontSize: ".78rem", color: "#EF4444", fontWeight: 700 }}>Call Ended · {fmt(callDuration)}</span>
            )}
          </div>

          {voiceInfo && callState === "CONNECTED" && (
            <div style={{ fontSize: ".6rem", color: "#64748B", marginTop: "2px" }}>
              Voice: <span style={{ color: voiceInfo.isIndianVoice ? "#34D399" : "#94A3B8" }}>{voiceInfo.voiceName}</span>
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: "flex", justifyContent: "center", gap: ".2rem", padding: ".2rem 1rem", borderBottom: "1px solid rgba(51,65,85,.5)", flexShrink: 0 }}>
          <button className={`view-tab ${activeView === "call" ? "active" : ""}`} onClick={() => setActiveView("call")}>
            📞 Keypad & Prompt
          </button>
          <button className={`view-tab ${activeView === "quick" ? "active" : ""}`} onClick={() => setActiveView("quick")}>
            🌾 SIH Scenarios
          </button>
          <button className={`view-tab ${activeView === "transcript" ? "active" : ""}`} onClick={() => setActiveView("transcript")}>
            📜 Transcript ({transcript.length})
          </button>
        </div>

        {/* MIDDLE CONTENT */}
        <div style={{ flex: 1, overflowY: "auto", padding: ".65rem .85rem", display: "flex", flexDirection: "column", gap: ".55rem" }}>
          {activeView === "call" && (
            <>
              <div style={{ background: "rgba(30,41,59,.7)", border: "1px solid rgba(51,65,85,.7)", borderRadius: "16px", padding: ".65rem .85rem", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".3rem" }}>
                  <span style={{ fontSize: ".68rem", color: "#34D399", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>smart_toy</span>
                    SAHAYAK ASSISTANT
                  </span>
                  {aiSpeaking && (
                    <button
                      onClick={stopAiSpeech}
                      style={{ background: "rgba(239,68,68,.2)", border: "1px solid #EF4444", color: "#FCA5A5", fontSize: ".62rem", padding: "1px 6px", borderRadius: "10px", cursor: "pointer", fontWeight: 700 }}
                    >
                      Mute Audio
                    </button>
                  )}
                </div>
                <div style={{ fontSize: ".82rem", color: "#F1F5F9", lineHeight: 1.4, whiteSpace: "pre-wrap" }}>
                  {displayPrompt || "Dialing BharatFarm Sahayak..."}
                </div>
                {detectedIntent && (
                  <div style={{ marginTop: ".45rem", display: "inline-block", background: "rgba(16,185,129,.15)", border: "1px solid rgba(16,185,129,.3)", borderRadius: "8px", padding: "2px 7px", fontSize: ".62rem", color: "#34D399", fontWeight: 700 }}>
                    Active Module: {detectedIntent}
                  </div>
                )}
              </div>

              {optionsMenu.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem" }}>
                  {optionsMenu.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => sendDtmf(opt.key)}
                      style={{
                        background: "rgba(15,23,42,.8)", border: "1px solid rgba(51,65,85,.8)",
                        borderRadius: "12px", padding: ".3rem .6rem", color: "#E2E8F0",
                        fontSize: ".73rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: ".3rem"
                      }}
                    >
                      <span style={{ background: "#10B981", color: "#064E3B", borderRadius: "6px", padding: "1px 5px", fontSize: ".65rem", fontWeight: 800 }}>
                        {opt.key}
                      </span>
                      {opt.label.replace(/^[0-9]\s*→\s*/, "")}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: ".5rem", justifyItems: "center", margin: "auto 0 .2rem" }}>
                {KEYS.map(k => (
                  <button
                    key={k.num}
                    className={`dtmf-btn ${pressedKey === k.num ? "pressed" : ""}`}
                    disabled={callState !== "CONNECTED"}
                    onClick={() => sendDtmf(k.num)}
                  >
                    <span className="dtmf-main">{k.num}</span>
                    {k.alpha && <span className="dtmf-sub">{k.alpha}</span>}
                    {k.svc && <span className="dtmf-svc">{k.svc}</span>}
                  </button>
                ))}
              </div>
            </>
          )}

          {activeView === "quick" && (
            <div style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
              <div style={{ fontSize: ".75rem", color: "#94A3B8" }}>
                Tap any pre-tested SIH scenario query to speak immediately:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: ".4rem" }}>
                {SCENARIOS.map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sendSpeech(sc.q);
                      setActiveView("call");
                    }}
                    disabled={callState !== "CONNECTED"}
                    style={{
                      background: "rgba(30,41,59,.7)", border: "1px solid rgba(51,65,85,.7)",
                      borderRadius: "12px", padding: ".55rem .75rem", display: "flex",
                      justifyContent: "space-between", alignItems: "center", textAlign: "left", cursor: "pointer"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: ".8rem", color: "#F8FAFC", fontWeight: 600 }}>{sc.label}</div>
                      <div style={{ fontSize: ".7rem", color: "#94A3B8", marginTop: "2px" }}>"{sc.q}"</div>
                    </div>
                    <span style={{ fontSize: ".62rem", background: "rgba(16,185,129,.15)", color: "#34D399", padding: "2px 6px", borderRadius: "6px", fontWeight: 700 }}>
                      {sc.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeView === "transcript" && (
            <div style={{ display: "flex", flexDirection: "column", gap: ".55rem" }}>
              {transcript.map((item, idx) => (
                <div key={idx} className={`tx-bubble ${item.speaker}`}>
                  <div style={{ fontSize: ".65rem", color: item.speaker === "ai" ? "#34D399" : "#6EE7B7", fontWeight: 800, marginBottom: "2px", display: "flex", justifyContent: "space-between" }}>
                    <span>{item.speaker === "ai" ? "🤖 SAHAYAK AI" : "🧑‍🌾 FARMER"}</span>
                    <span>{item.time}</span>
                  </div>
                  <div>{item.text}</div>
                  {item.detectedIntent && (
                    <div style={{ fontSize: ".62rem", color: "#FDE68A", marginTop: "4px" }}>
                      Detected: {item.detectedIntent}
                    </div>
                  )}
                </div>
              ))}
              {interimText && (
                <div className="tx-bubble interim">
                  <div style={{ fontSize: ".65rem", color: "#F59E0B", fontWeight: 800, marginBottom: "2px" }}>
                    🎙️ Listening...
                  </div>
                  <div>"{interimText}"</div>
                </div>
              )}
              <div ref={txEndRef} />
            </div>
          )}
        </div>

        {/* INTERIM LISTENING BAR */}
        {isListening && (
          <div style={{ background: "rgba(239,68,68,.18)", borderTop: "1px solid rgba(239,68,68,.35)", padding: ".4rem .85rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
              <span className="material-symbols-outlined" style={{ color: "#EF4444", fontSize: "16px", animation: "micPulse 1.2s infinite" }}>
                mic
              </span>
              <span style={{ fontSize: ".72rem", color: "#FCA5A5", fontWeight: 700 }}>
                {interimText ? `"${interimText}"` : "Listening to your voice..."}
              </span>
            </div>
            <button
              onClick={() => {
                try { recognitionRef.current?.stop(); } catch {}
                setIsListening(false);
              }}
              style={{ background: "#EF4444", color: "#FFF", border: "none", borderRadius: "10px", padding: "2px 8px", fontSize: ".65rem", fontWeight: 800, cursor: "pointer" }}
            >
              Stop
            </button>
          </div>
        )}

        {sttError && (
          <div style={{ background: "rgba(220,38,38,.2)", color: "#FCA5A5", fontSize: ".68rem", padding: ".3rem .8rem", textAlign: "center", borderTop: "1px solid rgba(239,68,68,.3)", flexShrink: 0 }}>
            {sttError}
          </div>
        )}

        {/* BOTTOM CONTROLS */}
        <div style={{ padding: ".65rem .85rem .9rem", background: "rgba(10,15,28,.95)", borderTop: "1px solid rgba(51,65,85,.6)", display: "flex", flexDirection: "column", gap: ".5rem", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
            <input
              ref={inputRef}
              type="text"
              placeholder={language === "hi" ? "Boliye ya type kijiye..." : language === "bn" ? "বলুন বা টাইপ করুন..." : "Speak or type your question..."}
              value={customQuery}
              onChange={e => setCustomQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && customQuery.trim()) sendSpeech(customQuery);
              }}
              disabled={callState !== "CONNECTED"}
              style={{
                flex: 1, background: "rgba(30,41,59,.8)", border: "1px solid #334155", borderRadius: "20px",
                padding: ".4rem .85rem", color: "#F8FAFC", fontSize: ".75rem", outline: "none"
              }}
            />
            {customQuery.trim() && (
              <button
                onClick={() => sendSpeech(customQuery)}
                style={{
                  background: "#10B981", border: "none", borderRadius: "50%", width: "32px", height: "32px",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#064E3B", flexShrink: 0
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>send</span>
              </button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            <button
              onClick={() => setIsMuted(m => !m)}
              style={{
                background: isMuted ? "rgba(239,68,68,.2)" : "rgba(30,41,59,.8)",
                border: `1px solid ${isMuted ? "#EF4444" : "#334155"}`,
                borderRadius: "50%", width: "46px", height: "46px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: isMuted ? "#EF4444" : "#94A3B8", cursor: "pointer"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                {isMuted ? "mic_off" : "mic"}
              </span>
            </button>

            <button
              onClick={toggleMic}
              disabled={callState !== "CONNECTED"}
              style={{
                background: isListening ? "linear-gradient(135deg,#DC2626,#EF4444)" : "linear-gradient(135deg,#059669,#10B981)",
                border: "none", borderRadius: "50%", width: "56px", height: "56px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                color: "#FFF", cursor: "pointer",
                boxShadow: isListening ? "0 0 20px rgba(239,68,68,.6)" : "0 4px 15px rgba(16,185,129,.4)",
                animation: isListening ? "micPulse 1.4s infinite" : undefined
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                {isListening ? "hearing" : "mic"}
              </span>
              <span style={{ fontSize: ".5rem", fontWeight: 800, marginTop: "1px" }}>
                {isListening ? "LISTENING" : "SPEAK"}
              </span>
            </button>

            {callState === "CONNECTED" ? (
              <button
                onClick={endCall}
                style={{
                  background: "linear-gradient(135deg,#B91C1C,#DC2626)", border: "none", borderRadius: "50%",
                  width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#FFF", cursor: "pointer", boxShadow: "0 4px 12px rgba(220,38,38,.5)"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>call_end</span>
              </button>
            ) : (
              <button
                onClick={startCall}
                style={{
                  background: "linear-gradient(135deg,#059669,#10B981)", border: "none", borderRadius: "50%",
                  width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#FFF", cursor: "pointer"
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>call</span>
              </button>
            )}

            <button
              onClick={() => {
                endCall();
                onClose();
              }}
              style={{
                background: "rgba(30,41,59,.8)", border: "1px solid #334155", borderRadius: "50%",
                width: "46px", height: "46px", display: "flex", alignItems: "center", justifyContent: "center",
                color: "#94A3B8", cursor: "pointer"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
