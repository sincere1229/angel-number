import { useState, useRef, useEffect } from "react";

// ── 言語データ ──────────────────────────────────────────
const LANG = {
  ja: {
    appTitle: "エンジェルナンバー",
    appSub: "天使からのメッセージを受け取る",
    tabToday: "今日のナンバー",
    tabSearch: "数字を調べる",
    todayBadge: (date) => `📅 ${date}のエンジェルナンバー`,
    selectTheme: "テーマを選んでください",
    lead: "気になる数字を入力してください",
    leadSub: "時計・ナンバープレートなど\n繰り返し見る数字はありませんか？",
    placeholder: "例：1111",
    quickLabel: "よく見られる数字",
    btnToday: "✨ 今日のメッセージを受け取る",
    btnSearch: "✨ メッセージを受け取る",
    loading: "天使と交信中...",
    errNum: "数字を入力してください",
    errLen: "8桁以内で入力してください",
    errTheme: "テーマを選んでください",
    errRetry: "もう一度お試しください",
    labelMsg: "✨ 天使からのメッセージ",
    labelAdvice: "💡 今日すぐできること",
    labelAffirm: "🌅 朝のアファメーション",
    labelLucky: "🌟 ラッキー",
    labelShare: "📲 シェアする",
    labelSNS: "📱 SNS投稿用キャプション",
    shareNote: "ハッシュタグ付きで投稿されます 🕊️",
    copy: "コピー",
    copied: "コピー済み",
    reset: "← 別の数字・テーマを調べる",
    footer: "✦ Angel Number AI ✦",
    zoroBadge: "✦ ゾロ目",
    mirrorBadge: "◈ ミラー",
    coreBadge: (n) => `コア：${n}`,
    concerns: [
      { id:"love",   icon:"♡", label:"恋愛・人間関係" },
      { id:"work",   icon:"⭐", label:"仕事・使命"    },
      { id:"life",   icon:"🌿", label:"人生・方向性"  },
      { id:"health", icon:"✦", label:"健康・エネルギー" },
    ],
    promptConcern: (num, core, baseDesc, isZoro, isMirror, concernLabel) =>
      `あなたは優しく温かいエンジェルナンバーの専門家です。
エンジェルナンバー「${num}」について、特に「${concernLabel}」に関するメッセージを作ってください。
【数字情報】
- 数字: ${num}（コア: ${core} / ${baseDesc}）
${isZoro ? "- ゾロ目：パワーが増幅" : ""}
${isMirror ? "- ミラーナンバー：鏡の数字" : ""}
- テーマ: ${concernLabel}
【出力形式】（必ずこの形式・日本語で）
TITLE: （15文字以内の心温まるタイトル）
MESSAGE: （天使からの優しいメッセージ。130〜160文字。「あなた」への語りかけ。${concernLabel}に関連させる）
ADVICE: （今日すぐできる具体的なアドバイス。50文字以内）
AFFIRMATION: （朝に唱えるアファメーション。30文字以内。「私は〜」の形式）
LUCKY: （ラッキーカラーまたはアイテム。15文字以内）
SNS: （Instagram・TikTok用の投稿キャプション。絵文字たっぷり・共感性高く・100文字以内）`,
    shareText: (result, concernLabel) =>
      `🕊️ エンジェルナンバー【${result.number}】\n✨ ${result.title}\n\n${result.message}\n\n💡 今日のアドバイス：${result.advice}\n🌅 アファメーション：「${result.affirmation}」\n\n#エンジェルナンバー #${result.number} #${concernLabel} #天使のメッセージ #スピリチュアル`,
  },
  en: {
    appTitle: "Angel Numbers",
    appSub: "Receive messages from your angels",
    tabToday: "Today's Number",
    tabSearch: "Look Up a Number",
    todayBadge: (date) => `📅 Angel Number for ${date}`,
    selectTheme: "Choose your theme",
    lead: "Enter a number you keep seeing",
    leadSub: "Clocks, license plates, receipts…\nWhat number keeps appearing for you?",
    placeholder: "e.g. 1111",
    quickLabel: "Popular numbers",
    btnToday: "✨ Receive Today's Message",
    btnSearch: "✨ Receive Your Message",
    loading: "Connecting with angels...",
    errNum: "Please enter a number",
    errLen: "Please enter up to 8 digits",
    errTheme: "Please choose a theme",
    errRetry: "Please try again",
    labelMsg: "✨ Message from your angels",
    labelAdvice: "💡 Action for today",
    labelAffirm: "🌅 Morning affirmation",
    labelLucky: "🌟 Lucky",
    labelShare: "📲 Share",
    labelSNS: "📱 Caption for SNS",
    shareNote: "Posted with hashtags 🕊️",
    copy: "Copy",
    copied: "Copied!",
    reset: "← Try another number or theme",
    footer: "✦ Angel Number AI ✦",
    zoroBadge: "✦ Repeating",
    mirrorBadge: "◈ Mirror",
    coreBadge: (n) => `Core: ${n}`,
    concerns: [
      { id:"love",   icon:"♡", label:"Love & Relationships" },
      { id:"work",   icon:"⭐", label:"Career & Purpose"     },
      { id:"life",   icon:"🌿", label:"Life & Direction"     },
      { id:"health", icon:"✦", label:"Health & Energy"      },
    ],
    promptConcern: (num, core, baseDesc, isZoro, isMirror, concernLabel) =>
      `You are a warm and gentle angel number expert.
Create an angel number message for "${num}", focused on the theme of "${concernLabel}".
[Number Info]
- Number: ${num} (Core: ${core} / ${baseDesc})
${isZoro ? "- Repeating digits: amplified power" : ""}
${isMirror ? "- Mirror number" : ""}
- Theme: ${concernLabel}
[Output format] (Use EXACTLY these keys, respond in English)
TITLE: (heartwarming title, max 10 words)
MESSAGE: (gentle angel message, 80–100 words, address "you", relate to ${concernLabel})
ADVICE: (one concrete action for today, max 20 words)
AFFIRMATION: (morning affirmation, max 10 words, start with "I am" or "I have")
LUCKY: (lucky color or item, max 5 words)
SNS: (Instagram/TikTok caption, lots of emojis, relatable, max 50 words)`,
    shareText: (result, concernLabel) =>
      `🕊️ Angel Number【${result.number}】\n✨ ${result.title}\n\n${result.message}\n\n💡 Today's advice: ${result.advice}\n🌅 Affirmation: "${result.affirmation}"\n\n#AngelNumber #${result.number} #${concernLabel} #AngelMessage #Spiritual`,
  },
};

