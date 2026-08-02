(function(){
  const KEY="jp_quiz_history_v1",MAX_RECORDS=200;
  function read(){try{const value=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(value)?value:[]}catch(_){return []}}
  function write(records){localStorage.setItem(KEY,JSON.stringify(records.slice(0,MAX_RECORDS)))}
  function cleanText(value){return String(value??"").replace(/<[^>]*>/g,"").trim()}
  function record(input){if(!input||!Number.isFinite(Number(input.total))||Number(input.total)<=0)return null;const total=Number(input.total),score=Math.max(0,Math.min(total,Number(input.score)||0));const entry={id:`attempt-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,completedAt:new Date().toISOString(),module:cleanText(input.module)||"日語練習",moduleId:cleanText(input.moduleId)||"unknown",mode:cleanText(input.mode)||"測驗",lesson:cleanText(input.lesson)||"全部",source:cleanText(input.source),dataset:cleanText(input.dataset),score,total,percent:Math.round(score/total*100),details:Array.isArray(input.details)?input.details.slice(0,250).map((item,index)=>({number:Number(item.number)||index+1,question:cleanText(item.question),selected:cleanText(item.selected),correct:cleanText(item.correct),ok:Boolean(item.ok),explanation:cleanText(item.explanation),source:cleanText(item.source),dataset:cleanText(item.dataset)})):[]};const records=read();records.unshift(entry);write(records);return entry}
  function remove(id){write(read().filter(item=>item.id!==id))}function clear(){localStorage.removeItem(KEY)}window.QuizHistory={key:KEY,read,record,remove,clear};
})();
