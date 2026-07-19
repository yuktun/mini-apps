(function(){
  const STORAGE_KEY='jp_theme_mode';
  const MODES=['auto','light','dark'];
  const LABELS={auto:'自動',light:'光亮',dark:'深色'};
  const isDaytime=()=>{const hour=new Date().getHours();return hour>=7&&hour<19};
  const effectiveTheme=mode=>mode==='auto'?(isDaytime()?'light':'dark'):mode;
  const readMode=()=>{try{const saved=localStorage.getItem(STORAGE_KEY);return MODES.includes(saved)?saved:'auto'}catch(e){return'auto'}};
  let mode=readMode();
  const applyTheme=()=>{
    const theme=effectiveTheme(mode);
    document.documentElement.dataset.theme=theme;
    document.documentElement.dataset.themeMode=mode;
    const select=document.getElementById('themeSelect');
    if(select)select.value=mode;
    window.dispatchEvent(new CustomEvent('themechange',{detail:{mode,theme}}));
  };
  applyTheme();
  const style=document.createElement('style');
  style.id='sharedThemeStyles';
  style.textContent=`
    html{transition:background-color .2s,color .2s}
    .theme-control{position:fixed;top:16px;right:16px;z-index:3000;display:flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid #dbe4ee;border-radius:999px;background:rgba(255,255,255,.94);box-shadow:0 8px 24px rgba(15,23,42,.14);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font:800 14px/1 system-ui,-apple-system,"Segoe UI","Noto Sans TC",sans-serif;color:#17324d}
    .theme-control select{width:auto!important;min-width:70px;padding:5px 24px 5px 7px!important;border:0!important;border-radius:8px!important;background-color:transparent!important;color:inherit!important;font:inherit!important;box-shadow:none!important;cursor:pointer}
    html[data-theme="dark"]{color-scheme:dark;background:#0b1220}
    html[data-theme="dark"] body{background:#0b1220!important;color:#e5edf7!important}
    html[data-theme="dark"] .app,html[data-theme="dark"] main{color:#e5edf7}
    html[data-theme="dark"] .panel,html[data-theme="dark"] .toolbar,html[data-theme="dark"] .tabs,html[data-theme="dark"] .card,html[data-theme="dark"] .front,html[data-theme="dark"] .back,html[data-theme="dark"] .choice,html[data-theme="dark"] .exercise,html[data-theme="dark"] .phrase-card,html[data-theme="dark"] .modal-card,html[data-theme="dark"] .grammar-modal,html[data-theme="dark"] .review-panel,html[data-theme="dark"] .review-item,html[data-theme="dark"] .mini,html[data-theme="dark"] .vocab-row,html[data-theme="dark"] .sentence-item,html[data-theme="dark"] .drop-slot,html[data-theme="dark"] .word-bank,html[data-theme="dark"] .token-area,html[data-theme="dark"] .summary-table{background:#111c2e!important;color:#e5edf7!important;border-color:#334155!important}
    html[data-theme="dark"] h1,html[data-theme="dark"] h2,html[data-theme="dark"] h3,html[data-theme="dark"] .title,html[data-theme="dark"] .word,html[data-theme="dark"] .question,html[data-theme="dark"] .jp,html[data-theme="dark"] .big,html[data-theme="dark"] .sub,html[data-theme="dark"] .dialog-title h2,html[data-theme="dark"] .modal-card h2,html[data-theme="dark"] .modal-head h2{color:#f1f5f9!important}
    html[data-theme="dark"] .subtitle,html[data-theme="dark"] .desc,html[data-theme="dark"] .cue,html[data-theme="dark"] .progress,html[data-theme="dark"] .speaker,html[data-theme="dark"] .meta,html[data-theme="dark"] .hint,html[data-theme="dark"] .explain,html[data-theme="dark"] .review-answers,html[data-theme="dark"] .review-explanation,html[data-theme="dark"] .lesson,html[data-theme="dark"] label,html[data-theme="dark"] #savedInfo,html[data-theme="dark"] #savedText{color:#a9b8ca!important}
    html[data-theme="dark"] .note,html[data-theme="dark"] .grammar-example,html[data-theme="dark"] .feedback,html[data-theme="dark"] .model,html[data-theme="dark"] .reading,html[data-theme="dark"] .answer{background:#182438!important;color:#dce7f3!important;border-color:#3b4a60!important}
    html[data-theme="dark"] input,html[data-theme="dark"] textarea,html[data-theme="dark"] select{background:#0f1a2b!important;color:#e5edf7!important;border-color:#475569!important}
    html[data-theme="dark"] button.secondary,html[data-theme="dark"] .secondary,html[data-theme="dark"] .small-btn,html[data-theme="dark"] .chip,html[data-theme="dark"] .lesson-btn{background:#1e2b3f!important;color:#dce7f3!important;border-color:#475569!important}
    html[data-theme="dark"] .segment,html[data-theme="dark"] .mode{background:#111c2e!important;border-color:#475569!important;box-shadow:none!important}
    html[data-theme="dark"] .segment button,html[data-theme="dark"] .mode button{background:transparent!important;color:#cbd5e1!important}
    html[data-theme="dark"] .segment button.active,html[data-theme="dark"] .mode button.active,html[data-theme="dark"] .lesson-btn.active{background:#2563eb!important;color:#fff!important;border-color:#2563eb!important}
    html[data-theme="dark"] .small-btn.active{background:#34255f!important;color:#ddd6fe!important;border-color:#7c5cc4!important}
    html[data-theme="dark"] .btn.circle{background:#17243a!important;color:#60a5fa!important;border-color:#3b82f6!important;box-shadow:none!important}
    html[data-theme="dark"] .review-btn{background:#1e2b3f!important;color:#cbd5e1!important;border-color:#475569!important}
    html[data-theme="dark"] .review-btn.active{background:#172d50!important;color:#93c5fd!important;border-color:#3b82f6!important}
    html[data-theme="dark"] .review-btn.correct.active{background:#12382d!important;color:#a7f3d0!important;border-color:#237a5c!important}
    html[data-theme="dark"] .review-btn.incorrect.active{background:#451d28!important;color:#fecdd3!important;border-color:#9f3b50!important}
    html[data-theme="dark"] .review-title,html[data-theme="dark"] .review-note,html[data-theme="dark"] .reset{color:#a9b8ca!important}
    html[data-theme="dark"] .tab{color:#b8c6d8!important}html[data-theme="dark"] .tab.active{background:#1f4c73!important;color:#fff!important}
    html[data-theme="dark"] .chip.active{background:#1f4c73!important;color:#dbeafe!important;border-color:#4f83ae!important}
    html[data-theme="dark"] .quiz-choice{background:#17243a!important;color:#eef4fb!important;border-color:#475569!important}
    html[data-theme="dark"] .quiz-choice:hover{background:#1e304a!important;border-color:#60a5fa!important}
    html[data-theme="dark"] .phrase{color:#f1f5f9!important}html[data-theme="dark"] .reading{color:#b8c6d8!important}
    html[data-theme="dark"] .badge{background:#203a57!important;color:#dbeafe!important;border-color:#4f6f91!important}
    html[data-theme="dark"] .highlight{background:#4a3914!important;color:#fde68a!important;border-color:#d6a72f!important}
    html[data-theme="dark"] .token{background:#20354d!important;color:#dbeafe!important;border-color:#52769b!important}
    html[data-theme="dark"] .modal-close{background:#1e2b3f!important;color:#eef4fb!important;border-color:#64748b!important}
    html[data-theme="dark"] .home-fab,html[data-theme="dark"] .theme-control{background:rgba(17,28,46,.95)!important;color:#e5edf7!important;border-color:#475569!important}
    html[data-theme="dark"] .exercise h2,html[data-theme="dark"] .titlebar{background:#182438!important;color:#eef4fb!important}
    html[data-theme="dark"] .line,html[data-theme="dark"] .dialog-title,html[data-theme="dark"] .modal-head{border-color:#334155!important}
    html[data-theme="dark"] .choice.correct,html[data-theme="dark"] .quiz-choice.correct,html[data-theme="dark"] .good,html[data-theme="dark"] .ok{background:#12382d!important;color:#a7f3d0!important;border-color:#237a5c!important}
    html[data-theme="dark"] .choice.wrong,html[data-theme="dark"] .quiz-choice.wrong,html[data-theme="dark"] .bad,html[data-theme="dark"] .no{background:#451d28!important;color:#fecdd3!important;border-color:#9f3b50!important}
    html[data-theme="dark"] .review-status{color:#86efac!important}html[data-theme="dark"] .review-item.wrong .review-status{color:#fda4af!important}html[data-theme="dark"] .review-explanation{border-color:#334155!important}
    html[data-theme="dark"] .grammar-note,html[data-theme="dark"] .warning{background:#3b3015!important;color:#fde68a!important;border-color:#806b27!important}
    html[data-theme="dark"] .bar{background:#334155!important}
    html[data-theme="dark"] option{background:#111c2e;color:#e5edf7}
    @media(max-width:600px){.theme-control{top:10px;right:10px;padding:6px 8px;font-size:13px}.theme-control span{display:none}}
  `;
  document.head.appendChild(style);
  const createControl=()=>{
    if(document.getElementById('themeControl'))return;
    const control=document.createElement('label');
    control.id='themeControl';
    control.className='theme-control';
    control.innerHTML='<span aria-hidden="true">◐</span><select id="themeSelect" aria-label="頁面主題"></select>';
    const select=control.querySelector('select');
    MODES.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=LABELS[value];select.appendChild(option)});
    select.value=mode;
    select.addEventListener('change',()=>{mode=select.value;try{localStorage.setItem(STORAGE_KEY,mode)}catch(e){}applyTheme()});
    document.body.appendChild(control);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',createControl);else createControl();
})();
