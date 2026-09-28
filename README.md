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
2026-09-28時点の対象は87校年度です。旧帝大7校と旧東工大／東京科学大学は
2017〜2026年度、神戸大学は2020〜2026年度を収録しました。入手困難な神戸大学
2017〜2019年度は利用者の指示で対象外です。条件判断666問（基礎の短問も含む）、
公式21問、微積記号15問、用語定義20問を収録しています。
過去問からの条件判断とは別に、公式・単位・微積の記号・用語の定義は
「基礎RTA」でカテゴリを選んで利用できます。微積物理の記号は `subjects/physics/symbols/`、
公式は `subjects/physics/formulas/`、定義は `subjects/physics/terms/` に分けています。
旧問題は「従来の問題」から利用できます。既存の学習履歴キーと問題IDは変更しません。
回答時間・評価は回答後だけ表示し、不正解と5秒を超える遅答は復習対象にします。
10秒ちょうどは「要復習」です。結果画面には正解した遅答も表示します。
問題ファイルは並行取得し、manifest順に実行します。取得失敗、30秒の読み込み
タイムアウト、未登録パック、重複IDは画面にエラーを表示し、部分的な問題集では起動しません。
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
node scripts/test-app.mjs
```

GitHub Actionsでも上記の検証を実行します。回帰テストは既存科目・ドイツ語400問、
87校年度の収録、入力形式の廃止、RTAの時間境界、学習履歴の保持、復習出題の重複防止、
パック読み込みエラーと科目自動追加を確認します。テストは実際の利用者のlocalStorageを変更しません。
manifest生成・検証が成功した同じファイル一式をGitHub Pagesに公開します。
Pagesの公開元は「GitHub Actions」です。問題ファイルを追加すると、自動生成後の
manifestがそのまま公開されるため、利用者が追加でmanifestを編集する必要はありません。
公開対象は `index.html`、`css/`、`js/`、`subjects/` のみです。

[公開アプリ](https://homareipposhi.github.io/tangoyougotyou/)
