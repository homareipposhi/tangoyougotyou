# 学習問題集

問題は `subjects/` 以下のJavaScriptファイルだけで追加・編集できます。各ファイルは
`registerQuestionPack({ subject, name, chapters, questions })` で問題パックを登録します。

GitHub Actions が `subjects/**/*.js` を自動検出し、`js/generated-manifest.js` を更新します。
新しい科目や単元を追加する際に、HTMLやアプリ本体を編集する必要はありません。

問題形式は四択 (`choice`) と○× (`tf`) のみです。物理RTA問題では `rta` に
`formula`、`unit`、`term`、`recognition` を指定できます。
物理画面では「二次試験の条件判断」を初期表示します。これは
[京都大学2025年度](https://www.kyoto-u.ac.jp/ja/admissions/undergrad/past-eq/r7-eq)・
[2026年度](https://www.kyoto-u.ac.jp/ja/admissions/undergrad/past-eq/r8-eq)の公開問題と出題意図を読み、
そこで必要になる判断を独自の短問にしたものです。過去問そのものの転載ではありません。
既存の用語・条件の一問一答は「基礎RTA」、旧問題は「従来の問題」から利用できます。
旧帝大7校・旧東工大・神戸大の物理個別試験の公開先は
[過去問索引](research/physics-past-exams.md)に記録しています。

ローカルでの検証:

```text
node scripts/generate-manifest.mjs
node scripts/validate-question-banks.mjs
```
