# 学習問題集

問題は `subjects/` 以下のJavaScriptファイルだけで追加・編集できます。各ファイルは
`registerQuestionPack({ subject, name, chapters, questions })` で問題パックを登録します。

GitHub Actions が `subjects/**/*.js` を自動検出し、`js/generated-manifest.js` を更新します。
新しい科目や単元を追加する際に、HTMLやアプリ本体を編集する必要はありません。

問題形式は四択 (`choice`) と○× (`tf`) のみです。物理RTA問題では `rta` に
`formula`、`unit`、`term`、`recognition` を指定できます。
物理画面ではRTA暗記を初期表示し、用語・条件判断を各分野から選べます。
従来の問題は同じ画面の「従来の問題」から利用できます。

ローカルでの検証:

```text
node scripts/generate-manifest.mjs
node scripts/validate-question-banks.mjs
```
