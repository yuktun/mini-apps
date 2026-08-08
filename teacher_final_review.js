(function(){
  "use strict";
  const STORAGE_KEY="japaneseMiniApps_teacherFinalReview_v1",CONTENT_VERSION=2,questions=window.TEACHER_FINAL_REVIEW_QUESTIONS||[],byId=new Map(questions.map(q=>[q.id,q]));
  const revisedQuestionIds=["teacher-review-g02","teacher-review-g03","teacher-review-g04","teacher-review-g05","teacher-review-g07","teacher-review-g10","teacher-review-g12"];
  const $=id=>document.getElementById(id),escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fresh=()=>({version:1,contentVersion:CONTENT_VERSION,results:{},drafts:{},marked:{},quick:{},settings:{section:"all",mode:"quick",count:"all",random:false}});
  function load(){try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");if(!parsed||parsed.version!==1)return fresh();const loaded={...fresh(),...parsed,results:parsed.results||{},drafts:parsed.drafts||{},marked:parsed.marked||{},quick:parsed.quick||{},settings:{...fresh().settings,...(parsed.settings||{})}};if((parsed.contentVersion||1)<CONTENT_VERSION){revisedQuestionIds.forEach(id=>{delete loaded.results[id];delete loaded.drafts[id];delete loaded.quick[id]});loaded.contentVersion=CONTENT_VERSION;localStorage.setItem(STORAGE_KEY,JSON.stringify(loaded))}return loaded}catch(_){return fresh()}}
  let state=load(),session=[],position=0,mode="quick",examStartedAt=null,examFinished=false,quickRevealed=false;const hiddenFeedback=new Set(),aiUi=new Map(),aiRequests=new Set();
  const normalize=value=>String(value??"").normalize("NFKC").replace(/[\s\u3000]+/g,"").replace(/[。．.、，,！!？?]+$/g,"").trim();
  const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  const sectionLabel=value=>value==="particle"?"助詞":value==="grammar"?"文法":"全部";
  const behavior=()=>mode==="wrong"||mode==="marked"?"practice":mode;
  const fullSentence=q=>q.type==="written"?q.sentenceParts.map((part,index)=>part+(index<q.answers.length?q.displayAnswer[index]:"")).join(""):q.completeSentence;
  const answerLabel=q=>q.type==="written"?q.displayAnswer.join("／"):q.choices[q.answer];
  const answerValues=q=>q.type==="written"?(Array.isArray(state.drafts[q.id])?state.drafts[q.id]:[]):state.drafts[q.id];
  const aiEligible=q=>behavior()!=="exam"&&q.type==="written"&&q.sourceCertainty==="model-answer-reference";
  const aiKey=q=>`${q.id}::${answerValues(q).map(normalize).join("\u241f")}`;
  function aiHtml(q){
    if(!aiEligible(q))return "";
    const key=aiKey(q),entry=aiUi.get(key),ready=isAnswered(q),loading=aiRequests.has(key),labels={correct:"✅ 正確",acceptable:"🟢 可以／可接受",incorrect:"❌ 不正確",uncertain:"🟡 AI 無法確定"};
    const button=`<button class="ai-check-button" type="button" data-action="ai-check" ${ready&&!loading?"":"disabled"}>${loading?"AI 檢查中…":"✨ AI 檢查我的答案"}</button>`;
    const disclaimer=`<p class="ai-disclaimer">AI 判斷只供學習參考；考試請以老師教授的文法及答案要求為準。</p>`;
    if(entry?.status==="error")return `<section class="ai-check">${button}<p class="ai-error">暫時未能使用 AI 檢查，請稍後再試。</p>${disclaimer}</section>`;
    if(entry?.status!=="result")return `<section class="ai-check">${button}${!ready?"<p class=\"ai-note\">請先完成所有空格，再使用 AI 檢查。</p>":""}${disclaimer}</section>`;
    const result=entry.result;
    return `<section class="ai-check ai-result"><h4>✨ AI 判斷</h4><p class="ai-verdict">${labels[result.verdict]}</p><p>${escapeHtml(result.summary_zh)}</p><p><strong>文法：</strong>${escapeHtml(result.grammar_zh)}</p><p><strong>自然度／情境：</strong>${escapeHtml(result.naturalness_zh)}</p>${result.suggested_answer_ja?`<p><strong>建議寫法：</strong><span lang="ja">${escapeHtml(result.suggested_answer_ja)}</span></p>`:""}${button}${disclaimer}</section>`;
  }
  function isAnswered(q){const value=answerValues(q);return q.type==="written"?q.answers.every((_,i)=>normalize(value[i])):Number.isInteger(value)}
  function grade(q){const value=answerValues(q);if(q.type==="choice")return value===q.answer;return q.answers.every((accepted,i)=>accepted.some(answer=>normalize(answer)===normalize(value[i])))}
  function selectedLabel(q){const value=answerValues(q);return q.type==="choice"?(Number.isInteger(value)?q.choices[value]:"未作答"):(value.length?value.join("／"):"未作答")}
  function persistSettings(){state.settings={section:$("sectionSelect").value,mode:$("modeSelect").value,count:$("countSelect").value,random:$("randomCheck").checked};save()}
  function hydrateSettings(){const s=state.settings;$("sectionSelect").value=s.section;$("modeSelect").value=s.mode;$("countSelect").value=s.count;$("randomCheck").checked=Boolean(s.random)}
  function stats(){const list=questions.filter(q=>state.settings.section==="all"||q.section===state.settings.section),results=list.map(q=>state.results[q.id]).filter(Boolean);const correct=results.filter(r=>r.status==="correct").length,incorrect=results.filter(r=>r.status==="incorrect").length,reviewed=results.filter(r=>r.status==="reviewed").length,total=correct+incorrect;return{correct,incorrect,reviewed,accuracy:total?Math.round(correct/total*100):0,known:list.filter(q=>state.quick[q.id]==="known").length,needsReview:list.filter(q=>state.quick[q.id]==="review").length}}
  function showOnly(name){["setup","quiz","results"].forEach(id=>$(id).classList.toggle("hidden",id!==name))}
  function showToast(text){const el=document.createElement("div");el.className="toast";el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1800)}
  function updateSavedInfo(){const s=stats(),marked=Object.values(state.marked).filter(Boolean).length;$("savedInfo").innerHTML=`已保存：<strong>${s.correct}</strong> 題答對、<strong>${s.incorrect}</strong> 題答錯、<strong>${s.reviewed}</strong> 題查看答案、<strong>${marked}</strong> 題已標記。快速溫習：記得 ${s.known}／需要重溫 ${s.needsReview}。`}
  function shuffle(list){for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}return list}
  function buildSession(){persistSettings();mode=state.settings.mode;let list=questions.filter(q=>state.settings.section==="all"||q.section===state.settings.section);if(mode==="wrong")list=list.filter(q=>state.results[q.id]?.status==="incorrect");if(mode==="marked")list=list.filter(q=>state.marked[q.id]);if(state.settings.random)shuffle(list);const count=state.settings.count==="all"?list.length:Number(state.settings.count);session=list.slice(0,count);position=0;examFinished=false;examStartedAt=mode==="exam"?Date.now():null;quickRevealed=false;return session.length>0}
  function start(){if(!buildSession()){showToast(mode==="wrong"?"目前沒有錯題。":"目前沒有符合條件的題目。");return}showOnly("quiz");render()}
  function captureWritten(q){if(q.type!=="written")return;state.drafts[q.id]=[...document.querySelectorAll("[data-answer-input]")].map(el=>el.value);save()}
  function renderQuestion(q){
    if(q.type==="choice"){
      const selected=answerValues(q),result=behavior()==="practice"?state.results[q.id]:null;
      return `<div class="question" lang="ja" data-no-furigana>${escapeHtml(q.prompt)}</div><div class="choices">${q.choices.map((choice,index)=>`<button type="button" class="choice ${selected===index?"selected":""} ${result&&index===q.answer?"correct":""} ${result?.status==="incorrect"&&selected===index?"wrong":""}" data-choice="${index}">${String.fromCharCode(65+index)}. ${escapeHtml(choice)}</button>`).join("")}</div>`;
    }
    const draft=answerValues(q),sentence=q.sentenceParts.map((part,index)=>index<q.answers.length?`${escapeHtml(part)}<input class="blank-input" data-answer-input data-index="${index}" lang="ja" inputmode="text" autocomplete="off" aria-label="空格 ${index+1}" value="${escapeHtml(draft[index]||"")}">`:escapeHtml(part)).join("");
    return `<div class="question" lang="ja" data-no-furigana>${sentence}</div>`;
  }
  function feedbackHtml(q,result,quick=false){
    const status=quick?"reviewed":result?.status||"reviewed",cls=status==="correct"?"good":status==="incorrect"?"bad":"reviewed",title=quick?"快速答案":status==="correct"?"〇 答對了。":status==="incorrect"?"✕ 答錯了。":"已查看答案；本題不計作答對。";
    const modelNote=["model-answer","model-answer-reference"].includes(q.sourceCertainty)?`<p class="adapted-note">原本的老師題目是開放式造句／會話；此處採用參考答案中的安全示範。考試時請先準確掌握文法接續，其他符合文法及情境的內容也可能成立。</p>`:"";
    const grammarLink=q.grammarCard?`<button class="grammar-card-link" type="button" data-action="open-grammar-card">查看相關文法卡 ↗</button>`:"";
    return `<div class="feedback ${cls}"><h3>${title}</h3>${!quick&&result?.status==="incorrect"?`<p><strong>你的答案：</strong><span lang="ja">${escapeHtml(selectedLabel(q))}</span></p>`:""}<p><strong>正確答案：</strong><span lang="ja">${escapeHtml(answerLabel(q))}</span></p><p class="complete"><strong>完整句子：</strong><span lang="ja">${escapeHtml(fullSentence(q))}</span></p><p><strong>文法重點：</strong>${escapeHtml(q.grammarPoint)}</p><p><strong>解釋：</strong>${escapeHtml(q.explanationZh)}</p><p><strong>中文意思：</strong>${escapeHtml(q.meaningZh)}</p>${modelNote}${grammarLink}${aiHtml(q)}<p class="source-note">老師複習紙第 ${q.page} 頁・${sectionLabel(q.section)}第 ${q.printedNo} 題</p></div>`;
  }
  function renderActions(q){
    const b=behavior(),hasResult=Boolean(state.results[q.id]),isHidden=hiddenFeedback.has(q.id);
    if(b==="quick")return quickRevealed?`<button class="known" data-action="quick-known" type="button">✓ 記得</button><button class="review" data-action="quick-review" type="button">↻ 需要再溫習</button>`:`<button class="primary" data-action="quick-reveal" type="button">顯示答案及解釋</button>`;
    if(b==="practice")return `<button class="secondary" data-action="reveal" type="button">查看答案</button><button class="primary" data-action="check" type="button">檢查答案</button>${hasResult?`<button class="secondary" data-action="${isHidden?"show-feedback":"hide-feedback"}" type="button">${isHidden?"顯示解釋":"隱藏解釋"}</button>`:""}`;
    return `<button class="secondary" data-action="clear" type="button">清除本題答案</button>`;
  }
  function render(){
    const q=session[position],b=behavior(),s=stats(),result=state.results[q.id],quickStatus=state.quick[q.id];
    $("progressText").textContent=`第 ${position+1} / ${session.length} 題`;
    $("statPills").innerHTML=b==="quick"?`<span class="pill">✓ 記得 ${s.known}</span><span class="pill">↻ 重溫 ${s.needsReview}</span>`:`<span class="pill">〇 正確 ${s.correct}</span><span class="pill">✕ 錯誤 ${s.incorrect}</span><span class="pill">正確率 ${s.accuracy}%</span>${b==="exam"?`<span class="pill">⏱ 計時中</span>`:""}`;
    $("jumpInput").max=session.length;$("jumpInput").value=position+1;$("rangeInput").max=session.length;$("rangeInput").value=position+1;
    $("meta").innerHTML=`<span class="badge">${sectionLabel(q.section)} ${q.printedNo}</span><span class="badge source">老師複習紙 p.${q.page}</span>${quickStatus?`<span class="badge">${quickStatus==="known"?"已記得":"需重溫"}</span>`:""}`;
    $("markButton").classList.toggle("active",Boolean(state.marked[q.id]));$("markButton").textContent=state.marked[q.id]?"★":"☆";$("markButton").setAttribute("aria-pressed",String(Boolean(state.marked[q.id])));
    $("instruction").textContent=b==="quick"?"先在心中作答，再顯示答案。":b==="exam"?"請作答；考試模式會在提交後一次評分。":q.type==="written"?`請填寫答案（空格：${q.answers.length}）。`:"請選擇最合適的答案。";
    $("questionArea").innerHTML=renderQuestion(q);
    $("feedbackArea").innerHTML=b==="quick"&&quickRevealed?`<div class="quick-answer">${feedbackHtml(q,null,true)}<div class="quick-grade">${renderActions(q)}</div></div>`:b==="practice"&&result&&!hiddenFeedback.has(q.id)?feedbackHtml(q,result):"";
    $("questionActions").innerHTML=b==="quick"&&quickRevealed?"":renderActions(q);
    $("submitButton").classList.toggle("hidden",b!=="exam");$("nextButton").textContent=position===session.length-1?"回到第一題 ↻":"下一題 →";
    bindQuestion(q);window.Furigana?.apply($("feedbackArea"));
  }
  function bindQuestion(q){
    document.querySelectorAll("[data-choice]").forEach(button=>button.addEventListener("click",()=>{state.drafts[q.id]=Number(button.dataset.choice);save();render()}));
    const inputs=[...document.querySelectorAll("[data-answer-input]")];inputs.forEach((input,index)=>{input.addEventListener("input",()=>captureWritten(q));input.addEventListener("keydown",event=>{if(event.key!=="Enter")return;event.preventDefault();captureWritten(q);if(index<inputs.length-1)inputs[index+1].focus();else if(behavior()==="practice")checkCurrent();else move(1)})});
    document.querySelectorAll("[data-action]").forEach(button=>button.addEventListener("click",()=>{const action=button.dataset.action;if(action==="quick-reveal"){captureWritten(q);quickRevealed=true;render()}if(action==="quick-known")gradeQuick("known");if(action==="quick-review")gradeQuick("review");if(action==="check")checkCurrent();if(action==="reveal")revealCurrent();if(action==="hide-feedback"){hiddenFeedback.add(q.id);render()}if(action==="show-feedback"){hiddenFeedback.delete(q.id);render()}if(action==="clear"){delete state.drafts[q.id];save();render()}if(action==="open-grammar-card")openGrammarCard(q);if(action==="ai-check")checkAiAnswer(q)}));
  }
  function openGrammarCard(q){if(!q.grammarCard)return;if(!confirm(`要在新視窗開啟「${q.grammarCard}」的文法卡嗎？`))return;const popup=window.open(`japanese_grammar_flashcards.html?grammar=${encodeURIComponent(q.grammarCard)}&side=back`,`grammar-card-${encodeURIComponent(q.grammarCard)}`,"popup=yes,width=900,height=760,resizable=yes,scrollbars=yes");if(!popup)showToast("瀏覽器封鎖了彈出視窗；請允許此網站開啟彈出視窗後再試。")}
  async function checkAiAnswer(q){
    captureWritten(q);
    if(!aiEligible(q)||!isAnswered(q)){showToast("請先完成本題所有空格。");return}
    const key=aiKey(q);if(aiRequests.has(key))return;
    aiRequests.add(key);aiUi.set(key,{status:"loading"});render();
    try{const ai=window.TeacherFinalReviewAI;if(!ai?.checkWrittenAnswer)throw new Error("AI unavailable");const result=await ai.checkWrittenAnswer(q,answerValues(q).slice(),normalize);aiUi.set(key,{status:"result",result})}
    catch(_){aiUi.set(key,{status:"error"})}
    finally{aiRequests.delete(key);render()}
  }
  function checkCurrent(){const q=session[position];captureWritten(q);if(!isAnswered(q)){showToast("請先完成本題所有空格／選項。");return}const ok=grade(q),old=state.results[q.id];state.results[q.id]={status:ok?"correct":"incorrect",attempts:(old?.attempts||0)+1,answeredAt:new Date().toISOString()};hiddenFeedback.delete(q.id);save();render()}
  function revealCurrent(){const q=session[position];captureWritten(q);const old=state.results[q.id];state.results[q.id]={status:"reviewed",attempts:old?.attempts||0,revealed:true};hiddenFeedback.delete(q.id);save();render()}
  function gradeQuick(value){const q=session[position];state.quick[q.id]=value;save();quickRevealed=false;move(1)}
  function move(delta){const q=session[position];captureWritten(q);position=(position+delta+session.length)%session.length;quickRevealed=false;render()}
  function jump(raw){const target=Math.max(1,Math.min(session.length,Number(raw)||1));const q=session[position];captureWritten(q);position=target-1;quickRevealed=false;render()}
  function submitExam(){session.forEach(captureIfCurrent);const unanswered=session.filter(q=>!isAnswered(q)).length;if(unanswered&&!confirm(`還有 ${unanswered} 題未作答。確定提交嗎？`))return;const seconds=Math.max(1,Math.round((Date.now()-examStartedAt)/1000)),details=session.map((q,index)=>{const ok=isAnswered(q)&&grade(q);state.results[q.id]={status:ok?"correct":"incorrect",attempts:(state.results[q.id]?.attempts||0)+1,answeredAt:new Date().toISOString()};return{number:index+1,question:q.type==="written"?q.sentenceParts.join("（　）"):q.prompt,selected:selectedLabel(q),correct:answerLabel(q),ok,explanation:q.explanationZh,source:`老師複習紙 p.${q.page} ${sectionLabel(q.section)}${q.printedNo}`}});save();const score=details.filter(x=>x.ok).length;window.QuizHistory?.record({module:"老師期末最後溫習",moduleId:"teacher-final-review",mode:"模擬考試",lesson:"第9–12課",source:"老師期末最後複習",score,total:session.length,details});examFinished=true;renderResults(details,score,seconds)}
  function captureIfCurrent(q){if(session[position]?.id===q.id)captureWritten(q)}
  function renderResults(details,score,seconds){showOnly("results");const percent=Math.round(score/session.length*100);$("scoreText").textContent=`${score} / ${session.length}（${percent}%）`;$("resultSummary").textContent=`完成時間：${Math.floor(seconds/60)}分${seconds%60}秒。${percent>=90?"最後衝刺狀態很好，請再確認錯題。":percent>=70?"整體掌握不錯，建議立即重做錯題。":"建議先用快速溫習逐題看解釋，再重考。"}`;const parts=["particle","grammar"].map(section=>{const rows=details.filter((_,i)=>session[i].section===section),right=rows.filter(x=>x.ok).length;return rows.length?`<div class="mini"><strong>${sectionLabel(section)}</strong><br>${right} / ${rows.length} 正確</div>`:""}).join("");$("breakdown").innerHTML=parts;$("reviewList").innerHTML=details.map((item,index)=>{const q=session[index];return`<article class="review-item ${item.ok?"":"bad"}"><strong>${item.ok?"✓ 正確":"✕ 錯誤"}・${sectionLabel(q.section)} ${q.printedNo}</strong><div class="q" lang="ja">${escapeHtml(item.question)}</div><div>你的答案：<span lang="ja">${escapeHtml(item.selected)}</span></div><div>正確答案：<span lang="ja">${escapeHtml(item.correct)}</span></div><div>完整句子：<span lang="ja">${escapeHtml(fullSentence(q))}</span></div><div>解釋：${escapeHtml(q.explanationZh)}</div><div>中文意思：${escapeHtml(q.meaningZh)}</div></article>`}).join("");$("reviewList").classList.add("hidden");$("toggleReviewButton").textContent="查看逐題結果";$("toggleReviewButton").setAttribute("aria-expanded","false");window.Furigana?.apply($("reviewList"));updateSavedInfo()}
  $("startButton").addEventListener("click",start);$("resetButton").addEventListener("click",()=>{if(confirm("確定只重設「老師期末最後溫習」的所有進度嗎？")){state=fresh();hydrateSettings();save();updateSavedInfo();showToast("此模組進度已重設。")}});$("quitButton").addEventListener("click",()=>{captureWritten(session[position]);if(behavior()==="exam"&&!examFinished&&!confirm("確定離開本次模擬考試嗎？未提交的答案仍會保存。"))return;showOnly("setup");updateSavedInfo()});$("prevButton").addEventListener("click",()=>move(-1));$("nextButton").addEventListener("click",()=>move(1));$("markButton").addEventListener("click",()=>{const q=session[position];state.marked[q.id]=!state.marked[q.id];save();render()});$("jumpButton").addEventListener("click",()=>jump($("jumpInput").value));$("jumpInput").addEventListener("keydown",event=>{if(event.key==="Enter")jump(event.currentTarget.value)});$("rangeInput").addEventListener("input",event=>jump(event.currentTarget.value));$("submitButton").addEventListener("click",submitExam);$("retryButton").addEventListener("click",()=>{showOnly("setup");updateSavedInfo()});$("wrongButton").addEventListener("click",()=>{$("modeSelect").value="wrong";showOnly("setup");persistSettings();updateSavedInfo()});$("toggleReviewButton").addEventListener("click",()=>{const opening=$("reviewList").classList.contains("hidden");$("reviewList").classList.toggle("hidden",!opening);$("toggleReviewButton").textContent=opening?"收起逐題結果":"查看逐題結果";$("toggleReviewButton").setAttribute("aria-expanded",String(opening))});
  hydrateSettings();updateSavedInfo();showOnly("setup");
})();
