(function(){
  "use strict";
  const source={sourceType:"teacher-final-review",sourceFile:"Japanese_Final_Exam_Review_Clean.pdf"};
  const written=(id,section,printedNo,page,sentenceParts,answers,displayAnswer,grammarPoint,explanationZh,meaningZh,options={})=>({
    ...source,id,section,printedNo,page,type:"written",sentenceParts,
    answers:answers.map(values=>Array.isArray(values)?values:[values]),displayAnswer:Array.isArray(displayAnswer)?displayAnswer:[displayAnswer],
    grammarPoint,explanationZh,meaningZh,hintZh:options.hintZh||"請留意空格前後的助詞、接續及句子意思。",sourceCertainty:options.sourceCertainty||"certain",adaptation:options.adaptation||"exact"
  });
  const choice=(id,section,printedNo,page,prompt,choices,answer,completeSentence,grammarPoint,explanationZh,meaningZh,options={})=>({
    ...source,id,section,printedNo,page,type:"choice",prompt,choices,answer,completeSentence,grammarPoint,explanationZh,meaningZh,
    hintZh:options.hintZh||"先確認文法接續，再判斷整句意思。",sourceCertainty:options.sourceCertainty||"certain",adaptation:options.adaptation||"controlled"
  });

  window.TEACHER_FINAL_REVIEW_QUESTIONS=[
    written("teacher-review-p01","particle","1",1,["コロナの影響で、私の勤めている会社の株価","上がった。"],[["が"]],["が"],"自動詞「上がる」的主語用「が」","「株価が上がる」中，升高的是股價，所以用主格助詞「が」。", "受新冠疫情影響，我任職公司的股價上升了。"),
    written("teacher-review-p02","particle","2",1,["かばんをそこ","置いたら邪魔になります。"],[["に"]],["に"],"存在或放置的目的地用「に」","「置く」表示把東西放到某處，放置的目的地「そこ」後用「に」。","把手提包放在那裡會造成阻礙。"),
    written("teacher-review-p03","particle","3",1,["まだスイッチ","入れないでください。"],[["を"]],["を"],"「スイッチを入れる」","「スイッチを入れる」是固定搭配，開關是動作的受詞，所以用「を」。","請先不要開啟開關。"),
    written("teacher-review-p04","particle","4",1,["そろそろ食事","行きましょうか。"],[["に"]],["に"],"目的「Nに行く」","移動的目的用「Nに行く」，因此是「食事に行く」。","差不多去吃飯，好嗎？"),
    written("teacher-review-p05","particle","5",1,["このタクシーがあのパン屋","過ぎた辺りで止めてください。"],[["を"]],["を"],"通過地點「場所を過ぎる」","「過ぎる」表示經過某地點時，經過的地方用「を」。","請在這輛的士駛過那間麵包店附近時停車。"),
    written("teacher-review-p06","particle","6",1,["会議の時間","変わった。2時から3時","変わった。"],[["が"],["に"]],["が","に"],"Nが変わる／NからNに変わる","「会議の時間が変わる」中時間是主語；變更後的時間用「に」，所以是「2時から3時に」。","會議時間改了，由兩點改為三點。"),
    written("teacher-review-p07","particle","7",1,["すみません、そこに落ちているペン","拾っていただけますか。"],[["を"]],["を"],"「Nを拾う」","被撿起的筆是「拾う」的受詞，所以用「を」。","不好意思，可以請您撿起掉在那裡的筆嗎？"),
    written("teacher-review-p08","particle","8",1,["何かわからないことがあったら、私","聞いてください。"],[["に"]],["に"],"詢問對象「人に聞く」","向某人詢問用「人に聞く」，因此是「私に聞いてください」。","如果有不明白的地方，請問我。"),
    written("teacher-review-p09","particle","9",1,["何かわからないことがあったら、友達","話し合ってください。"],[["と"]],["と"],"共同對象「人と話し合う」","與某人商量或討論用「人と話し合う」。","如果有不明白的地方，請與朋友商量。"),
    written("teacher-review-p10","particle","10",1,["何かわからないことがあったら、グループ","話し合ってください。"],[["で"]],["で"],"參與範圍「グループで話し合う」","表示在一個小組內共同討論時，用「グループで話し合う」。","如果有不明白的地方，請在小組內討論。"),

    choice("teacher-review-g01","grammar","1",1,"「原稿は今日出さなければなりませんか。」と同じ意味の文はどれですか。",["原稿は今日提出する必要がありますか。","原稿は今日提出してはいけませんか。","原稿はもう提出しましたか。","原稿は提出しなくてもいいですか。"],0,"原稿は今日出さなければなりませんか。","～なければならない","「Vなければならない」表示必須做某事；疑問句是在確認今天是否必須交稿。","稿件必須今天交嗎？",{adaptation:"meaning-check"}),
    written("teacher-review-g02","grammar","2",1,["A：原稿は今日出さなければなりませんか。\nB：明日","も構いませんよ。"],[["出して","だして"]],["出して"],"Vても構わない","「明日出しても構いません」表示明天提交也可以；空格後已印有「も構いません」。","A：稿件必須今天交嗎？ B：明天交也沒問題。",{adaptation:"controlled",hintZh:"空格後已有「も構いません」，請填入「出す」的て形。"}),
    choice("teacher-review-g03","grammar","3",1,"「＿＿ほど＿＿はない」の形として正しい文はどれですか。",["健康ほど大切なものはない。","健康より大切なものほどない。","健康ほど大切なものがある。","健康は大切ほどものはない。"],0,"健康ほど大切なものはない。","～ほど～はない","「Nほど～はない」表示沒有比N更……的事物。原題是開放式造句，因此本題使用符合相同句型的受控例句。","沒有比健康更重要的東西。",{sourceCertainty:"model-answer",adaptation:"controlled-open-prompt"}),
    choice("teacher-review-g04","grammar","4",1,"「＿＿のは＿＿ためだ」の形として正しい文はどれですか。",["電車が止まったのは、大雪が降ったためだ。","電車が止まったためは、大雪が降ったのだ。","電車が止まるのは、大雪を降ったためだ。","電車の止まったは、大雪がためだ。"],0,"電車が止まったのは、大雪が降ったためだ。","～のは～ためだ","結果或事情用「～のは」提出，再以「～ためだ」說明原因。原題是開放式造句，因此採用受控例句。","電車停駛是因為下大雪。",{sourceCertainty:"model-answer",adaptation:"controlled-open-prompt"}),
    written("teacher-review-g05","grammar","5",1,["A：あれ？Bさん、出張の予定が変わったんですか。\nB：そうなんです。聞いてくださいよ！私が行くはずだったのに、","んです！"],[["Cさんが行くことになった","Ｃさんが行くことになった","Cさんが行くことになったん","Ｃさんが行くことになったん"]],["Cさんが行くことになった"],"～はずだったのに／～ことになった","原本預定由自己出差，用「行くはずだった」；後來改由C先生去，用「Cさんが行くことになった」。原題容許不同人名，本模組採用C先生作受控答案。","A：咦？B先生，出差安排改了嗎？ B：是啊！原本應該由我去，結果改成由C先生去了！",{sourceCertainty:"model-answer",adaptation:"controlled-open-prompt",hintZh:"後句要表達安排改為由另一個人出差；空格後已有「んです」。"}),
    written("teacher-review-g06","grammar","6",1,["私の子どもはいつも服を脱いだら、","っぱなしだ。"],[["脱ぎ","ぬぎ"]],["脱ぎ"],"Vます形＋っぱなし","「脱ぐ」的ます形是「脱ぎます」，去掉「ます」後接「っぱなし」，所以填「脱ぎ」。","我的孩子總是脫下衣服後便一直放著不處理。",{hintZh:"「脱ぐ」要先變成ます形詞幹；空格後已有「っぱなし」。"}),
    choice("teacher-review-g07","grammar","7",1,"きのうライオンに（　）夢を見た。怖かった。",["追いかけられる","追いかける","追いかけさせる","追いかけて"],0,"きのうライオンに追いかけられる夢を見た。怖かった。","受身形＋名詞","夢的內容是「被獅子追」，所以用被動形「追いかけられる」修飾「夢」。","昨天做了一個被獅子追趕的夢，很可怕。",{sourceCertainty:"model-answer",adaptation:"controlled-open-prompt"}),
    written("teacher-review-g08","grammar","8",2,["A：何時ごろお","ですか。\nB：8時ごろ戻ります。"],[["戻り","もどり"]],["戻り"],"お＋Vます形＋です","「戻ります」去掉「ます」得到「戻り」，構成尊敬表達「お戻りですか」。","A：您大約幾點回來？ B：大約八點回來。",{hintZh:"空格前已有「お」，後面已有「ですか」；請填「戻る」的ます形詞幹。"}),
    written("teacher-review-g09","grammar","9",2,["私は掃除は毎日","より、週末にまとめて","ほうが効率がいいと思っている。"],[["する"],["する"]],["する","する"],"VるよりVるほうが","比較兩種做法時，兩邊都使用動詞辭書形：「毎日するより、週末にまとめてするほうが」。","我認為與其每天打掃，不如在週末集中打掃更有效率。"),
    choice("teacher-review-g10","grammar","10",2,"会話の空欄に最も自然な文を入れてください。\nA：今度お宅に遊びに行ってもいい？\nB：あ、あ、すみません。家は…。\nA：あ、ごめんね。そうだよね。\nB：いえ、あの、（　　　　　）ものですから…。",["部屋が散らかっている","部屋を片づけた","ぜひ来てほしい","家に誰もいないでした"],0,"いえ、あの、部屋が散らかっているものですから…。","～ものですから","「ものですから」用來婉轉說明個人理由。原題是開放式會話，本題以「房間很亂」作自然、受控的示範答案。","不，那個……因為房間很亂……。",{sourceCertainty:"model-answer",adaptation:"controlled-open-prompt"}),
    written("teacher-review-g11","grammar","11",2,["A：私は2年前に日本語能力試験N1に","います。\nB：そうですか。N1って、すごいですね。"],[["合格して","ごうかくして"]],["合格して"],"Vている（經歷／結果狀態）","「合格する」的て形是「合格して」，接題目外的「います」成為「合格しています」。","A：我兩年前通過了日語能力試驗N1。 B：是嗎？N1很厲害呢。",{hintZh:"空格後已有「います」，請填「合格する」的て形。"}),
    choice("teacher-review-g12","grammar","12",2,"「＿＿た結果、＿＿がわかった」の形として正しい文はどれですか。",["何度も実験した結果、原因がわかった。","何度も実験する結果、原因をわかった。","何度も実験した結果で、原因にわかった。","何度も実験して結果、原因はわかるだった。"],0,"何度も実験した結果、原因がわかった。","Vた結果、～がわかった","「結果」前使用動詞た形；「分かる」所理解的內容通常以「が」標示。原題是開放式造句，因此採用受控例句。","經過多次實驗，終於知道了原因。",{sourceCertainty:"model-answer",adaptation:"controlled-open-prompt"})
  ];
})();
