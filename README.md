# linebot_image_crawler

## これは何
- いろんな人が撮影した画像を集める結婚式用LINE bot
- botに送ってもらった画像をwebでアルバムとして閲覧できる
- 新郎新婦の写っている画像だけを表示できるフィルター機能付き
![スクリーンショット 2022-09-10 11 09 38](https://user-images.githubusercontent.com/8722612/189464896-ddc4b0d3-0657-4c12-b908-fd4c35b23ba7.png)

## 環境
- Docker
- VSCode (remote-container)
- aws cli (ローカルの認証情報を利用する場合)

## 構成
![スクリーンショット 2022-09-10 11 17 06](https://user-images.githubusercontent.com/8722612/189465066-404ee60c-286c-42cf-ab15-d0132d2bb909.png)
- Line botに向けて投稿された画像をS3へ保存する
- S3への画像保存をトリガーとして、画像のサムネイルを作成してS3へ書き戻す
- S3への画像保存をトリガーとして、特定ユーザ（今回は新郎新婦)の顔が写っているかどうかを判定してDBへ書き込む
- webブラウザで保存された画像一覧を確認でき、特定ユーザ（今回は新郎新婦)の顔画像が写っているかどうかでフィルターできる

## ビルド&デプロイ手順
- ローカルの認証情報を利用しない場合、 `./devcontainer/devcontainer.json` のL5を削除する
- LINE developerアカウントを作成し、アクセストークンとシークレットを発行する
- VSCodeのremote-containerを利用して、本リポジトリ直下をworkspaceとしたコンテナ環境を起動する（以下、作業は全てコンテナ内で行う）
- `backend` ディレクトリへ移動し、 `cdk.json` の　`lineAccessToken` と `lineAccessSecret` をLine developerアカウントで払い出した値に書き換える
- `backend` ディレクトリで `cdk deploy` コマンドを実行し、バックエンド環境をビルドする (ローカルの認証情報を利用しない場合、事前に `aws configure` コマンドでデプロイ先アカウントの認証情報を登録する)
- LINE developerアカウントにおいて、webhookのURLをバックエンド環境のデプロイ結果に書き換える
- `frontend` ディレクトリへ移動し、 `src/settings.ts` と `aws-exports.js` のエンドポイント値をバックエンド環境のデプロイ結果に書き換える
-  `frontend` ディレクトリで `npm run build` コマンドを実行し、SPAをビルドする
- ビルドしたSPAをデプロイする
