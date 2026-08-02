/* Run with: node validate_classroom_data.js */
const fs=require('fs'),vm=require('vm');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync('classroom_exercise_data.js','utf8'),context);
const questions=context.window.CLASSROOM_QUIZ_QUESTIONS;
const conversations=context.window.CLASSROOM_CONVERSATION_ITEMS;
const prompts=context.window.CLASSROOM_WRITING_PROMPTS;
const vocabulary=context.window.CLASSROOM_VOCABULARY_ITEMS;
const errors=[];
const all=[...questions,...conversations,...prompts,...vocabulary];
const ids=all.map(x=>x.id);
if(new Set(ids).size!==ids.length)errors.push('duplicate IDs');
for(const q of questions){
  if(![9,10,11,12].includes(q.lesson))errors.push(`${q.id}: invalid lesson`);
  if(q.source!=='課堂練習')errors.push(`${q.id}: invalid source`);
  if(!q.category||!q.question||!q.explanation||!q.sourceNote||!q.meaningZh)errors.push(`${q.id}: missing required field`);
  if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices).size!==4)errors.push(`${q.id}: choices must be four unique values`);
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push(`${q.id}: invalid answer index`);
}
for(const x of conversations){if(!x.cue||!x.answer||!x.zh||!x.note||!x.tokens?.length)errors.push(`${x.id}: incomplete conversation`)}
for(const p of prompts){if(!p.prompt||!p.instructionZh||!p.hints?.length||!p.model)errors.push(`${p.id}: incomplete writing prompt`)}
for(const v of vocabulary){if(!v.word||!v.read_src||!v.meaning||!v.sourceNote)errors.push(`${v.id}: incomplete vocabulary item`)}
const existingVocabText=fs.readFileSync('japanese_flashcards_69.html','utf8');
const existingWords=[...existingVocabText.matchAll(/"word":\s*"([^"]+)"/g)].map(m=>m[1]);
const vocabularyDuplicates=vocabulary.filter(v=>existingWords.includes(v.word)).map(v=>v.word);
if(vocabularyDuplicates.length)errors.push(`vocabulary duplicates: ${vocabularyDuplicates.join(', ')}`);
function loadDataset(file,name){const sandbox={};vm.createContext(sandbox);vm.runInContext(`${fs.readFileSync(file,'utf8')};globalThis.RESULT=${name}`,sandbox);return sandbox.RESULT}
const particles=loadDataset('grammar_particle_written_data.js','PARTICLE_WRITTEN_QUESTIONS');
const verbs=loadDataset('grammar_verb_written_data.js','VERB_CONJUGATION_WRITTEN_QUESTIONS');
for(const [label,list] of [['particle',particles],['verb',verbs]]){const itemIds=list.map(x=>x.id);if(new Set(itemIds).size!==itemIds.length)errors.push(`${label}: duplicate IDs`)}
const writtenSandbox={};vm.createContext(writtenSandbox);vm.runInContext(`${fs.readFileSync('grammar_particle_written_data.js','utf8')}\n${fs.readFileSync('grammar_verb_written_data.js','utf8')}\n${fs.readFileSync('grammar_written_translations.js','utf8')}\nglobalThis.RESULT=WRITTEN_SENTENCE_ZH`,writtenSandbox);
const writtenTranslations=writtenSandbox.RESULT;
for(const q of [...particles,...verbs])if(!writtenTranslations[q.id]?.trim())errors.push(`${q.id}: missing Chinese meaning`);
const quizHtml=fs.readFileSync('japanese_final_quiz.html','utf8');
const quizMeaningMatch=quizHtml.match(/const CORE_QUIZ_MEANINGS_ZH=(\[[\s\S]*?\]);/);
const coreQuizMeanings=quizMeaningMatch?JSON.parse(quizMeaningMatch[1]):[];
if(coreQuizMeanings.length!==88||coreQuizMeanings.some(x=>!x.trim()))errors.push(`grammar quiz: expected 88 Chinese meanings, found ${coreQuizMeanings.filter(Boolean).length}`);
const byLesson=list=>Object.fromEntries([9,10,11,12].map(l=>[l,list.filter(x=>x.lesson===l).length]));
const report={questions:questions.length,questionsByLesson:byLesson(questions),grammarQuizCoreMeanings:coreQuizMeanings.length,answerPositions:[0,1,2,3].map(i=>questions.filter(q=>q.answer===i).length),conversations:conversations.length,conversationsByLesson:byLesson(conversations),writingPrompts:prompts.length,writingPromptsByLesson:byLesson(prompts),vocabulary:vocabulary.length,vocabularyByLesson:byLesson(vocabulary),vocabularyDuplicates,particleQuestions:particles.length,particleMeanings:particles.filter(x=>writtenTranslations[x.id]).length,particleClassroom:particles.filter(x=>x.sourceType==='classroom-exercise').length,verbQuestions:verbs.length,verbMeanings:verbs.filter(x=>writtenTranslations[x.id]).length,verbClassroom:verbs.filter(x=>x.sourceType==='classroom-exercise').length,errors};
console.log(JSON.stringify(report,null,2));
if(errors.length)process.exitCode=1;
