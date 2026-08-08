/* Run with: node validate_teacher_final_review.js */
const fs=require("fs"),vm=require("vm"),errors=[];
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync("teacher_final_review_data.js","utf8"),sandbox);
const questions=sandbox.window.TEACHER_FINAL_REVIEW_QUESTIONS||[],ids=questions.map(q=>q.id);
if(questions.length!==22)errors.push(`expected 22 questions, found ${questions.length}`);
if(new Set(ids).size!==ids.length)errors.push("duplicate IDs");
for(const section of ["particle","grammar"]){const expected=section==="particle"?10:12,actual=questions.filter(q=>q.section===section).length;if(actual!==expected)errors.push(`${section}: expected ${expected}, found ${actual}`)}
for(const q of questions){
  if(!q.id||!["particle","grammar"].includes(q.section)||![1,2].includes(q.page)||!q.printedNo)errors.push(`${q.id||"unknown"}: invalid source metadata`);
  if(q.sourceType!=="teacher-final-review"||q.sourceFile!=="Japanese_Final_Exam_Review_Clean.pdf")errors.push(`${q.id}: invalid source identity`);
  if(!q.grammarPoint||!q.explanationZh||!q.meaningZh||!q.hintZh)errors.push(`${q.id}: missing reviewed feedback`);
  if(q.type==="written"){
    if(q.sentenceParts.length!==q.answers.length+1||q.displayAnswer.length!==q.answers.length)errors.push(`${q.id}: blank structure mismatch`);
    q.answers.forEach((accepted,index)=>{if(!accepted.length||!accepted.includes(q.displayAnswer[index]))errors.push(`${q.id}: displayed answer ${index+1} is not accepted`)});
  }else if(q.type==="choice"){
    if(q.choices.length!==4||new Set(q.choices).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push(`${q.id}: invalid choice data`);
    if(!q.completeSentence)errors.push(`${q.id}: missing complete sentence`);
  }else errors.push(`${q.id}: invalid question type`);
  if(q.sourceCertainty==="model-answer"&&q.adaptation!=="controlled-open-prompt")errors.push(`${q.id}: open prompt is not clearly controlled`);
}
const report={total:questions.length,particle:questions.filter(q=>q.section==="particle").length,grammar:questions.filter(q=>q.section==="grammar").length,written:questions.filter(q=>q.type==="written").length,choice:questions.filter(q=>q.type==="choice").length,modelAnswers:questions.filter(q=>q.sourceCertainty==="model-answer").length,missingChinese:questions.filter(q=>!q.meaningZh).length,errors};
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
