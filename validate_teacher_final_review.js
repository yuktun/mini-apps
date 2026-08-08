/* Run with: node validate_teacher_final_review.js */
const fs=require("fs"),vm=require("vm"),errors=[];
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync("teacher_final_review_data.js","utf8"),sandbox);
const questions=sandbox.window.TEACHER_FINAL_REVIEW_QUESTIONS||[],ids=questions.map(q=>q.id);
const flashcardHtml=fs.readFileSync("japanese_grammar_flashcards.html","utf8"),linkedGrammarIds=["teacher-review-g02","teacher-review-g03","teacher-review-g04","teacher-review-g05","teacher-review-g06","teacher-review-g08","teacher-review-g09","teacher-review-g10","teacher-review-g11","teacher-review-g12"];
const expectedModelAnswers={
  "teacher-review-p01":["が"],"teacher-review-p02":["に"],"teacher-review-p03":["を"],"teacher-review-p04":["に"],"teacher-review-p05":["を"],
  "teacher-review-p06":["が","に"],"teacher-review-p07":["を"],"teacher-review-p08":["に"],"teacher-review-p09":["と"],"teacher-review-p10":["で"],
  "teacher-review-g02":["明日で"],"teacher-review-g03":["スポーツのあとに飲むビール","おいしいもの"],
  "teacher-review-g04":["空港が使えなくなった","大雪が降った"],"teacher-review-g05":["ほかの人が行くことになった"],
  "teacher-review-g06":["脱ぎ"],"teacher-review-g07":["追いかけられる"],"teacher-review-g08":["戻り"],
  "teacher-review-g09":["する","する"],"teacher-review-g10":["今ちょっと部屋が片付いていない"],
  "teacher-review-g11":["合格して"],"teacher-review-g12":["調査し","この町の人口が減ってきていること"]
};
const expectedCompletedSentences={
  "teacher-review-g02":"A：原稿は今日出さなければなりませんか。\nB：明日でも構いませんよ。",
  "teacher-review-g03":"スポーツのあとに飲むビールほどおいしいものはない。",
  "teacher-review-g04":"空港が使えなくなったのは、大雪が降ったためだ。",
  "teacher-review-g05":"A：あれ？Bさん、出張の予定が変わったんですか。\nB：そうなんです。聞いてくださいよ！私が行くはずだったのに、ほかの人が行くことになったんです！",
  "teacher-review-g07":"きのうライオンに追いかけられる夢を見た。怖かった。",
  "teacher-review-g10":"A：今度お宅に遊びに行ってもいい？\nB：あ、あ、すみません。家は……。\nA：あ、ごめんね。そうだよね。\nB：いえ、あの、今ちょっと部屋が片付いていないものですから……。",
  "teacher-review-g12":"調査した結果、この町の人口が減ってきていることがわかった。"
};
if(questions.length!==22)errors.push(`expected 22 questions, found ${questions.length}`);
if(new Set(ids).size!==ids.length)errors.push("duplicate IDs");
for(const section of ["particle","grammar"]){const expected=section==="particle"?10:12,actual=questions.filter(q=>q.section===section).length;if(actual!==expected)errors.push(`${section}: expected ${expected}, found ${actual}`)}
for(const q of questions){
  if(!q.id||!["particle","grammar"].includes(q.section)||![1,2].includes(q.page)||!q.printedNo)errors.push(`${q.id||"unknown"}: invalid source metadata`);
  if(q.sourceType!=="teacher-final-review"||q.sourceFile!=="Japanese_Final_Exam_Review_Clean.pdf"||q.answerReferenceFile!=="Japanese_Final_Exam_Review_BEST.pdf")errors.push(`${q.id}: invalid source identity`);
  if(!q.grammarPoint||!q.explanationZh||!q.meaningZh||!q.hintZh)errors.push(`${q.id}: missing reviewed feedback`);
  if(q.type==="written"){
    if(q.sentenceParts.length!==q.answers.length+1||q.displayAnswer.length!==q.answers.length)errors.push(`${q.id}: blank structure mismatch`);
    q.answers.forEach((accepted,index)=>{if(!accepted.length||!accepted.includes(q.displayAnswer[index]))errors.push(`${q.id}: displayed answer ${index+1} is not accepted`)});
  }else if(q.type==="choice"){
    if(q.choices.length!==4||new Set(q.choices).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3)errors.push(`${q.id}: invalid choice data`);
    if(!q.completeSentence)errors.push(`${q.id}: missing complete sentence`);
  }else errors.push(`${q.id}: invalid question type`);
  if(q.sourceCertainty==="model-answer"&&q.adaptation!=="controlled-open-prompt")errors.push(`${q.id}: open prompt is not clearly controlled`);
  if(q.sourceCertainty==="model-answer-reference"&&q.adaptation!=="exact-model-answer")errors.push(`${q.id}: model-answer reference is not exact`);
  if(expectedModelAnswers[q.id]&&JSON.stringify(q.displayAnswer)!==JSON.stringify(expectedModelAnswers[q.id]))errors.push(`${q.id}: does not match model-answer reference`);
  if(expectedCompletedSentences[q.id]&&q.sentenceParts.map((part,index)=>part+(index<q.displayAnswer.length?q.displayAnswer[index]:"")).join("")!==expectedCompletedSentences[q.id])errors.push(`${q.id}: completed sentence does not match model-answer reference`);
  if(q.grammarCard&&!flashcardHtml.includes(`"grammar": "${q.grammarCard}"`))errors.push(`${q.id}: linked grammar card does not exist`);
}
for(const id of linkedGrammarIds){if(!byId(questions,id)?.grammarCard)errors.push(`${id}: missing required grammar-card link`)}
function byId(list,id){return list.find(q=>q.id===id)}
if(!flashcardHtml.includes("deepLinkGrammar=deepLinkParams.get('grammar')"))errors.push("grammar flashcards: grammar deep link is missing");
const report={total:questions.length,particle:questions.filter(q=>q.section==="particle").length,grammar:questions.filter(q=>q.section==="grammar").length,written:questions.filter(q=>q.type==="written").length,choice:questions.filter(q=>q.type==="choice").length,modelAnswers:questions.filter(q=>q.sourceCertainty==="model-answer"||q.sourceCertainty==="model-answer-reference").length,verifiedModelAnswers:Object.keys(expectedModelAnswers).length,linkedGrammarCards:questions.filter(q=>q.grammarCard).length,missingChinese:questions.filter(q=>!q.meaningZh).length,errors};
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
