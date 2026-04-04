import { useState, useRef, useEffect } from "react";

function getTodayNumber() {
  const d = new Date();
  const str = `${d.getFullYear()}${d.getMonth()+1}${d.getDate()}`;
  let n = str.split("").reduce((a,b) => a + Number(b), 0);
  while (n >= 10 && ![11,22,33,44].includes(n)) {
    n = String(n).split("").reduce((a,b) => a + Number(b), 0);
  }
  return { number: String(n), date: `${d.getMonth()+1}月${d.getDate()}日` };
}

function reduceToCore(n) {
  while (n >= 10 && ![11,22,33,44].includes(n)) {
    n = String(n).split("").reduce((a,b) => a + Number(b), 0);
  }
  return n;
}

const CONCERNS = [
  { id:"love",   icon:"♡", label:"恋愛・人間関係" },
  { id:"work",   icon:"⭐", label:"仕事・使命"    },
  { id:"life",   icon:"🌿", label:"人生・方向性"  },
  { id:"health", icon:"✦", label:"健康・エネルギー" },
];

const ANGEL_BASE = {
  0:"無限の可能性", 1:"新しい始まり", 2:"調和と信頼",
  3:"創造と表現",   4:"天使の守護",   5:"変化と自由",
  6:"愛と調和",     7:"霊的覚醒",     8:"豊かさ",
  9:"使命の完成",  11:"直感と啓示",  22:"夢の実現",
  33:"慈悲と奉仕", 44:"安定と基盤",
};

const QUICK = ["111","222","333","444","555","777","1111","1212"];
const TABS  = [
  { id:"today",  label:"今日のナンバー" },
  { id:"search", label:"数字を調べる"   },
];

