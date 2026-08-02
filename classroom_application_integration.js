(function(){
  const allItems=[...ITEMS];
  state.dataset=['應用練習','課堂練習','全部'].includes(state.dataset)?state.dataset:'應用練習';
  function applyDataset(){
    ITEMS.splice(0,ITEMS.length,...allItems.filter(x=>state.dataset==='全部'||x.dataset===state.dataset));
  }
  const baseRenderNav=renderNav;
  renderNav=function(){
    baseRenderNav();
    $('datasets').innerHTML=['應用練習','課堂練習','全部'].map(d=>`<button class="chip ${state.dataset===d?'active':''}" onclick="setDataset('${d}')">${d}</button>`).join('');
  };
  window.setDataset=function(dataset){
    state.dataset=dataset;state.index=0;state.selected=false;state.cardFlipped=false;applyDataset();
    if(state.tab==='cards')resetCardOrder();if(state.tab==='quiz')startQuiz();if(state.tab==='builder')startBuilder();render();
  };
  const baseDialogHTML=dialogHTML;
  dialogHTML=function(){
    if(state.dataset==='應用練習')return baseDialogHTML();
    const classroom=allItems.filter(x=>x.session===Number(state.session)&&x.dataset==='課堂練習');
    const extra=classroom.map(x=>`<article class="exercise"><h2>${x.title}</h2><div class="line"><div class="speaker">情境：</div><div class="jp" lang="ja">${x.cue}</div></div><div class="line"><div class="speaker">自分：</div><div class="jp"><span class="highlight" onclick="showDetail('${x.id}')">${shown(x)}</span></div></div></article>`).join('');
    return `<section class="panel"><div class="badge">第${Number(state.session)+8}課 · ${state.dataset}</div>${state.dataset==='全部'?baseDialogHTML().replace(/^<section class="panel">|<\/section>$/g,''):''}${extra}</section>`;
  };
  const baseNextQuiz=nextQuiz;
  nextQuiz=function(){
    if(state.qIndex!==state.quiz.length-1)return baseNextQuiz();
    const list=state.quiz,score=list.filter(x=>state.quizResults[x.id]?.ok).length;
    QuizHistory.record({module:'會話應用練習',moduleId:'application-practice',mode:'選擇題',lesson:`第${Number(state.session)+8}課`,dataset:state.dataset,score,total:list.length,details:list.map((x,i)=>({number:i+1,question:x.cue,selected:state.quizResults[x.id]?.selected||'未作答',correct:shown(x),ok:Boolean(state.quizResults[x.id]?.ok),explanation:x.note,dataset:x.dataset}))});
    alert('測驗紀錄已保存。');startQuiz();render();
  };
  applyDataset();render();
})();
