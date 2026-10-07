# Google Driveの履歴保存：初回設定

GitHub Pagesの公開先を維持したまま、Google Identity Servicesでユーザーが許可したDriveのアプリ専用領域へ学習履歴を保存する。APIキー・クライアントシークレット・サーバーは不要。アプリには公開可能なOAuthクライアントIDを設定する。

## Google側の設定

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成または選択する。
2. APIライブラリで **Google Drive API** を有効にする。
3. Google Auth Platformでアプリ名、連絡先、対象ユーザーを設定する。テスト段階では利用する自分のGoogleアカウントをテストユーザーに追加する。
4. OAuthクライアントを作成し、種類を **ウェブアプリケーション** にする。
5. 承認済みJavaScript生成元に `https://homareipposhi.github.io` を登録する。`/tangoyougotyou/` などのパスは付けない。
6. スコープは `https://www.googleapis.com/auth/drive.appdata` を使う。Drive全体の閲覧権限は要求しない。
7. 発行された `…apps.googleusercontent.com` の **クライアントID** を、学習アプリのホームにある入力欄へ入れる。クライアントシークレットは入力も公開もしない。

管理者がクライアントIDを `js/app.js` の `DRIVE_CLIENT_ID` に設定すれば、端末ごとの入力は不要になる。クライアントIDは公開するための識別子であり、秘密鍵ではない。

## 利用方法

- ホームの **Googleに接続** を押してアカウントを選び、アプリ専用領域への保存を許可する。
- Driveに履歴があれば読み込む。なければ端末の現在の履歴で専用ファイルを作成する。
- 接続中は回答後に自動保存する。通信失敗時の履歴は端末に保持し、**今すぐ保存** で再試行できる。
- 次回の起動時とアクセス許可の期限切れ後は、もう一度 **Googleに接続** を押す。Googleのブラウザ用トークン方式では、常時・無操作の再認証は行えない。
- 別の端末では、同じクライアントID・Googleアカウントで接続する。接続を済ませてから学習を始める。
- アプリ専用領域のファイルは通常のDrive一覧には表示されない。Google Drive側のアプリ管理から削除できる。
- 同時に複数端末で学習する運用には対応しない。保存前にDriveが別の端末で変更された場合は、自動上書きを停止する。ごく短い同時書き込みの競合を排他的に防ぐサーバーはないため、端末を切り替える際は保存完了を確認する。
- 端末とDriveの双方に未保存の変更がある場合は、端末の記録を保持して停止する。**Driveの履歴を使う** を選ぶと、確認後にDriveの記録を採用する。置き換える前の端末記録は `multi-study-before-drive-restore-v1` に退避する。

アクセストークンはメモリ内だけに置き、localStorageやGitHubには保存しない。端末に保存するのは履歴、公開クライアントID、未同期状態と最後の保存内容。

## 検証状況

読み込み・新規作成・更新・保存中の回答追加・通信失敗・期限切れ・別端末の変更・不正な履歴・未同期状態の再起動は、模擬APIによる回帰テストで検証する。Google側のクライアントIDが未設定のため、実アカウントでのOAuth接続とDrive APIへの保存はまだ実施していない。

## 公式資料

- [クライアントIDの作成](https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid)
- [ブラウザのトークンモデル](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Driveのアプリ専用データ](https://developers.google.com/workspace/drive/api/guides/appdata)
- [ファイルのアップロード](https://developers.google.com/workspace/drive/api/guides/manage-uploads)
