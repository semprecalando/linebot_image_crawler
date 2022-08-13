# linebot_image_crawler

## 機能
- Line botに向けて投稿された画像をS3へ保存する
- S3への保存をトリガーとして、画像のサムネイルを作成してS3へ書き戻す

## コマンド例

aws cdkを利用したバックエンド環境修正を行いたいとき
> yarn workspace bakcend cdk "コマンド"