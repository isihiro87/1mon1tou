---
description: slide_contentからenglishData.tsxを作成する詳細フロー
---

# slide_contentからenglishData.tsxを作成するフロー

このワークフローは、`slide_content*.md`（Markdownの表形式データ）を読み込み、Remotion用のデータファイル`englishData*.tsx`に変換する手順を定義します。

## 1. 前提条件の確認

変換を実行する前に、入力ファイルが正しい形式であることを確認してください。

1.  **ファイルの場所**: `datas/english/grade2/unit_06/01_比較級・最上級/` ディレクトリ内に `slide_content*.md` が存在すること。
2.  **ファイル形式**: Markdownファイルで、以下の4列を持つ表が含まれていること。
    -   `行No`
    -   `読み上げ原稿`
    -   `スライドテキスト`
    -   `画像・演出指示`
3.  **記述ルール**:
    -   **スライドテキスト**:
        -   HTMLタグ（`<br>`, `<span style="...">`）が使用可能。
        -   前回と同じ内容を表示する場合は `（維持）` と記述する。
        -   `（維持）` の後に追記がある場合は `（維持）<br>追記内容` のように記述する。
    -   **読み上げ原稿**:
        -   「問題！」で始まる行はクイズ形式（`QuizBoard`）として扱われる。

## 2. 変換スクリプトの実行

Pythonスクリプトを使用して変換を行います。

1.  ターミナルを開く。
2.  以下のコマンドを実行する。

```bash
python datas/english/scripts/convert_slide_to_data.py --input_file "datas/english/grade2/unit_06/01_比較級・最上級/slide_content3.md" --topic "比較級・最上級" --output_dir "src" --output_file "EnglishLessonData.tsx"
npx prettier --write "src/EnglishLessonData.tsx"
npx tsc --noEmit
```

// turbo
python datas/english/scripts/convert_slide_to_data.py --input_file "datas/english/grade2/unit_06/01_比較級・最上級/slide_content3.md" --topic "比較級・最上級" --output_dir "src" --output_file "EnglishLessonData.tsx"; npx prettier --write "src/EnglishLessonData.tsx"; npx tsc --noEmit

## 3. 生成物の確認（自動チェック）

スクリプト実行後、以下の点を確認してください。

1.  **ファイルの生成**: 同じディレクトリに `englishData*.tsx` が生成されていること。
2.  **コンソール出力**: エラーメッセージが表示されていないこと。

## 4. 生成物の確認（詳細チェック）

生成された `englishData*.tsx` を開き、以下の変換が正しく行われているか確認してください。

### 4.1. コンポーネントの選択
-   **QuizBoard**: `読み上げ原稿` に「問題」が含まれるシーン（通常は最初のシーン）は `<QuizBoard ... />` になっているか。
    -   `japaneseText` と `englishText` が正しく分離されているか。
-   **EnglishLessonBoard**: それ以外のシーンは `<EnglishLessonBoard ... />` になっているか。

### 4.2. テキスト処理
-   **HTMLタグの変換**:
    -   `<br>` -> `<br />`
    -   `<span style="color:red">` -> `<span style={{ color: '#E91E63' }}>` (または指定された色)
    -   その他の `style` 属性がJSX形式（`{{ ... }}`）に変換されているか。
-   **（維持）の処理**:
    -   `（維持）` と書かれた箇所が、前回のシーンのテキスト内容に置き換わっているか。
    -   行ごとの `（維持）` が正しく機能し、重複が発生していないか。
-   **余白の追加**:
    -   各文の先頭と末尾に全角スペース（`　`）が追加されているか。
-   **字幕（explanation）**:
    -   `explanation={""}` となり、字幕が表示されないようになっているか。

### 4.3. 画像パス
-   **画像・演出指示** に基づき、適切な画像パスが設定されているか（現状はプレースホルダー `placeholder.png` または `illustration.png` が主）。

## 5. トラブルシューティング

-   **エラーが出る場合**:
    -   Markdownの表が崩れていないか確認する（`|` の数など）。
    -   `convert_slide_to_data.py` の `base_dir` パスが正しいか確認する。
-   **変換結果がおかしい場合**:
    -   `（維持）` の使い方が正しいか確認する。
    -   HTMLタグの閉じ忘れがないか確認する。

---
このフローに従って作業を行うことで、再現性の高いデータ作成が可能になります。