export default function AngelApp() {
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
  const today    = getTodayNumber();

  useEffect(() => {
    if (result) setTimeout(() => setShow(true), 50);
    else setShow(false);
  }, [result]);

  async function fetchAngel(numStr, concernId) {
    const digits   = numStr.split("").map(Number);
    const sum      = digits.reduce((a,b) => a+b, 0);
    const core     = reduceToCore(sum);
    const isZoro   = digits.every(d => d === digits[0]);
    const isMirror = numStr.length >= 2 && numStr === numStr.split("").reverse().join("");
    const baseDesc = ANGEL_BASE[core] || "神秘のエネルギー";
    const concernLabel = CONCERNS.find(c => c.id === concernId)?.label || "全般";

    const prompt = `あなたは優しく温かいエンジェルナンバーの専門家です。
エンジェルナンバー「${numStr}」について、特に「${concernLabel}」に関するメッセージを作ってください。

【数字情報】
- 数字: ${numStr}（コア: ${core} / ${baseDesc}）
${isZoro ? "- ゾロ目：パワーが増幅" : ""}
${isMirror ? "- ミラーナンバー：鏡の数字" : ""}
- テーマ: ${concernLabel}

【出力形式】（必ずこの形式・日本語で）
TITLE: （15文字以内の心温まるタイトル）
MESSAGE: （天使からの優しいメッセージ。130〜160文字。「あなた」への語りかけ。${concernLabel}に関連させる）
ADVICE: （今日すぐできる具体的なアドバイス。50文字以内）
AFFIRMATION: （朝に唱えるアファメーション。30文字以内。「私は〜」の形式）
LUCKY: （ラッキーカラーまたはアイテム。15文字以内）
SNS: （Instagram・TikTok用の投稿キャプション。絵文字たっぷり・共感性高く・100文字以内）`;

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
    if (!cleaned)         { setError("数字を入力してください"); return; }
    if (cleaned.length>8) { setError("8桁以内で入力してください"); return; }
    if (!concern)         { setError("テーマを選んでください"); return; }
    setError(""); setResult(null); setLoading(true);
    try { setResult(await fetchAngel(cleaned, concern)); }
    catch { setError("もう一度お試しください"); }
    finally { setLoading(false); }
  }

  async function handleToday(concernId) {
    setConcern(concernId); setResult(null); setLoading(true); setError("");
    try { setResult(await fetchAngel(today.number, concernId)); }
    catch { setError("もう一度お試しください"); }
    finally { setLoading(false); }
  }

  function reset() {
    setResult(null); setInput(""); setConcern(null); setError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function copySNS() {
    if (!result?.sns) return;
    navigator.clipboard.writeText(result.sns).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function buildShareText() {
    if (!result) return "";
    const cl = CONCERNS.find(c => c.id === result.concernId)?.label || "";
    return `🕊️ エンジェルナンバー【${result.number}】\n✨ ${result.title}\n\n${result.message}\n\n💡 今日のアドバイス：${result.advice}\n🌅 アファメーション：「${result.affirmation}」\n\n#エンジェルナンバー #${result.number} #${cl} #天使のメッセージ #スピリチュアル`;
  }

  async function handleShare(platform) {
    const text = buildShareText();
    if (platform === "native" && navigator.share) {
      try { await navigator.share({ title:`エンジェルナンバー【${result.number}】`, text }); } catch {}
      return;
    }
    const encoded = encodeURIComponent(text);
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encoded}`, "_blank");
    else if (platform === "line") window.open(`https://line.me/R/msg/text/?${encoded}`, "_blank");
    else if (platform === "copy") {
      navigator.clipboard.writeText(text).then(() => {
        setShared(true); setTimeout(() => setShared(false), 2000);
      });
    }
  }

  const concernLabel = CONCERNS.find(c => c.id === result?.concernId)?.label || "";

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&family=Cinzel:wght@600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin  { to { transform:rotate(360deg); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .tab:hover { background:#fff9e6 !important; }
        .tab-on { background:#fff !important; color:#7a5800 !important; box-shadow:0 2px 8px rgba(180,130,30,0.15) !important; }
        .btn-gold:hover  { background:#b8850a !important; transform:translateY(-1px); box-shadow:0 6px 20px rgba(180,130,30,0.4) !important; }
        .btn-gold:active { transform:translateY(0) !important; }
        .concern:hover { border-color:#d4a520 !important; background:#fff9e6 !important; }
        .concern-on { border-color:#d4a520 !important; background:#fff9e6 !important; box-shadow:0 0 0 2px rgba(212,165,32,0.3) !important; }
        .chip:hover { background:#fff3d6 !important; border-color:#c9962a !important; }
        .btn-reset:hover { color:#b87d1a !important; }
        .share-btn:hover { opacity:0.85 !important; transform:translateY(-1px); }
        input:focus { outline:none; border-color:#d4a520 !important; box-shadow:0 0 0 3px rgba(212,165,32,0.15) !important; }
      `}</style>

      {/* ヘッダー */}
      <div style={s.header}>
        <div style={s.angel}>🕊️</div>
        <h1 style={s.title}>エンジェルナンバー</h1>
        <p style={s.sub}>天使からのメッセージを受け取る</p>
      </div>

      {/* タブ */}
      <div style={s.tabBar}>
        {TABS.map(t => (
          <button key={t.id}
            className={`tab ${tab===t.id?"tab-on":""}`}
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
            <div style={s.todayBadge}>📅 {today.date}のエンジェルナンバー</div>
            <div style={s.todayNum}>{today.number}</div>
            <div style={s.todayDesc}>{ANGEL_BASE[Number(today.number)] || "神秘のエネルギー"}</div>
            <div style={s.secLabel}>テーマを選んでください</div>
            <div style={s.cgrid}>
              {CONCERNS.map(c => (
                <button key={c.id}
                  className={`concern ${concern===c.id?"concern-on":""}`}
                  onClick={() => { setConcern(c.id); setError(""); }}
                  style={{ ...s.concern, ...(concern===c.id?s.concernOn:{}) }}>
                  <span style={s.cIcon}>{c.icon}</span>
                  <span style={s.cLabel}>{c.label}</span>
                </button>
              ))}
            </div>
            {error && <p style={s.error}>⚠️ {error}</p>}
            <button className="btn-gold"
              onClick={() => { if (!concern){setError("テーマを選んでください");return;} handleToday(concern); }}
              disabled={loading} style={s.btnMain}>
              {loading
                ? <span style={s.loadRow}><span style={s.spinner}/>天使と交信中...</span>
                : "✨ 今日のメッセージを受け取る"}
            </button>
          </div>
        )}

        {/* 数字を調べる */}
        {tab==="search" && !result && (
          <div style={s.card}>
            <p style={s.lead}>気になる数字を入力してください</p>
            <p style={s.leadSub}>時計・ナンバープレートなど<br/>繰り返し見る数字はありませんか？</p>
            <input ref={inputRef} type="tel" value={input}
              onChange={e=>{setInput(e.target.value);setError("");}}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              placeholder="例：1111" maxLength={8} style={s.input} />
            <div style={s.secLabel}>テーマを選んでください</div>
            <div style={s.cgrid}>
              {CONCERNS.map(c => (
                <button key={c.id}
                  className={`concern ${concern===c.id?"concern-on":""}`}
                  onClick={() => { setConcern(c.id); setError(""); }}
                  style={{ ...s.concern, ...(concern===c.id?s.concernOn:{}) }}>
                  <span style={s.cIcon}>{c.icon}</span>
                  <span style={s.cLabel}>{c.label}</span>
                </button>
              ))}
            </div>
            {error && <p style={s.error}>⚠️ {error}</p>}
            <button className="btn-gold" onClick={handleSubmit} disabled={loading} style={s.btnMain}>
              {loading
                ? <span style={s.loadRow}><span style={s.spinner}/>天使と交信中...</span>
                : "✨ メッセージを受け取る"}
            </button>
            <div style={s.quickSection}>
              <p style={s.quickLabel}>よく見られる数字</p>
              <div style={s.chips}>
                {QUICK.map(n => (
                  <button key={n} className="chip"
                    onClick={()=>{setInput(n);setError("");}}
                    style={s.chip}>{n}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 結果 */}
        {result && (
          <div style={{
            ...s.resultWrap,
            opacity: show?1:0,
            transform: show?"translateY(0)":"translateY(20px)",
            transition:"all 0.5s ease",
          }}>

            {/* 数字カード */}
            <div style={s.numCard}>
              <div style={s.numBig}>{result.number}</div>
              <div style={s.badges}>
                {result.isZoro   && <span style={s.badge}>✦ ゾロ目</span>}
                {result.isMirror && <span style={s.badge}>◈ ミラー</span>}
                <span style={s.badge}>コア：{result.core}</span>
                <span style={{...s.badge, background:"#fff0f5", borderColor:"rgba(200,100,130,0.4)", color:"#8a3050"}}>
                  {CONCERNS.find(c=>c.id===result.concernId)?.icon} {concernLabel}
                </span>
              </div>
            </div>

            {/* タイトル */}
            <div style={s.titleCard}>
              <p style={s.resLabel}>✨ 天使からのメッセージ</p>
              <h2 style={s.resTitle}>{result.title}</h2>
            </div>

            {/* メッセージ */}
            <div style={s.msgCard}>
              <p style={s.msgText}>{result.message}</p>
            </div>

            {/* アドバイス */}
            <div style={s.adviceCard}>
              <div style={s.adviceHead}>💡 今日すぐできること</div>
              <div style={s.adviceText}>{result.advice}</div>
            </div>

            {/* アファメーション */}
            <div style={s.affirmCard}>
              <div style={s.affirmHead}>🌅 朝のアファメーション</div>
              <div style={s.affirmText}>「{result.affirmation}」</div>
            </div>

            {/* ラッキー */}
            <div style={s.luckyCard}>
              <span style={s.luckyLabel}>🌟 ラッキー　</span>
              <span style={s.luckyVal}>{result.lucky}</span>
            </div>

            {/* シェアボタン */}
            <div style={s.shareCard}>
              <div style={s.shareTitle}>📲 シェアする</div>
              <div style={s.shareRow}>
                <button className="share-btn" onClick={()=>handleShare("twitter")}
                  style={{...s.shareBtn, background:"#000", color:"#fff"}}>
                  <span style={s.sBtnIcon}>𝕏</span>
                  <span style={s.sBtnLabel}>X</span>
                </button>
                <button className="share-btn" onClick={()=>handleShare("line")}
                  style={{...s.shareBtn, background:"#06C755", color:"#fff"}}>
                  <span style={s.sBtnIcon}>💬</span>
                  <span style={s.sBtnLabel}>LINE</span>
                </button>
                <button className="share-btn" onClick={()=>handleShare("copy")}
                  style={{...s.shareBtn, background:"#f5ead0", color:"#7a5800", border:"1px solid rgba(212,165,32,0.4)"}}>
                  <span style={s.sBtnIcon}>{shared?"✓":"📋"}</span>
                  <span style={s.sBtnLabel}>{shared?"コピー済":"コピー"}</span>
                </button>
                {navigator.share && (
                  <button className="share-btn" onClick={()=>handleShare("native")}
                    style={{...s.shareBtn, background:"#d4a520", color:"#fff"}}>
                    <span style={s.sBtnIcon}>↑</span>
                    <span style={s.sBtnLabel}>シェア</span>
                  </button>
                )}
              </div>
              <p style={s.shareNote}>ハッシュタグ付きで投稿されます 🕊️</p>
            </div>

            {/* SNSキャプション */}
            <div style={s.snsCard}>
              <div style={s.snsHead}>
                <span>📱 SNS投稿用キャプション</span>
                <button onClick={copySNS} style={s.btnCopy}>
                  {copied?"✓ コピー済み":"コピー"}
                </button>
              </div>
              <div style={s.snsText}>{result.sns}</div>
            </div>

            <button className="btn-reset" onClick={reset} style={s.btnReset}>
              ← 別の数字・テーマを調べる
            </button>
          </div>
        )}

        <p style={s.footer}>✦ Angel Number AI ✦</p>
      </div>
    </div>
  );
}

/* ── スタイル（フォント太め版）── */
const GD="#d4a520", GD_DARK="#7a5800";
const CREAM="#fdf8f0", TEXT="#1a1000", TEXT_SUB="#5a4010";
// ★ フォントを Noto Sans JP（太め）に変更、全体的に weight を上げる

const s = {
  root:{ minHeight:"100vh", background:CREAM, fontFamily:"'Noto Sans JP',sans-serif", color:TEXT },

  header:{
    background:"linear-gradient(160deg,#fff9ed 0%,#fdefc8 60%,#fdf3d5 100%)",
    padding:"36px 20px 28px", textAlign:"center",
    borderBottom:"1px solid rgba(212,165,32,0.25)",
  },
  angel:{ fontSize:52, display:"block", marginBottom:10, animation:"float 3s ease-in-out infinite" },
  title:{
    fontFamily:"'Cinzel',serif", fontSize:28, fontWeight:700,
    letterSpacing:"0.12em", color:GD_DARK, marginBottom:6,
  },
  sub:{ fontSize:14, color:TEXT_SUB, letterSpacing:"0.08em", fontWeight:500 },

  tabBar:{ display:"flex", background:"#f0e0b0", padding:"6px", gap:4 },
  tab:{
    flex:1, padding:"13px 0", fontSize:15, fontWeight:700,
    fontFamily:"'Noto Sans JP',sans-serif", color:TEXT_SUB,
    background:"transparent", border:"none", borderRadius:8,
    cursor:"pointer", transition:"all 0.2s", letterSpacing:"0.05em",
  },
  tabOn:{ background:"#fff", color:GD_DARK },

  body:{ maxWidth:480, margin:"0 auto", padding:"20px 16px 48px" },

  card:{
    background:"#fff", borderRadius:20, padding:"28px 20px",
    boxShadow:"0 4px 24px rgba(180,130,30,0.12)",
    border:"1px solid rgba(212,165,32,0.25)",
  },

  todayBadge:{
    display:"inline-block", background:"#fff9e6",
    border:"1px solid rgba(212,165,32,0.4)", borderRadius:20,
    padding:"5px 16px", fontSize:14, color:GD_DARK,
    marginBottom:16, letterSpacing:"0.05em", fontWeight:700,
  },
  todayNum:{
    fontFamily:"'Cinzel',serif", fontSize:76, fontWeight:700,
    color:GD_DARK, textAlign:"center", letterSpacing:"0.2em",
    lineHeight:1, marginBottom:10,
  },
  todayDesc:{ textAlign:"center", fontSize:16, color:TEXT_SUB, marginBottom:24, fontWeight:700 },

  secLabel:{ fontSize:15, color:TEXT, marginBottom:12, fontWeight:700 },

  cgrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 },
  concern:{
    display:"flex", flexDirection:"column", alignItems:"center", gap:6,
    padding:"14px 8px", background:"#fffdf5",
    border:"1px solid rgba(212,165,32,0.3)", borderRadius:14,
    cursor:"pointer", transition:"all 0.2s",
  },
  concernOn:{ borderColor:GD, background:"#fff9e6" },
  cIcon:{ fontSize:24 },
  cLabel:{ fontSize:14, color:TEXT, fontWeight:700, textAlign:"center", lineHeight:1.4 },

  lead:{ fontSize:18, fontWeight:700, color:TEXT, textAlign:"center", marginBottom:8, lineHeight:1.6 },
  leadSub:{ fontSize:14, color:TEXT_SUB, fontWeight:500, textAlign:"center", marginBottom:20, lineHeight:1.8 },

  input:{
    width:"100%", border:"2px solid rgba(212,165,32,0.45)", borderRadius:14,
    padding:"14px 20px", fontSize:40, fontFamily:"'Cinzel',serif",
    fontWeight:700, color:GD_DARK, textAlign:"center", letterSpacing:"0.25em",
    background:"#fffdf5", marginBottom:20, transition:"all 0.2s",
  },
  error:{ color:"#c0392b", fontSize:15, fontWeight:700, textAlign:"center", marginBottom:12 },

  btnMain:{
    width:"100%", background:GD, border:"none", borderRadius:14,
    color:"#fff", fontSize:18, fontFamily:"'Noto Sans JP',sans-serif",
    fontWeight:700, padding:"17px", cursor:"pointer",
    transition:"all 0.25s", boxShadow:"0 4px 16px rgba(180,130,30,0.28)",
    marginBottom:20, letterSpacing:"0.05em",
  },
  loadRow:{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 },
  spinner:{
    width:20, height:20, border:"2px solid rgba(255,255,255,0.4)",
    borderTop:"2px solid #fff", borderRadius:"50%",
    display:"inline-block", animation:"spin 0.8s linear infinite", flexShrink:0,
  },

  quickSection:{ textAlign:"center" },
  quickLabel:{ fontSize:13, color:TEXT_SUB, fontWeight:700, letterSpacing:"0.08em", marginBottom:10 },
  chips:{ display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" },
  chip:{
    background:"#fffdf5", border:"1px solid rgba(212,165,32,0.4)", borderRadius:20,
    color:GD_DARK, fontFamily:"'Cinzel',serif", fontSize:15, fontWeight:700,
    padding:"8px 18px", cursor:"pointer", transition:"all 0.2s",
  },

  resultWrap:{ display:"flex", flexDirection:"column", gap:14 },

  numCard:{
    background:"#fff", borderRadius:20, padding:"24px 20px",
    textAlign:"center", boxShadow:"0 4px 24px rgba(180,130,30,0.15)",
    border:`2px solid ${GD}`,
  },
  numBig:{
    fontFamily:"'Cinzel',serif", fontSize:60, fontWeight:700,
    color:GD_DARK, letterSpacing:"0.2em", marginBottom:12, lineHeight:1,
  },
  badges:{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" },
  badge:{
    fontSize:13, fontWeight:700, color:GD_DARK, background:"#fff9e6",
    border:"1px solid rgba(212,165,32,0.4)", borderRadius:20, padding:"4px 13px",
  },

  titleCard:{
    background:"#fff", borderRadius:16, padding:"18px 20px",
    textAlign:"center", boxShadow:"0 2px 16px rgba(180,130,30,0.08)",
    border:"1px solid rgba(212,165,32,0.2)",
  },
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

  shareCard:{
    background:"#fff", borderRadius:16, padding:"20px 18px",
    border:"1px solid rgba(212,165,32,0.25)",
    boxShadow:"0 2px 16px rgba(180,130,30,0.08)",
  },
  shareTitle:{ fontSize:15, color:TEXT_SUB, fontWeight:700, letterSpacing:"0.08em", marginBottom:14, textAlign:"center" },
  shareRow:{ display:"flex", gap:10, justifyContent:"center", marginBottom:12, flexWrap:"wrap" },
  shareBtn:{
    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
    padding:"12px 18px", borderRadius:14, border:"none",
    cursor:"pointer", transition:"all 0.2s", minWidth:68,
    fontFamily:"'Noto Sans JP',sans-serif",
  },
  sBtnIcon:{ fontSize:20, lineHeight:1 },
  sBtnLabel:{ fontSize:12, fontWeight:700, letterSpacing:"0.05em" },
  shareNote:{ fontSize:12, color:TEXT_SUB, fontWeight:500, textAlign:"center", letterSpacing:"0.05em" },

  snsCard:{
    background:"#fff", borderRadius:14, padding:"16px 18px",
    border:"1px solid rgba(212,165,32,0.25)",
    boxShadow:"0 2px 12px rgba(180,130,30,0.06)",
  },
  snsHead:{
    display:"flex", alignItems:"center", justifyContent:"space-between",
    fontSize:14, color:TEXT_SUB, fontWeight:700, marginBottom:10,
  },
  snsText:{ fontSize:15, fontWeight:500, lineHeight:1.9, color:TEXT, whiteSpace:"pre-wrap" },
  btnCopy:{
    background:"#fff9e6", border:"1px solid rgba(212,165,32,0.4)",
    borderRadius:20, color:GD_DARK, fontSize:13, fontWeight:700,
    padding:"5px 14px", cursor:"pointer", transition:"all 0.2s",
    fontFamily:"'Noto Sans JP',sans-serif",
  },

  btnReset:{
    background:"transparent", border:"none", color:TEXT_SUB,
    fontSize:15, fontWeight:700, cursor:"pointer", padding:"10px 0",
    fontFamily:"'Noto Sans JP',sans-serif", transition:"color 0.2s",
    textAlign:"center", width:"100%",
  },
  footer:{ textAlign:"center", marginTop:40, fontSize:12, fontWeight:700, color:"rgba(150,100,20,0.4)", letterSpacing:"0.2em" },
};
