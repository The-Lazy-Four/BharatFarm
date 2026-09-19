import React, { useState, useEffect, useRef, useCallback } from "react";

/* CSS injected via style tag */
const CSS = `
  @keyframes callRingPulse {
    0%   { box-shadow: 0 0 0 0   rgba(16,185,129,.55); }
    70%  { box-shadow: 0 0 0 22px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0   rgba(16,185,129,0); }
  }
  @keyframes wave1 { 0%,100%{height:6px}  50%{height:22px} }
  @keyframes wave2 { 0%,100%{height:10px} 50%{height:32px} }
  @keyframes wave3 { 0%,100%{height:14px} 50%{height:26px} }
  @keyframes wave4 { 0%,100%{height:8px}  50%{height:20px} }
  @keyframes wave5 { 0%,100%{height:6px}  50%{height:28px} }
  @keyframes micPulse {
    0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(245,158,11,.6)}
    50%{transform:scale(1.08);box-shadow:0 0 0 14px rgba(245,158,11,0)}
  }
  @keyframes dtmfPress {
    0%{transform:scale(1)} 40%{transform:scale(.91);background:rgba(16,185,129,.25)} 100%{transform:scale(1)}
  }
  @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
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
    width:100%;max-width:400px;
    height:92vh;max-height:820px;
    display:flex;flex-direction:column;
    box-shadow:0 30px 80px -12px rgba(0,0,0,.8),0 0 0 1.5px #1E293B;
    overflow:hidden;position:relative;
  }
  @media(max-width:450px){
    .csc-phone{border-radius:24px;height:100dvh;max-height:100dvh;}
    .csc-overlay{padding:0;align-items:flex-end;}
  }
  .dtmf-btn{
    background:rgba(30,41,59,.85);
    border:1px solid rgba(51,65,85,.7);
    border-radius:50%;
    width:68px;height:68px;
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
  .dtmf-main{font-size:1.5rem;font-weight:700;line-height:1;}
  .dtmf-sub{font-size:.52rem;color:#64748B;font-weight:700;letter-spacing:.06em;margin-top:1px;}
  .dtmf-svc{font-size:.46rem;color:#34D399;font-weight:800;margin-top:1px;letter-spacing:.03em;}
  .tx-bubble{
    animation:slideUp .28s ease;
    border-radius:16px;
    padding:.65rem .9rem;
    font-size:.83rem;
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
  .view-tab{
    background:transparent;border:none;border-radius:20px;
    padding:.3rem .85rem;font-size:.72rem;font-weight:700;
    color:#94A3B8;cursor:pointer;transition:all .2s;
  }
  .view-tab.active{background:rgba(16,185,129,.18);color:#34D399;}
  .speech-pill{
    background:rgba(30,41,59,.8);border:1px solid #334155;
    border-radius:20px;padding:.3rem .72rem;
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

interface CallSimulatorModalProps { isOpen: boolean; onClose: () => void; }
interface TxItem { speaker: "ai"|"farmer"; text: string; dtmf?: string; time: string; }
interface MenuOpt { key: string; label: string; }

const KEYS = [
  {num:"1",alpha:"",    svc:"Before Sow"},
  {num:"2",alpha:"ABC", svc:"Climate"},
  {num:"3",alpha:"DEF", svc:"Group Sell"},
  {num:"4",alpha:"GHI", svc:"Insurance"},
  {num:"5",alpha:"JKL", svc:"Mandi"},
  {num:"6",alpha:"MNO", svc:"Basic Needs"},
  {num:"7",alpha:"PQRS",svc:""},
  {num:"8",alpha:"TUV", svc:"Repeat"},
  {num:"9",alpha:"WXYZ",svc:"Menu"},
  {num:"*",alpha:"",    svc:"Back"},
  {num:"0",alpha:"+",   svc:"Help"},
  {num:"#",alpha:"",    svc:"End"},
];

const VOICE_PRESETS = [
  {label:"??? Kal baarish?",   q:"Kal baarish hogi kya?"},
  {label:"?? Mandi rate",      q:"Dhan ka aaj ka mandi rate kya hai?"},
  {label:"??? Fasal bima",      q:"Fasal bima claim karna hai"},
  {label:"?? Kaun si fasal?",  q:"Is baar kaunsa crop lagana sahi hai?"},
  {label:"?? Group selling",   q:"Mujhe group mein fasal bechni hai"},
  {label:"?? Leaf scan",       q:"Leaf scanner kaise use karein?"},
  {label:"???? Bengali rain",  q:"???????? ?? ?????? ????"},
  {label:"?? Spray timing",    q:"Fasal mein dawai kab spray karni hai?"},
];

export const CallSimulatorModal: React.FC<CallSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [callState,     setCallState]     = useState<"IDLE"|"DIALING"|"CONNECTED"|"ENDED">("IDLE");
  const [callDuration,  setCallDuration]  = useState(0);
  const [sessionId,     setSessionId]     = useState("");
  const [currentStep,   setCurrentStep]   = useState("WELCOME_LANGUAGE");
  const [language,      setLanguage]      = useState<"hi"|"en"|"bn">("hi");
  const [displayPrompt, setDisplayPrompt] = useState("");
  const [optionsMenu,   setOptionsMenu]   = useState<MenuOpt[]>([]);
  const [transcript,    setTranscript]    = useState<TxItem[]>([]);
  const [isMuted,       setIsMuted]       = useState(false);
  const [isSpeakerOn,   setIsSpeakerOn]   = useState(true);
  const [isListening,   setIsListening]   = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [customQuery,   setCustomQuery]   = useState("");
  const [activeView,    setActiveView]    = useState<"call"|"transcript"|"quick">("call");
  const [pressedKey,    setPressedKey]    = useState("");
  const [aiSpeaking,    setAiSpeaking]    = useState(false);

  const timerRef       = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const txEndRef       = useRef<HTMLDivElement|null>(null);
  const inputRef       = useRef<HTMLInputElement|null>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setSpeechSupported(true);
      const r = new SR();
      r.continuous = false; r.interimResults = false;
      r.onresult = (e: any) => { setIsListening(false); sendSpeech(e.results[0][0].transcript); };
      r.onerror = () => setIsListening(false);
      r.onend   = () => setIsListening(false);
      recognitionRef.current = r;
    }
  }, []);

  useEffect(() => {
    if (callState === "CONNECTED") {
      timerRef.current = setInterval(() => setCallDuration(d => d+1), 1000);
    } else { if (timerRef.current) clearInterval(timerRef.current); }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  useEffect(() => { txEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [transcript]);

  useEffect(() => {
    if (isOpen && callState === "IDLE") startCall();
    if (!isOpen) { window.speechSynthesis?.cancel(); setCallState("IDLE"); }
  }, [isOpen]);

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const now  = () => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

  const speak = (text: string, lang: "hi"|"en"|"bn") => {
    if (!isSpeakerOn || isMuted || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : lang === "bn" ? "bn-IN" : "en-IN";
    u.rate = 0.93;
    setAiSpeaking(true);
    u.onend = () => setAiSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const handleResp = useCallback((data: any) => {
    if (data.currentStep) setCurrentStep(data.currentStep);
    if (data.language)    setLanguage(data.language);
    const prompt = data.displayPrompt || data.spokenText || "";
    setDisplayPrompt(prompt);
    setOptionsMenu(data.optionsMenu || []);
    setTranscript(prev => [...prev, { speaker:"ai", text:prompt, time:now() }]);
    speak(data.spokenText || prompt, data.language || language);
    if (data.isCallEnded) endCall();
  }, [language, isSpeakerOn, isMuted]);

  const fallback = () => {
    setCallState("CONNECTED");
    const g = "Welcome to BharatFarm Sahayak. For Hindi press 1, English press 2, Bengali press 3.";
    setDisplayPrompt(g); setCurrentStep("WELCOME_LANGUAGE");
    setOptionsMenu([{key:"1",label:"??????"},{key:"2",label:"English"},{key:"3",label:"?????"}]);
    setTranscript([{ speaker:"ai", text:g, time:now() }]);
    speak(g, "en");
  };

  const startCall = async () => {
    const sid = `call_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    setSessionId(sid); setCallState("DIALING"); setCallDuration(0); setTranscript([]);
    try {
      const r = await fetch("/api/sahayak/call/incoming", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ sessionId:sid, callerPhone:"+91 98312 00001" })
      });
      const j = await r.json();
      if (j.success && j.data) { setCallState("CONNECTED"); handleResp(j.data); } else fallback();
    } catch { fallback(); }
  };

  const sendDtmf = async (digit: string) => {
    if (callState !== "CONNECTED" || !sessionId) return;
    if (digit === "#") { endCall(); return; }
    setPressedKey(digit); setTimeout(() => setPressedKey(""), 300);
    setTranscript(prev => [...prev, { speaker:"farmer", text:`[Key ${digit} pressed]`, dtmf:digit, time:now() }]);
    try {
      const r = await fetch("/api/sahayak/call/dtmf", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ sessionId, digits:digit })
      });
      const j = await r.json();
      if (j.success && j.data) handleResp(j.data);
    } catch(e) { console.error(e); }
  };

  const sendSpeech = async (text: string) => {
    if (callState !== "CONNECTED" || !sessionId || !text.trim()) return;
    setTranscript(prev => [...prev, { speaker:"farmer", text, time:now() }]);
    setCustomQuery("");
    try {
      const r = await fetch("/api/sahayak/call/speech", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ sessionId, speechText:text })
      });
      const j = await r.json();
      if (j.success && j.data) handleResp(j.data);
    } catch(e) { console.error(e); }
  };

  const toggleMic = () => {
    if (!speechSupported || !recognitionRef.current) { inputRef.current?.focus(); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else {
      try {
        recognitionRef.current.lang = language === "hi" ? "hi-IN" : language === "bn" ? "bn-IN" : "en-IN";
        recognitionRef.current.start(); setIsListening(true);
      } catch { setIsListening(false); }
    }
  };

  const endCall = async () => {
    window.speechSynthesis?.cancel(); setAiSpeaking(false);
    if (sessionId) { try { await fetch("/api/sahayak/call/terminate", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ sessionId }) }); } catch {} }
    setCallState("ENDED");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (!isOpen) return null;

  return (
    <div className="csc-overlay">
      <style>{CSS}</style>
      <div className="csc-phone">

        {/* STATUS BAR */}
        <div style={{padding:".6rem 1.2rem .35rem",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:".7rem",color:"#64748B",flexShrink:0}}>
          <span style={{fontWeight:800}}>BharatFarm Sahayak</span>
          <div style={{display:"flex",gap:".45rem",alignItems:"center"}}>
            <span className="material-symbols-outlined" style={{fontSize:"13px"}}>signal_cellular_alt</span>
            <span>5G</span>
            <span className="material-symbols-outlined" style={{fontSize:"14px"}}>battery_full</span>
          </div>
        </div>

        {/* CALLER SECTION */}
        <div style={{padding:".8rem 1.25rem .4rem",textAlign:"center",flexShrink:0}}>
          <div style={{position:"relative",display:"inline-block",marginBottom:".5rem"}}>
            <div style={{
              width:80,height:80,borderRadius:"50%",
              background:"linear-gradient(135deg,#10B981,#047857)",
              display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto",
              animation: callState === "CONNECTED" ? "callRingPulse 2s infinite" : "none",
              boxShadow:"0 8px 24px rgba(16,185,129,.35)",
              border:"3px solid #34D399"
            }}>
              <span className="material-symbols-outlined" style={{color:"#FFF",fontSize:"36px"}}>support_agent</span>
            </div>
            {aiSpeaking && (
              <div style={{position:"absolute",bottom:-8,left:"50%",transform:"translateX(-50%)",display:"flex",gap:3,alignItems:"flex-end",height:24}}>
                <div className="wave-bar"/><div className="wave-bar"/><div className="wave-bar"/><div className="wave-bar"/><div className="wave-bar"/>
              </div>
            )}
          </div>

          <h3 style={{fontSize:"1.2rem",fontWeight:900,color:"#FFFFFF",margin:"0 0 .15rem 0"}}>BharatFarm Sahayak AI</h3>

          {callState === "DIALING" && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"#34D399",fontSize:".78rem",fontWeight:700,marginBottom:".1rem"}}>
              <span>Dialing</span>
              <span className="dialing-dot"/><span className="dialing-dot"/><span className="dialing-dot"/>
            </div>
          )}
          {callState === "CONNECTED" && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:".4rem"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#34D399",display:"inline-block"}}/>
              <span style={{color:"#34D399",fontSize:".78rem",fontWeight:700}}>Connected · {fmt(callDuration)}</span>
            </div>
          )}
          {callState === "ENDED" && (
            <span style={{color:"#F87171",fontSize:".78rem",fontWeight:700}}>Call Ended · {fmt(callDuration)}</span>
          )}
          <div style={{fontSize:".65rem",color:"#475569",marginTop:".2rem",fontWeight:600}}>1800-BHARAT-FARM · Toll-Free</div>
        </div>

        {/* AI VOICE PROMPT DISPLAY */}
        <div style={{margin:"0 1rem .5rem",flexShrink:0}}>
          <div style={{
            background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.22)",
            borderRadius:16,padding:".65rem .9rem",minHeight:56,
            display:"flex",flexDirection:"column",gap:".25rem"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:".35rem",marginBottom:".15rem"}}>
              <span className="material-symbols-outlined" style={{fontSize:"13px",color:"#10B981"}}>volume_up</span>
              <span style={{fontSize:".6rem",color:"#10B981",fontWeight:800,letterSpacing:".05em"}}>
                AI VOICE · {language.toUpperCase()} · {currentStep.replace(/_/g," ")}
              </span>
              {aiSpeaking && (
                <div style={{display:"flex",gap:2,alignItems:"flex-end",height:13,marginLeft:3}}>
                  <div className="wave-bar" style={{height:6}}/><div className="wave-bar" style={{height:6}}/><div className="wave-bar" style={{height:6}}/>
                </div>
              )}
            </div>
            <p style={{fontSize:".82rem",color:"#E2E8F0",margin:0,lineHeight:1.4,fontStyle:"italic"}}>
              &ldquo;{displayPrompt || "Connecting to BharatFarm Sahayak voice gateway…"}&rdquo;
            </p>
          </div>
        </div>

        {/* VIEW TABS */}
        <div style={{display:"flex",gap:".25rem",padding:"0 1rem .3rem",justifyContent:"center",flexShrink:0}}>
          {(["call","quick","transcript"] as const).map(v => (
            <button key={v} className={`view-tab${activeView===v?" active":""}`} onClick={() => setActiveView(v)}>
              {v==="call" ? "?? Keypad" : v==="quick" ? "??? Speak" : `?? Log (${transcript.length})`}
            </button>
          ))}
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{flex:1,overflowY:"auto",padding:"0 1rem",display:"flex",flexDirection:"column",gap:".65rem"}}>

          {/* KEYPAD VIEW */}
          {activeView === "call" && (<>
            {optionsMenu.length > 0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:".4rem",justifyContent:"center"}}>
                {optionsMenu.map(opt => (
                  <button key={opt.key} onClick={() => sendDtmf(opt.key)} disabled={callState !== "CONNECTED"}
                    style={{background:"rgba(16,185,129,.12)",border:"1px solid rgba(16,185,129,.35)",
                      borderRadius:20,padding:".28rem .75rem",fontSize:".72rem",color:"#34D399",fontWeight:700,cursor:"pointer"}}>
                    <span style={{opacity:.7}}>#{opt.key}</span> {opt.label}
                  </button>
                ))}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:".85rem",justifyItems:"center",padding:".2rem 0"}}>
              {KEYS.map(k => (
                <button key={k.num} className={`dtmf-btn${pressedKey===k.num?" pressed":""}`}
                  onClick={() => k.num==="#" ? endCall() : sendDtmf(k.num)}
                  disabled={callState !== "CONNECTED"}>
                  <span className="dtmf-main">{k.num}</span>
                  {k.alpha && <span className="dtmf-sub">{k.alpha}</span>}
                  {k.svc   && <span className="dtmf-svc">{k.svc}</span>}
                </button>
              ))}
            </div>
          </>)}

          {/* SPEAK VIEW */}
          {activeView === "quick" && (
            <div style={{display:"flex",flexDirection:"column",gap:".85rem",animation:"fadeIn .2s ease"}}>
              <div>
                <p style={{fontSize:".68rem",color:"#64748B",fontWeight:700,margin:"0 0 .45rem 0",textTransform:"uppercase",letterSpacing:".06em"}}>Quick Voice Queries</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:".4rem"}}>
                  {VOICE_PRESETS.map((vp,i) => (
                    <button key={i} className="speech-pill" onClick={() => sendSpeech(vp.q)} disabled={callState !== "CONNECTED"}>{vp.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{fontSize:".68rem",color:"#64748B",fontWeight:700,margin:"0 0 .35rem 0",textTransform:"uppercase",letterSpacing:".06em"}}>Helpline Commands</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:".35rem"}}>
                  {[["?? Main Menu","main menu"],["? Back","back"],["?? Repeat","repeat"],["? Help","help"]].map(([label,cmd],i)=>(
                    <button key={i} className="speech-pill" onClick={() => sendSpeech(cmd)} disabled={callState !== "CONNECTED"}>{label}</button>
                  ))}
                </div>
              </div>
              {isListening && (
                <div style={{background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.35)",borderRadius:12,padding:".6rem .9rem",display:"flex",alignItems:"center",gap:".5rem",animation:"fadeIn .2s"}}>
                  <div style={{display:"flex",gap:3,alignItems:"flex-end",height:22}}>
                    {[1,2,3,4,5].map(i=><div key={i} className="wave-bar" style={{background:"#F59E0B"}}/>)}
                  </div>
                  <span style={{color:"#FBBF24",fontSize:".8rem",fontWeight:700}}>
                    Listening… speak in {language==="hi"?"??????":language==="bn"?"?????":"English"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TRANSCRIPT VIEW */}
          {activeView === "transcript" && (
            <div style={{display:"flex",flexDirection:"column",gap:".55rem",animation:"fadeIn .2s ease"}}>
              {transcript.length === 0 && (
                <div style={{color:"#475569",fontSize:".82rem",textAlign:"center",padding:"2rem 0"}}>No messages yet.</div>
              )}
              {transcript.map((item,idx) => (
                <div key={idx} style={{display:"flex",flexDirection:"column",alignItems:item.speaker==="ai"?"flex-start":"flex-end"}}>
                  <span style={{fontSize:".62rem",color:"#475569",marginBottom:".12rem",fontWeight:600}}>
                    {item.speaker==="ai"?"?? Sahayak":"????? Farmer"} · {item.time}
                  </span>
                  <div className={`tx-bubble ${item.speaker}`} style={{color:"#F8FAFC"}}>{item.text}</div>
                </div>
              ))}
              <div ref={txEndRef}/>
            </div>
          )}
        </div>

        {/* SPEAK INPUT BAR */}
        {callState !== "ENDED" && (
          <div style={{padding:".55rem 1rem .4rem",flexShrink:0,borderTop:"1px solid #1E293B"}}>
            <div style={{display:"flex",alignItems:"center",gap:".4rem"}}>
              <input
                ref={inputRef}
                type="text"
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                onKeyDown={e => { if(e.key==="Enter" && customQuery.trim()) sendSpeech(customQuery); }}
                placeholder={callState==="CONNECTED"?"Type or speak your query…":"Connecting…"}
                disabled={callState !== "CONNECTED"}
                style={{flex:1,background:"rgba(30,41,59,.8)",border:"1px solid #334155",borderRadius:22,padding:".5rem .9rem",color:"#F8FAFC",fontSize:".82rem",outline:"none",opacity:callState==="CONNECTED"?1:.5}}
              />
              <button onClick={toggleMic} disabled={callState !== "CONNECTED"}
                style={{width:40,height:40,borderRadius:"50%",border:"none",background:isListening?"#F59E0B":"rgba(16,185,129,.2)",color:"#FFF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",animation:isListening?"micPulse 1s infinite":"none",flexShrink:0}}>
                <span className="material-symbols-outlined" style={{fontSize:"19px",color:isListening?"#FFF":"#34D399"}}>{isListening?"hearing":"mic"}</span>
              </button>
              <button onClick={() => customQuery.trim() && sendSpeech(customQuery)} disabled={callState !== "CONNECTED" || !customQuery.trim()}
                style={{width:40,height:40,borderRadius:"50%",border:"none",background:customQuery.trim()?"#10B981":"rgba(30,41,59,.8)",color:"#FFF",cursor:customQuery.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"background .2s"}}>
                <span className="material-symbols-outlined" style={{fontSize:"18px"}}>send</span>
              </button>
            </div>
          </div>
        )}

        {/* CALL CONTROLS */}
        <div style={{padding:".65rem 1.5rem .85rem",display:"flex",alignItems:"center",justifyContent:"space-around",borderTop:"1px solid #1E293B",background:"rgba(5,10,20,.4)",flexShrink:0}}>
          <button onClick={() => setIsMuted(m=>!m)} title={isMuted?"Unmute":"Mute"}
            style={{width:50,height:50,borderRadius:"50%",border:"none",background:isMuted?"#EF4444":"rgba(30,41,59,.9)",color:"#FFF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="material-symbols-outlined">{isMuted?"mic_off":"mic"}</span>
          </button>

          {callState === "CONNECTED" ? (
            <button onClick={endCall} title="End Call"
              style={{width:62,height:62,borderRadius:"50%",border:"none",background:"#DC2626",color:"#FFF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 20px rgba(220,38,38,.5)"}}>
              <span className="material-symbols-outlined" style={{fontSize:"28px"}}>call_end</span>
            </button>
          ) : (
            <button onClick={startCall} title="Redial"
              style={{width:62,height:62,borderRadius:"50%",border:"none",background:"#16A34A",color:"#FFF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 20px rgba(22,163,74,.5)"}}>
              <span className="material-symbols-outlined" style={{fontSize:"28px"}}>call</span>
            </button>
          )}

          <button onClick={() => setIsSpeakerOn(s=>!s)} title="Toggle Speaker"
            style={{width:50,height:50,borderRadius:"50%",border:"none",background:isSpeakerOn?"rgba(16,185,129,.2)":"rgba(30,41,59,.9)",color:"#FFF",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="material-symbols-outlined" style={{color:isSpeakerOn?"#34D399":"#94A3B8"}}>{isSpeakerOn?"volume_up":"volume_off"}</span>
          </button>

          <button onClick={onClose} title="Close"
            style={{width:50,height:50,borderRadius:"50%",border:"none",background:"rgba(30,41,59,.9)",color:"#94A3B8",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

      </div>
    </div>
  );
};