const ANGEL_BASE = {
  0:"Infinite Possibility", 1:"New Beginnings", 2:"Harmony & Trust",
  3:"Creativity & Expression", 4:"Angels' Protection", 5:"Change & Freedom",
  6:"Love & Balance", 7:"Spiritual Awakening", 8:"Abundance",
  9:"Completion of Mission", 11:"Intuition & Revelation", 22:"Dreams Realized",
  33:"Compassion & Service", 44:"Stability & Foundation",
};
const ANGEL_BASE_JA = {
  0:"無限の可能性", 1:"新しい始まり", 2:"調和と信頼",
  3:"創造と表現", 4:"天使の守護", 5:"変化と自由",
  6:"愛と調和", 7:"霊的覚醒", 8:"豊かさ",
  9:"使命の完成", 11:"直感と啓示", 22:"夢の実現",
  33:"慈悲と奉仕", 44:"安定と基盤",
};

function getTodayNumber(lang) {
  const d = new Date();
  const str = `${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`;
  let n = str.split("").reduce((a,b) => a + Number(b), 0);
  while (n >= 10 && ![11,22,33,44].includes(n)) {
    n = String(n).split("").reduce((a,b) => a + Number(b), 0);
  }
  const date = lang === "ja"
    ? `${d.getMonth()+1}月${d.getDate()}日`
    : `${d.toLocaleString("en",{month:"short"})} ${d.getDate()}`;
  return { number: String(n), date };
}

function reduceToCore(n) {
  while (n >= 10 && ![11,22,33,44].includes(n)) {
    n = String(n).split("").reduce((a,b) => a + Number(b), 0);
  }
  return n;
}

const QUICK = ["111","222","333","444","555","777","1111","1212"];

