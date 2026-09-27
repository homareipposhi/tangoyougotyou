# 学習問題集

問題は `subjects/` 以下のJavaScriptファイルだけで追加・編集できます。各ファイルは
`registerQuestionPack({ subject, name, chapters, questions })` で問題パックを登録します。

GitHub Actions が `subjects/**/*.js` を自動検出し、`js/generated-manifest.js` を更新します。
新しい科目や単元を追加する際に、HTMLやアプリ本体を編集する必要はありません。

問題形式は四択 (`choice`) と○× (`tf`) のみです。物理RTA問題では `rta` に
`formula`、`unit`、`symbol`、`term`、`recognition` を指定できます。
物理画面では「二次試験の条件判断」を初期表示します。対象大学の公開問題から
[設問別に抽出した判断](research/physics-extraction-log.md)を独自の短問にしたもので、
過去問そのものの転載ではありません。年度別の抽出状況はログを確認してください。
過去問からの条件判断とは別に、公式・単位・微積の記号・用語の定義は
「基礎RTA」でカテゴリを選んで利用できます。微積物理の記号は `subjects/physics/symbols/`、
公式は `subjects/physics/formulas/`、定義は `subjects/physics/terms/` に分けています。
旧問題は「従来の問題」から利用できます。既存の学習履歴キーと問題IDは変更しません。
公式・記号・定義は過去問の引用ではなく、基本法則と標準的な用語を独自の四択にしたものです。
微分・積分による[速度](https://openstax.org/books/university-physics-volume-1/pages/3-2-instantaneous-velocity-and-speed)・
[仕事](https://openstax.org/books/university-physics-volume-1/pages/7-1-work)・
[電流](https://openstax.org/books/university-physics-volume-2/pages/9-1-electrical-current)・
[放射能](https://openstax.org/books/university-physics-volume-3/pages/10-3-radioactive-decay)などの表記は
OpenStax University Physics も照合しています。
旧帝大7校・旧東工大・神戸大の物理個別試験の公開先は
[過去問索引](research/physics-past-exams.md)に記録しています。

ローカルでの検証:

```text
node scripts/generate-manifest.mjs
node scripts/validate-question-banks.mjs
```
