# linebot_image_crawler

## 環境
- Docker
- VSCode (remote-container)
- aws cli (ローカルの認証情報を利用する場合)

## 機能
- Line botに向けて投稿された画像をS3へ保存する
- S3への画像保存をトリガーとして、画像のサムネイルを作成してS3へ書き戻す
- S3への画像保存をトリガーとして、特定ユーザの顔が写っているかどうかを判定してDBへ書き込む（今回は新郎新婦を想定）
- webブラウザで保存された画像一覧を確認でき、特定ユーザの顔画像が写っているかどうかでフィルターできる（今回は新郎新婦を想定）

## ビルド手順
- ローカルの認証情報を利用しない場合、 `./devcontainer/devcontainer.json` のL5を削除する
- Line developerアカウントを作成し、アクセストークンとシークレットを発行する
- VSCodeのremote-containerを利用して、本リポジトリ直下をworkspaceとしたコンテナ環境を起動する（以下、作業は全てコンテナ内で行う）
- `backend` ディレクトリへ移動し、 `cdk.json` の　`lineAccessToken` と `lineAccessSecret` をLine developerアカウントで払い出した値に書き換える
- `backend` ディレクトリで `cdk deploy` コマンドを実行し、バックエンド環境をビルドする (ローカルの認証情報を利用しない場合、事前に `aws configure` コマンドでデプロイ先アカウントの認証情報を登録する)
- Line developerアカウントにおいて、webhookのURLをバックエンド環境のデプロイ結果に書き換える
- `frontend` ディレクトリへ移動し、 `src/settings.ts` と `aws-exports.js` のエンドポイント値をバックエンド環境のデプロイ結果に書き換える
-  `frontend` ディレクトリで `npm run build` コマンドを実行し、SPAをビルドする
- ビルドしたSPAをデプロイする