export default function AngelApp() {
  const [lang, setLang]       = useState("ja");
  const [tab, setTab]         = useState("today");
  const [input, setInput]     = useState("");
  const [concern, setConcern] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [show, setShow]       = useState(false);
  const [copied, setCopied]   = useState(false);
  const [shared, setShared]   = useState(false);
  const inputRef = useRef(null);

  const L = LANG[lang];
  const today = getTodayNumber(lang);

  useEffect(() => {
    if (result) setTimeout(() => setShow(true), 50);
    else setShow(false);
  }, [result]);

  // 言語切替時にリセット
  function switchLang(l) {
    setLang(l);
    setResult(null);
    setConcern(null);
    setError("");
  }

  async function fetchAngel(numStr, concernId) {
    const digits   = numStr.split("").map(Number);
    const sum      = digits.reduce((a,b) => a+b, 0);
    const core     = reduceToCore(sum);
    const isZoro   = digits.every(d => d === digits[0]);
    const isMirror = numStr.length >= 2 && numStr === numStr.split("").reverse().join("");
    const baseDesc = lang === "ja"
      ? (ANGEL_BASE_JA[core] || "神秘のエネルギー")
      : (ANGEL_BASE[core] || "Mystical Energy");
    const concernLabel = L.concerns.find(c => c.id === concernId)?.label || "";
    const prompt = L.promptConcern(numStr, core, baseDesc, isZoro, isMirror, concernLabel);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true"
      },
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:1200,
        messages:[{ role:"user", content:prompt }],
      }),
    });
    if (!res.ok) throw new Error("error");
    const data = await res.json();
    const text = data.content[0].text;
    const get  = (key) => {
      const m = text.match(new RegExp(`${key}:\\s*(.+)`));
      return m ? m[1].trim() : "";
    };
    return {
      number:numStr, core, isZoro, isMirror, concernId,
      title:get("TITLE"), message:get("MESSAGE"),
      advice:get("ADVICE"), affirmation:get("AFFIRMATION"),
      lucky:get("LUCKY"), sns:get("SNS"),
    };
  }

  async function handleSubmit() {
    const cleaned = input.replace(/[^0-9]/g,"");
    if (!cleaned)         { setError(L.errNum); return; }
    if (cleaned.length>8) { setError(L.errLen); return; }
    if (!concern)         { setError(L.errTheme); return; }
    setError(""); setResult(null); setLoading(true);
    try { setResult(await fetchAngel(cleaned, concern)); }
    catch { setError(L.errRetry); }
    finally { setLoading(false); }
  }

  async function handleToday(concernId) {
    setConcern(concernId); setResult(null); setLoading(true); setError("");
    try { setResult(await fetchAngel(today.number, concernId)); }
    catch { setError(L.errRetry); }
    finally { setLoading(false); }
  }

  function reset() {
    setResult(null); setInput(""); setConcern(null); setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function copySNS() {
    if (!result?.sns) return;
    navigator.clipboard.writeText(result.sns).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleShare(platform) {
    const concernLabel = L.concerns.find(c => c.id === result?.concernId)?.label || "";
    const text = L.shareText(result, concernLabel);
    const encoded = encodeURIComponent(text);
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
    else if (platform === "line") window.open(`https://line.me/R/msg/text/?${encoded}`, "_blank");
    else if (platform === "copy") {
      navigator.clipboard.writeText(text).then(() => {
        setShared(true); setTimeout(() => setShared(false), 2000);
      });
    } else if (platform === "native" && navigator.share) {
      navigator.share({ title:`Angel Number【${result.number}】`, text }).catch(()=>{});
    }
  }

  const concernLabel = L.concerns.find(c => c.id === result?.concernId)?.label || "";
  const baseDescToday = lang === "ja"
    ? (ANGEL_BASE_JA[Number(today.number)] || "神秘のエネルギー")
    : (ANGEL_BASE[Number(today.number)] || "Mystical Energy");

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Cinzel:wght@600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .tab:hover { background:#fff9e6 !important; }
        .tab-on { background:#fff !important; color:#7a5800 !important; box-shadow:0 2px 8px rgba(180,130,30,0.15) !important; }
        .btn-gold:hover  { background:#b8850a !important; transform:translateY(-1px); }
        .concern:hover { border-color:#d4a520 !important; background:#fff9e6 !important; }
        .concern-on { border-color:#d4a520 !important; background:#fff9e6 !important; box-shadow:0 0 0 2px rgba(212,165,32,0.3) !important; }
        .chip:hover { background:#fff3d6 !important; border-color:#c9962a !important; }
        .share-btn:hover { opacity:0.85 !important; transform:translateY(-1px); }
        .lang-btn { cursor:pointer; padding:5px 12px; border-radius:20px; border:1px solid rgba(212,165,32,0.4); font-size:13px; font-weight:700; transition:all 0.2s; background:transparent; font-family:'Noto Sans JP',sans-serif; }
        .lang-btn:hover { background:#fff9e6; }
        .lang-on { background:#fff9e6 !important; color:#7a5800 !important; border-color:#d4a520 !important; }
        input:focus { outline:none; border-color:#d4a520 !important; box-shadow:0 0 0 3px rgba(212,165,32,0.15) !important; }
      `}</style>

      {/* ヘッダー */}
      <div style={s.header}>
        {/* 言語切替 */}
        <div style={{position:"absolute", top:16, right:16, display:"flex", gap:6}}>
          <button className={`lang-btn ${lang==="ja"?"lang-on":""}`} style={{color: lang==="ja"?"#7a5800":"#a08030"}} onClick={()=>switchLang("ja")}>🇯🇵 JP</button>
          <button className={`lang-btn ${lang==="en"?"lang-on":""}`} style={{color: lang==="en"?"#7a5800":"#a08030"}} onClick={()=>switchLang("en")}>🇬🇧 EN</button>
        </div>
        <div style={s.angel}>🕊️</div>
        <h1 style={s.title}>{L.appTitle}</h1>
        <p style={s.sub}>{L.appSub}</p>
      </div>

      {/* タブ */}
      <div style={s.tabBar}>
        {[{id:"today",label:L.tabToday},{id:"search",label:L.tabSearch}].map(t => (
          <button key={t.id} className={`tab ${tab===t.id?"tab-on":""}`}
            onClick={() => { setTab(t.id); setResult(null); setError(""); setConcern(null); }}
            style={{ ...s.tab, ...(tab===t.id?s.tabOn:{}) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.body}>

        {/* 今日のナンバー */}
        {tab==="today" && !result && (
          <div style={s.card}>
            <div style={s.todayBadge}>{L.todayBadge(today.date)}</div>
            <div style={s.todayNum}>{today.number}</div>
            <div style={s.todayDesc}>{baseDescToday}</div>
            <div style={s.secLabel}>{L.selectTheme}</div>
            <div style={s.cgrid}>
              {L.concerns.map(c => (
                <button key={c.id} className={`concern ${concern===c.id?"concern-on":""}`}
                  onClick={() => { setConcern(c.id); setError(""); }}
                  style={{ ...s.concern, ...(concern===c.id?s.concernOn:{}) }}>
                  <span style={s.cIcon}>{c.icon}</span>
                  <span style={s.cLabel}>{c.label}</span>
                </button>
              ))}
            </div>
            {error && <p style={s.error}>⚠️ {error}</p>}
            <button className="btn-gold"
              onClick={() => { if (!concern){setError(L.errTheme);return;} handleToday(concern); }}
              disabled={loading} style={s.btnMain}>
              {loading ? <span style={s.loadRow}><span style={s.spinner}/>{L.loading}</span> : L.btnToday}
            </button>
          </div>
        )}

        {/* 数字を調べる */}
        {tab==="search" && !result && (
          <div style={s.card}>
            <p style={s.lead}>{L.lead}</p>
            <p style={s.leadSub}>{L.leadSub}</p>
            <input ref={inputRef} type="tel" value={input}
              onChange={e=>{setInput(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              placeholder={L.placeholder} maxLength={8} style={s.input} />
            <div style={s.secLabel}>{L.selectTheme}</div>
            <div style={s.cgrid}>
              {L.concerns.map(c => (
                <button key={c.id} className={`concern ${concern===c.id?"concern-on":""}`}
                  onClick={() => { setConcern(c.id); setError(""); }}
                  style={{ ...s.concern, ...(concern===c.id?s.concernOn:{}) }}>
                  <span style={s.cIcon}>{c.icon}</span>
                  <span style={s.cLabel}>{c.label}</span>
                </button>
              ))}
            </div>
            {error && <p style={s.error}>⚠️ {error}</p>}
            <button className="btn-gold" onClick={handleSubmit} disabled={loading} style={s.btnMain}>
              {loading ? <span style={s.loadRow}><span style={s.spinner}/>{L.loading}</span> : L.btnSearch}
            </button>
            <div style={s.quickSection}>
              <p style={s.quickLabel}>{L.quickLabel}</p>
              <div style={s.chips}>
                {QUICK.map(n => (
                  <button key={n} className="chip" onClick={()=>{setInput(n);setError("");}} style={s.chip}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 結果 */}
        {result && (
          <div style={{ ...s.resultWrap, opacity:show?1:0, transform:show?"translateY(0)":"translateY(20px)", transition:"all 0.5s ease" }}>
            <div style={s.numCard}>
              <div style={s.numBig}>{result.number}</div>
              <div style={s.badges}>
                {result.isZoro   && <span style={s.badge}>{L.zoroBadge}</span>}
                {result.isMirror && <span style={s.badge}>{L.mirrorBadge}</span>}
                <span style={s.badge}>{L.coreBadge(result.core)}</span>
                <span style={{...s.badge, background:"#fff0f5", borderColor:"rgba(200,100,130,0.4)", color:"#8a3050"}}>
                  {L.concerns.find(c=>c.id===result.concernId)?.icon} {concernLabel}
                </span>
              </div>
            </div>
            <div style={s.titleCard}>
              <p style={s.resLabel}>{L.labelMsg}</p>
              <h2 style={s.resTitle}>{result.title}</h2>
            </div>
            <div style={s.msgCard}><p style={s.msgText}>{result.message}</p></div>
            <div style={s.adviceCard}>
              <div style={s.adviceHead}>{L.labelAdvice}</div>
              <div style={s.adviceText}>{result.advice}</div>
            </div>
            <div style={s.affirmCard}>
              <div style={s.affirmHead}>{L.labelAffirm}</div>
              <div style={s.affirmText}>「{result.affirmation}」</div>
            </div>
            <div style={s.luckyCard}>
              <span style={s.luckyLabel}>{L.labelLucky}　</span>
              <span style={s.luckyVal}>{result.lucky}</span>
            </div>
            <div style={s.shareCard}>
              <div style={s.shareTitle}>{L.labelShare}</div>
              <div style={s.shareRow}>
                <button className="share-btn" onClick={()=>handleShare("twitter")} style={{...s.shareBtn, background:"#000", color:"#fff"}}><span style={s.sBtnIcon}>𝕏</span><span style={s.sBtnLabel}>X</span></button>
                <button className="share-btn" onClick={()=>handleShare("line")} style={{...s.shareBtn, background:"#06C755", color:"#fff"}}><span style={s.sBtnIcon}>💬</span><span style={s.sBtnLabel}>LINE</span></button>
                <button className="share-btn" onClick={()=>handleShare("copy")} style={{...s.shareBtn, background:"#f5ead0", color:"#7a5800", border:"1px solid rgba(212,165,32,0.4)"}}><span style={s.sBtnIcon}>{shared?"✓":"📋"}</span><span style={s.sBtnLabel}>{shared?L.copied:L.copy}</span></button>
                {navigator.share && <button className="share-btn" onClick={()=>handleShare("native")} style={{...s.shareBtn, background:"#d4a520", color:"#fff"}}><span style={s.sBtnIcon}>↑</span><span style={s.sBtnLabel}>{L.copy}</span></button>}
              </div>
              <p style={s.shareNote}>{L.shareNote}</p>
            </div>
            <div style={s.snsCard}>
              <div style={s.snsHead}>
                <span>{L.labelSNS}</span>
                <button onClick={copySNS} style={s.btnCopy}>{copied?`✓ ${L.copied}`:L.copy}</button>
              </div>
              <div style={s.snsText}>{result.sns}</div>
            </div>
            <button className="btn-reset" onClick={reset} style={s.btnReset}>{L.reset}</button>
          </div>
        )}
        <p style={s.footer}>{L.footer}</p>
      </div>
    </div>
  );
}

const GD="#d4a520", GD_DARK="#7a5800";
const CREAM="#fdf8f0", TEXT="#1a1000", TEXT_SUB="#5a4010";
const s = {
  root:{ minHeight:"100vh", background:CREAM, fontFamily:"'Noto Sans JP',sans-serif", color:TEXT },
  header:{ background:"linear-gradient(160deg,#fff9ed 0%,#fdefc8 60%,#fdf3d5 100%)", padding:"36px 20px 28px", textAlign:"center", borderBottom:"1px solid rgba(212,165,32,0.25)", position:"relative" },
  angel:{ fontSize:52, display:"block", marginBottom:10, animation:"float 3s ease-in-out infinite" },
  title:{ fontFamily:"'Cinzel',serif", fontSize:28, fontWeight:700, letterSpacing:"0.12em", color:GD_DARK, marginBottom:6 },
  sub:{ fontSize:14, color:TEXT_SUB, letterSpacing:"0.08em", fontWeight:500 },
  tabBar:{ display:"flex", background:"#f0e0b0", padding:"6px", gap:4 },
  tab:{ flex:1, padding:"13px 0", fontSize:15, fontWeight:700, fontFamily:"'Noto Sans JP',sans-serif", color:TEXT_SUB, background:"transparent", border:"none", borderRadius:8, cursor:"pointer", transition:"all 0.2s", letterSpacing:"0.05em" },
  tabOn:{ background:"#fff", color:GD_DARK },
  body:{ maxWidth:480, margin:"0 auto", padding:"20px 16px 48px" },
  card:{ background:"#fff", borderRadius:20, padding:"28px 20px", boxShadow:"0 4px 24px rgba(180,130,30,0.12)", border:"1px solid rgba(212,165,32,0.25)" },
  todayBadge:{ display:"inline-block", background:"#fff9e6", border:"1px solid rgba(212,165,32,0.4)", borderRadius:20, padding:"5px 16px", fontSize:14, color:GD_DARK, marginBottom:16, letterSpacing:"0.05em", fontWeight:700 },
  todayNum:{ fontFamily:"'Cinzel',serif", fontSize:76, fontWeight:700, color:GD_DARK, textAlign:"center", letterSpacing:"0.2em", lineHeight:1, marginBottom:10 },
  todayDesc:{ textAlign:"center", fontSize:16, color:TEXT_SUB, marginBottom:24, fontWeight:700 },
  secLabel:{ fontSize:15, color:TEXT, marginBottom:12, fontWeight:700 },
  cgrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 },
  concern:{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"14px 8px", background:"#fffdf5", border:"1px solid rgba(212,165,32,0.3)", borderRadius:14, cursor:"pointer", transition:"all 0.2s" },
  concernOn:{ borderColor:GD, background:"#fff9e6" },
  cIcon:{ fontSize:24 },
  cLabel:{ fontSize:14, color:TEXT, fontWeight:700, textAlign:"center", lineHeight:1.4 },
  lead:{ fontSize:18, fontWeight:700, color:TEXT, textAlign:"center", marginBottom:8, lineHeight:1.6 },
  leadSub:{ fontSize:14, color:TEXT_SUB, fontWeight:500, textAlign:"center", marginBottom:20, lineHeight:1.8, whiteSpace:"pre-line" },
  input:{ width:"100%", border:"2px solid rgba(212,165,32,0.45)", borderRadius:14, padding:"14px 20px", fontSize:40, fontFamily:"'Cinzel',serif", fontWeight:700, color:GD_DARK, textAlign:"center", letterSpacing:"0.25em", background:"#fffdf5", marginBottom:20, transition:"all 0.2s" },
  error:{ color:"#c0392b", fontSize:15, fontWeight:700, textAlign:"center", marginBottom:12 },
  btnMain:{ width:"100%", background:GD, border:"none", borderRadius:14, color:"#fff", fontSize:18, fontFamily:"'Noto Sans JP',sans-serif", fontWeight:700, padding:"17px", cursor:"pointer", transition:"all 0.25s", boxShadow:"0 4px 16px rgba(180,130,30,0.28)", marginBottom:20, letterSpacing:"0.05em" },
  loadRow:{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 },
  spinner:{ width:20, height:20, border:"2px solid rgba(255,255,255,0.4)", borderTop:"2px solid #fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.8s linear infinite", flexShrink:0 },
  quickSection:{ textAlign:"center" },
  quickLabel:{ fontSize:13, color:TEXT_SUB, fontWeight:700, letterSpacing:"0.08em", marginBottom:10 },
  chips:{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" },
  chip:{ background:"#fffdf5", border:"1px solid rgba(212,165,32,0.4)", borderRadius:20, color:GD_DARK, fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700, padding:"8px 18px", cursor:"pointer", transition:"all 0.2s" },
  resultWrap:{ display:"flex", flexDirection:"column", gap:14 },
  numCard:{ background:"#fff", borderRadius:20, padding:"24px 20px", textAlign:"center", boxShadow:"0 4px 24px rgba(180,130,30,0.15)", border:`2px solid ${GD}` },
  numBig:{ fontFamily:"'Cinzel',serif", fontSize:60, fontWeight:700, color:GD_DARK, letterSpacing:"0.2em", marginBottom:12, lineHeight:1 },
  badges:{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" },
  badge:{ fontSize:13, fontWeight:700, color:GD_DARK, background:"#fff9e6", border:"1px solid rgba(212,165,32,0.4)", borderRadius:20, padding:"4px 13px" },
  titleCard:{ background:"#fff", borderRadius:16, padding:"18px 20px", textAlign:"center", boxShadow:"0 2px 16px rgba(180,130,30,0.08)", border:"1px solid rgba(212,165,32,0.2)" },
  resLabel:{ fontSize:13, color:TEXT_SUB, fontWeight:700, letterSpacing:"0.12em", marginBottom:8 },
  resTitle:{ fontSize:21, fontWeight:900, color:GD_DARK, lineHeight:1.6, letterSpacing:"0.03em" },
  msgCard:{ background:"#fffdf5", borderRadius:16, padding:"22px 20px", border:"1px solid rgba(212,165,32,0.25)" },
  msgText:{ fontSize:17, fontWeight:500, lineHeight:2.2, color:TEXT, textAlign:"center" },
  adviceCard:{ background:"#f0f8f0", borderRadius:14, padding:"16px 18px", border:"1px solid rgba(100,180,100,0.3)" },
  adviceHead:{ fontSize:14, color:"#1e5c1e", marginBottom:8, fontWeight:900, letterSpacing:"0.05em" },
  adviceText:{ fontSize:16, fontWeight:500, lineHeight:1.9, color:TEXT },
  affirmCard:{ background:"#f5f0ff", borderRadius:14, padding:"16px 18px", border:"1px solid rgba(150,100,200,0.25)", textAlign:"center" },
  affirmHead:{ fontSize:14, color:"#4a2070", marginBottom:8, fontWeight:900, letterSpacing:"0.05em" },
  affirmText:{ fontSize:18, fontWeight:700, lineHeight:1.8, color:"#3d1f60" },
  luckyCard:{ background:"#fff9e6", borderRadius:12, padding:"15px 18px", textAlign:"center", border:"1px solid rgba(212,165,32,0.4)" },
  luckyLabel:{ fontSize:15, color:TEXT_SUB, fontWeight:700 },
  luckyVal:{ fontSize:18, fontWeight:900, color:GD_DARK, fontFamily:"'Cinzel',serif" },
  shareCard:{ background:"#fff", borderRadius:16, padding:"20px 18px", border:"1px solid rgba(212,165,32,0.25)", boxShadow:"0 2px 16px rgba(180,130,30,0.08)" },
  shareTitle:{ fontSize:15, color:TEXT_SUB, fontWeight:700, letterSpacing:"0.08em", marginBottom:14, textAlign:"center" },
  shareRow:{ display:"flex", gap:10, justifyContent:"center", marginBottom:12, flexWrap:"wrap" },
  shareBtn:{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"12px 18px", borderRadius:14, border:"none", cursor:"pointer", transition:"all 0.2s", minWidth:68, fontFamily:"'Noto Sans JP',sans-serif" },
  sBtnIcon:{ fontSize:20, lineHeight:1 },
  sBtnLabel:{ fontSize:12, fontWeight:700, letterSpacing:"0.05em" },
  shareNote:{ fontSize:12, color:TEXT_SUB, fontWeight:500, textAlign:"center", letterSpacing:"0.05em" },
  snsCard:{ background:"#fff", borderRadius:14, padding:"16px 18px", border:"1px solid rgba(212,165,32,0.25)", boxShadow:"0 2px 12px rgba(180,130,30,0.06)" },
  snsHead:{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:14, color:TEXT_SUB, fontWeight:700, marginBottom:10 },
  snsText:{ fontSize:15, fontWeight:500, lineHeight:1.9, color:TEXT, whiteSpace:"pre-wrap" },
  btnCopy:{ background:"#fff9e6", border:"1px solid rgba(212,165,32,0.4)", borderRadius:20, color:GD_DARK, fontSize:13, fontWeight:700, padding:"5px 14px", cursor:"pointer", transition:"all 0.2s", fontFamily:"'Noto Sans JP',sans-serif" },
  btnReset:{ background:"transparent", border:"none", color:TEXT_SUB, fontSize:15, fontWeight:700, cursor:"pointer", padding:"10px 0", fontFamily:"'Noto Sans JP',sans-serif", transition:"color 0.2s", textAlign:"center", width:"100%" },
  footer:{ textAlign:"center", marginTop:40, fontSize:12, fontWeight:700, color:"rgba(150,100,20,0.4)", letterSpacing:"0.2em" },
};
