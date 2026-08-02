/* Run with: node validate_classroom_data.js */
const fs=require('fs'),vm=require('vm');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('classroom_exercise_data.js','utf8'),context);
const questions=context.window.CLASSROOM_QUIZ_QUESTIONS;
const conversations=context.window.CLASSROOM_CONVERSATION_ITEMS;
const prompts=context.window.CLASSROOM_WRITING_PROMPTS;
const errors=[];
const all=[...questions,...conversations,...prompts];
const ids=all.map(x=>x.id);
if(new Set(ids).size!==ids.length)errors.push('duplicate IDs');
for(const q of questions){
  if(![9,10,11,12].includes(q.lesson))errors.push(`${q.id}: invalid lesson`);
  if(q.source!=='課堂練習')errors.push(`${q.id}: invalid source`);
  if(!q.category||!q.question||!q.explanation||!q.sourceNote)errors.push(`${q.id}: missing required field`);
  if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices).size!==4)errors.push(`${q.id}: choices must be four unique values`);
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push(`${q.id}: invalid answer index`);
}
for(const x of conversations){if(!x.cue||!x.answer||!x.zh||!x.note||!x.tokens?.length)errors.push(`${x.id}: incomplete conversation`)}
for(const p of prompts){if(!p.prompt||!p.instructionZh||!p.hints?.length||!p.model)errors.push(`${p.id}: incomplete writing prompt`)}
const byLesson=list=>Object.fromEntries([9,10,11,12].map(l=>[l,list.filter(x=>x.lesson===l).length]));
const report={questions:questions.length,questionsByLesson:byLesson(questions),answerPositions:[0,1,2,3].map(i=>questions.filter(q=>q.answer===i).length),conversations:conversations.length,conversationsByLesson:byLesson(conversations),writingPrompts:prompts.length,writingPromptsByLesson:byLesson(prompts),errors};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
