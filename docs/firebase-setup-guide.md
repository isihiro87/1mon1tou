# Firebase設定ガイド

このドキュメントでは、OneQ-OneAアプリでFirebase Authenticationを使用するための設定手順を説明します。

---

## 目次

1. [Firebaseプロジェクトの作成](#1-firebaseプロジェクトの作成)
2. [Webアプリの登録](#2-webアプリの登録)
3. [Google認証の有効化](#3-google認証の有効化)
4. [環境変数の設定](#4-環境変数の設定)
5. [動作確認](#5-動作確認)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. Firebaseプロジェクトの作成

### 1-1. Firebaseコンソールにアクセス

1. ブラウザで [Firebase Console](https://console.firebase.google.com/) を開く
2. Googleアカウントでログイン（持っていない場合は作成）

### 1-2. 新規プロジェクトを作成

1. 「プロジェクトを追加」ボタンをクリック

2. **プロジェクト名を入力**
   - 例: `oneq-onea`
   - プロジェクトIDは自動生成される（変更も可能）

3. **Google Analyticsの設定**
   - 「このプロジェクトでGoogle Analyticsを有効にする」を**オフ**にする
   - （学習アプリなので分析は不要。後から有効化も可能）

4. 「プロジェクトを作成」をクリック

5. 作成完了まで待機（数十秒）

6. 「続行」をクリックしてダッシュボードへ

---

## 2. Webアプリの登録

### 2-1. アプリを追加

1. プロジェクトのダッシュボード（ホーム画面）で、「アプリを追加」または「</>」（Webアイコン）をクリック

2. **アプリのニックネームを入力**
   - 例: `OneQ-OneA Web`
   - これは管理用の名前で、ユーザーには表示されない

3. **Firebase Hostingの設定**
   - 「このアプリのFirebase Hostingも設定します」は**チェックしない**
   - （今回はVercelやCloudflare Pagesでホスティング予定のため）

4. 「アプリを登録」をクリック

### 2-2. 設定情報をメモ

登録後、以下のような`firebaseConfig`が表示されます。**この値を後で使うのでメモしておいてください**。

```javascript
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
```

各項目の意味:

| 項目 | 説明 |
|------|------|
| `apiKey` | FirebaseプロジェクトのAPIキー |
| `authDomain` | 認証用ドメイン |
| `projectId` | プロジェクトID |
| `storageBucket` | ストレージのバケット名 |
| `messagingSenderId` | メッセージング用ID |
| `appId` | アプリ固有のID |

5. 「コンソールに進む」をクリック

---

## 3. Google認証の有効化

### 3-1. Authenticationを開く

1. 左側のメニューから「構築」セクションを展開
2. 「Authentication」をクリック
3. 「始める」ボタンをクリック

### 3-2. Googleプロバイダを有効化

1. 「ログイン方法」タブが表示される
2. 「ログイン プロバイダ」の一覧から「Google」をクリック

3. **有効にする**
   - 右上のトグルスイッチを**オン**にする

4. **プロジェクトのサポートメール**
   - ドロップダウンから自分のGmailアドレスを選択
   - （ログイン画面に表示される連絡先メール）

5. 「保存」をクリック

### 3-3. 確認

- 「Google」の「ステータス」列が「有効」になっていればOK

---

## 4. 環境変数の設定

### 4-1. .env.localファイルを編集

プロジェクトのルートディレクトリにある `.env.local` ファイルを開き、Step 2でメモした値を設定します。

```bash
# Firebase設定
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

**注意点**:
- 値はクォートで囲まない（`=`の後に直接値を書く）
- 各行の末尾にスペースを入れない
- `.env.local`はGitにコミットされない（`.gitignore`に含まれている）

### 4-2. 設定値の対応表

| firebaseConfigの項目 | 環境変数名 |
|---------------------|-----------|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |

---

## 5. 動作確認

### 5-1. 開発サーバーを起動

```bash
npm run dev
```

### 5-2. ログインページにアクセス

ブラウザで以下のURLにアクセス:
```
http://localhost:5173/login
```

### 5-3. Googleログインをテスト

1. 「Googleでログイン」ボタンをクリック
2. Googleアカウント選択のポップアップが表示される
3. アカウントを選択してログイン
4. ログイン成功後、ホーム画面にリダイレクトされる

### 5-4. 設定画面で確認

1. ホーム画面の「設定」に移動
2. 上部にログインしたユーザーの情報（アバター、名前、メール）が表示される
3. 「ログアウト」ボタンが機能することを確認

---

## 6. トラブルシューティング

### 問題: ポップアップがブロックされる

**症状**: 「ポップアップがブロックされました」というエラーが表示される

**解決策**:
1. ブラウザの設定でポップアップを許可する
2. または、アドレスバー右側のポップアップブロックアイコンをクリックして許可

### 問題: 「Firebase が設定されていません」と表示される

**症状**: ログインページに警告が表示される

**解決策**:
1. `.env.local`ファイルが存在するか確認
2. 環境変数の値が正しく設定されているか確認
3. 開発サーバーを再起動（`Ctrl+C`で停止し、`npm run dev`で再起動）

### 問題: 「auth/unauthorized-domain」エラー

**症状**: ログイン時にドメインエラーが発生する

**解決策**:
1. Firebaseコンソールで「Authentication」→「設定」を開く
2. 「承認済みドメイン」タブを確認
3. `localhost`が含まれていることを確認（通常は自動で追加される）
4. 本番環境では、デプロイ先のドメインを追加する

### 問題: Googleログインのポップアップが真っ白

**症状**: ポップアップは開くが、Googleの画面が表示されない

**解決策**:
1. ブラウザのキャッシュをクリア
2. シークレット/プライベートウィンドウで試す
3. 別のブラウザで試す

### 問題: 本番環境でログインボタンが表示されない

**症状**: ローカルではログインボタンが表示されるが、本番環境（Vercel等）では表示されない

**原因**: 本番環境に Firebase の環境変数が設定されていない

**解説**:
- ログインボタンは `isFirebaseConfigured()` が `true` の場合のみ表示される
- この関数は `VITE_FIREBASE_API_KEY` 等の環境変数をチェックしている
- Vercelにこれらの環境変数が未設定だと、ビルド時に空の値が展開される
- 結果として `isConfigured = false` となり、ログインボタンが非表示になる

**解決策**:
1. 下記「補足: 本番環境へのデプロイ時」の「Vercelの場合（詳細手順）」に従って環境変数を設定
2. **必ず再デプロイを実行**（環境変数はビルド時に展開されるため）

**関連ファイル**:
- `src/config/firebase.ts` - 環境変数の読み込み・設定チェック
- `src/stores/authStore.ts` - `isConfigured` 状態の管理
- `src/components/common/AuthStatusButton.tsx` - ログインボタンの表示条件

---

## 補足: 本番環境へのデプロイ時

### 承認済みドメインの追加

本番環境にデプロイする場合、デプロイ先のドメインをFirebaseに登録する必要があります。

1. Firebaseコンソールで「Authentication」→「設定」
2. 「承認済みドメイン」タブ
3. 「ドメインを追加」をクリック
4. 本番ドメイン（例: `oneq-onea.vercel.app`）を入力して追加

### 環境変数の設定（デプロイ先）

デプロイ先のサービス（Vercel、Cloudflare Pagesなど）でも環境変数を設定する必要があります。

**重要**: 環境変数はビルド時に展開されるため、設定後は**必ず再デプロイ**が必要です。

---

#### Vercelの場合（詳細手順）

##### ステップ1: Vercelダッシュボードにアクセス

1. [Vercel Dashboard](https://vercel.com/) にログイン
2. デプロイしたプロジェクトを選択

##### ステップ2: Environment Variablesを開く

1. プロジェクトページ上部の「**Settings**」タブをクリック
2. 左側メニューから「**Environment Variables**」をクリック

##### ステップ3: 環境変数を追加

以下の6つの変数を追加します:

| Key | Value |
|-----|-------|
| `VITE_FIREBASE_API_KEY` | Firebaseコンソールから取得したapiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebaseコンソールから取得 |
| `VITE_FIREBASE_APP_ID` | Firebaseコンソールから取得 |

**追加手順**:
1. 「Key」フィールドに変数名（例: `VITE_FIREBASE_API_KEY`）を入力
2. 「Value」フィールドに値を入力
3. 「Environment」は**すべてチェック**（Production, Preview, Development）
4. 「Add」ボタンをクリック
5. 上記を6つの変数すべてに対して繰り返す

##### ステップ4: 再デプロイ

環境変数の変更を反映するには再デプロイが必要です:

1. プロジェクトページ上部の「**Deployments**」タブをクリック
2. 最新のデプロイの右側「**...**」メニューをクリック
3. 「**Redeploy**」を選択
4. 「Redeploy」ボタンをクリックして確定

##### ステップ5: 動作確認

再デプロイ完了後:

1. 本番サイトにアクセス
2. ホームページにログインボタン（ユーザーアイコン）が表示されることを確認
3. ログインボタンをクリックし、Googleログインが機能することを確認

---

#### Cloudflare Pagesの場合

1. プロジェクトの「Settings」→「Environment variables」
2. Production/Previewそれぞれに変数を追加
3. 再デプロイを実行

---

## 参考リンク

- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Googleログインの設定](https://firebase.google.com/docs/auth/web/google-signin)
