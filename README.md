# 中学生向け期末テスト副教科学習アプリ

このアプリは、中学生が期末テスト等で暗記などを行う際に手助けとなるようにJSONファイルから学習内容と問題を読み込み、問題をシャッフルして解くことができるウェブ暗記用アプリである。

## できること

- 科目ごとの学習内容表示
- 問題のシャッフルと出題
- 正解/不正解判定
- 解説の表示
- GitHub Pages での公開対応

## JSONの置き場所

このアプリは、JSONファイルをスマホのブラウザに保存して使うことができる。

- 画面の「JSONファイルを選択」を押す
- 端末内の JSON ファイルを選ぶ
- 選んだ内容はブラウザの localStorage に保存される
- 次回開いたときにも自動で読み込まれる

Github Pages、サーバーに保存することなくローカルで安全に勉強することができる設計になっている。

## JSONの作成方法

### 1. JSONを作る

ブラウザの「JSONファイルを選択」から、端末内に保存してあるJSONファイルを選ぶ。

そのため、[data/study-data.json](data/study-data.json) を直接開くことは基本的に不要です。

### 2. 章を増やす

```json
{
  "id": "english",
  "title": "英語",
  "summary": "基本表現と単語を覚える",
  "studyContent": [
    {
      "heading": "英語の基本",
      "text": "ここに学習内容を入れる"
    }
  ]
}
```

### 3. 問題を増やす

```json
{
  "id": 9,
  "moduleId": "english",
  "question": "次の文の意味として正しいものはどれ？",
  "options": ["A", "B", "C", "D"],
  "answerIndex": 1,
  "explanation": "ここに解説を入れる"
}
```

## JSONの構造の意味

- title: アプリの全体タイトル
- modules: 学習する科目の一覧
- module.id: 科目の識別ID
- module.title: 科目名
- module.summary: 科目の簡単な説明
- module.studyContent: その科目の学習内容
- questions: 問題一覧
- question.moduleId: どの科目の問題か
- question.answerIndex: 正解の選択肢番号（0始まり）

## GitHub Pages での公開手順　※Admin Only

1. このフォルダを GitHub のリポジトリに push する
2. GitHub のリポジトリで Settings → Pages を開く
3. Source を "Deploy from a branch" にする
4. Branch で main を選択する
5. 保存するとURLが発行される
6. そのURLをスマホで開いて、JSONファイルを選択して保存する

## ローカルでの動作確認　※Admin Only

```bash
python -m http.server 8000
```

ブラウザで以下を開くと動作確認可能。

```text
http://localhost:8000
```

## 補足

- このアプリは静的ファイルだけで動くため、サーバーを必要とせずGithub Pagesでも安定に動作するように設計されている。
- JSON はブラウザの localStorage に保存されるため、スマホでも固定のサーバーURLに依存しません。ただし、localStorage をクリーンアップするとデータが消えてしまう可能性がある。
- もし科目を増やしたい場合は、`modules` と `questions` の両方を同じ `moduleId` で揃えて追加すると動きます。
- 参考として、JSONの雛形は端末に保存しておく形式が前提です。`data/study-data.json` をブラウザで開く方法は推奨しません。
