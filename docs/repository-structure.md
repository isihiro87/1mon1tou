# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

本プロジェクトはシンプルな構成を採用し、段階的に拡張可能な設計とします。

```
oneq-onea/
├── src/                           # Webアプリケーションソース
│   ├── components/                # UIコンポーネント
│   ├── pages/                     # ページコンポーネント
│   ├── stores/                    # Zustand状態管理
│   ├── services/                  # ビジネスロジック
│   ├── hooks/                     # カスタムフック
│   ├── types/                     # 型定義
│   ├── utils/                     # ユーティリティ
│   ├── constants/                 # 定数定義
│   ├── App.tsx                    # ルートコンポーネント
│   ├── main.tsx                   # エントリーポイント
│   └── index.css                  # グローバルスタイル
├── public/                        # 静的ファイル
│   ├── manifest.json              # PWAマニフェスト
│   └── icons/                     # アプリアイコン
├── content/                       # 学習コンテンツ
│   ├── movies/                    # 動画ファイル
│   └── data/                      # コンテンツメタデータ
├── docs/                          # プロジェクトドキュメント
│   └── ideas/                     # アイデア・壁打ちメモ
├── .steering/                     # 作業単位のドキュメント
├── .claude/                       # Claude Code設定
├── tests/                         # テスト
│   ├── unit/                      # ユニットテスト
│   └── e2e/                       # E2Eテスト
├── index.html                     # HTMLエントリーポイント
├── vite.config.ts                 # Vite設定
├── tailwind.config.js             # Tailwind CSS設定
├── tsconfig.json                  # TypeScript設定
├── package.json                   # パッケージ定義
├── CLAUDE.md                      # Claude Code設定
└── README.md                      # プロジェクト概要
```

## ディレクトリ詳細

### src/ (Webアプリケーション)

**役割**: React + Vite による Web/PWA アプリケーション

```
src/
├── components/                    # UIコンポーネント
│   ├── player/                    # プレイヤー関連
│   │   ├── VideoPlayer.tsx        # 動画プレイヤー
│   │   ├── QuestionCard.tsx       # 問題カード
│   │   └── ProgressBar.tsx        # 進捗バー
│   ├── home/                      # ホーム画面関連
│   │   └── StartButton.tsx        # 開始ボタン
│   ├── settings/                  # 設定画面関連
│   │   ├── VideoCountSelector.tsx # 動画本数選択
│   │   └── AutoNextToggle.tsx     # 自動遷移トグル
│   └── common/                    # 共通コンポーネント
│       ├── Button.tsx             # ボタン
│       ├── Card.tsx               # カード
│       └── Loading.tsx            # ローディング
├── pages/                         # ページコンポーネント
│   ├── HomePage.tsx               # ホーム画面
│   ├── PlayerPage.tsx             # 連続学習プレイヤー
│   ├── SettingsPage.tsx           # 設定画面
│   └── ProgressPage.tsx           # 進捗画面（Phase 3〜）
├── stores/                        # Zustand状態管理
│   ├── sessionStore.ts            # セッション状態
│   └── settingsStore.ts           # 設定状態
├── services/                      # ビジネスロジック
│   ├── SessionService.ts          # セッション管理
│   ├── StorageService.ts          # ローカルストレージ
│   └── ContentService.ts          # コンテンツ取得
├── hooks/                         # カスタムフック
│   ├── useSession.ts              # セッション操作
│   ├── usePlayer.ts               # プレイヤー操作
│   └── useSwipe.ts                # スワイプ操作
├── types/                         # 型定義
│   ├── video.ts                   # Video型
│   ├── question.ts                # Question型
│   ├── session.ts                 # Session型
│   └── settings.ts                # Settings型
├── utils/                         # ユーティリティ
│   ├── shuffle.ts                 # シャッフル関数
│   └── formatters.ts              # フォーマット関数
├── constants/                     # 定数定義
│   ├── colors.ts                  # カラー定義
│   └── config.ts                  # アプリ設定
├── App.tsx                        # ルートコンポーネント
├── main.tsx                       # エントリーポイント
└── index.css                      # グローバルスタイル（Tailwind）
```

**命名規則**:
- コンポーネント: PascalCase（例: `VideoPlayer.tsx`）
- フック: camelCase + use接頭辞（例: `useSession.ts`）
- ストア: camelCase + Store接尾辞（例: `sessionStore.ts`）
- サービス: PascalCase + Service接尾辞（例: `SessionService.ts`）
- 型定義: camelCase（例: `video.ts`）

**依存関係**:
- `pages/` → `components/`, `hooks/`, `stores/`
- `components/` → `hooks/`, `stores/`, `utils/`
- `stores/` → `services/`
- `services/` → `types/`, `utils/`

### content/ (学習コンテンツ)

**役割**: 動画ファイルとコンテンツメタデータの管理

```
content/
├── movies/                        # 動画ファイル
│   ├── history/                   # 歴史
│   │   ├── ancient/               # 古代
│   │   │   ├── 001_jomon.mp4      # 縄文時代
│   │   │   ├── 002_yayoi.mp4      # 弥生時代
│   │   │   └── ...
│   │   ├── medieval/              # 中世
│   │   ├── early-modern/          # 近世
│   │   ├── modern/                # 近代
│   │   └── contemporary/          # 現代
│   └── [subject]/                 # 他教科（将来）
└── data/                          # コンテンツメタデータ
    ├── videos.json                # 動画メタデータ
    ├── questions.json             # 問題データ
    └── [subject]/                 # 他教科のデータ（将来）
```

**命名規則**:
- 動画ファイル: `[連番]_[内容].mp4`（例: `001_jomon.mp4`）
- 教科ディレクトリ: kebab-case（例: `history`, `geography`）
- 時代ディレクトリ: kebab-case（例: `ancient`, `medieval`）

**動画ファイル仕様**:
- フォーマット: MP4 (H.264)
- 解像度: 720p推奨（モバイル最適化）
- 長さ: 1-3分推奨

**メタデータ形式（例: videos.json）**:
```json
{
  "videos": [
    {
      "id": "v001",
      "title": "縄文時代の生活",
      "tags": ["ancient", "jomon"],
      "videoUrl": "/content/movies/history/ancient/001_jomon.mp4",
      "durationSeconds": 120,
      "orderIndex": 1
    }
  ]
}
```

**メタデータ形式（例: questions.json）**:
```json
{
  "questions": [
    {
      "id": "q001",
      "videoId": "v001",
      "questionText": "縄文時代の主な住居は何か？",
      "answerText": "竪穴住居",
      "explanation": "地面を掘り下げて柱を立て、屋根をかけた住居",
      "orderIndex": 1
    }
  ]
}
```

### tests/ (テスト)

**役割**: ユニットテストとE2Eテストの管理

```
tests/
├── unit/                          # ユニットテスト
│   ├── services/
│   │   ├── SessionService.test.ts
│   │   └── StorageService.test.ts
│   └── stores/
│       └── sessionStore.test.ts
└── e2e/                           # E2Eテスト（Playwright）
    └── learning-flow.spec.ts
```

---

## ファイル配置規則

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| ページコンポーネント | `src/pages/` | PascalCase + Page | `HomePage.tsx` |
| UIコンポーネント | `src/components/` | PascalCase | `VideoPlayer.tsx` |
| Zustandストア | `src/stores/` | camelCase + Store | `sessionStore.ts` |
| サービスクラス | `src/services/` | PascalCase + Service | `SessionService.ts` |
| カスタムフック | `src/hooks/` | camelCase + use | `useSession.ts` |
| 型定義 | `src/types/` | camelCase | `video.ts` |
| 定数 | `src/constants/` | camelCase | `colors.ts` |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|-----------|--------|---------|-----|
| ユニットテスト | `tests/unit/` | [対象].test.ts | `SessionService.test.ts` |
| E2Eテスト | `tests/e2e/` | [シナリオ].spec.ts | `learning-flow.spec.ts` |

### 設定ファイル

| ファイル種別 | 配置先 | 命名規則 |
|------------|--------|---------|
| TypeScript設定 | プロジェクトルート | `tsconfig.json` |
| Vite設定 | プロジェクトルート | `vite.config.ts` |
| Tailwind設定 | プロジェクトルート | `tailwind.config.js` |
| ESLint設定 | プロジェクトルート | `eslint.config.js` |
| Prettier設定 | プロジェクトルート | `.prettierrc` |

---

## 命名規則

### ディレクトリ名

- **レイヤーディレクトリ**: 複数形、kebab-case
  - 例: `components/`, `services/`, `stores/`
- **機能ディレクトリ**: 単数形、kebab-case
  - 例: `player/`, `home/`, `settings/`

### ファイル名

- **コンポーネント**: PascalCase
  - 例: `VideoPlayer.tsx`, `QuestionCard.tsx`
- **フック**: camelCase + use接頭辞
  - 例: `useSession.ts`, `usePlayer.ts`
- **ストア**: camelCase + Store接尾辞
  - 例: `sessionStore.ts`, `settingsStore.ts`
- **サービス**: PascalCase + Service接尾辞
  - 例: `SessionService.ts`, `StorageService.ts`
- **ユーティリティ**: camelCase
  - 例: `shuffle.ts`, `formatters.ts`
- **定数**: camelCase
  - 例: `colors.ts`, `config.ts`
- **型定義**: camelCase
  - 例: `video.ts`, `question.ts`

### テストファイル名

- パターン: `[テスト対象].test.ts` または `[シナリオ].spec.ts`
- 例: `SessionService.test.ts`, `learning-flow.spec.ts`

---

## 依存関係のルール

### レイヤー間の依存

```
┌─────────────────────────────────────────────┐
│  Presentation (pages/, components/)         │
│         ↓                                   │
│  Application (stores/, hooks/, services/)   │
│         ↓                                   │
│  Infrastructure (services/ - Storage/API)   │
└─────────────────────────────────────────────┘
```

**許可される依存**:
- Presentation → Application → Infrastructure

**禁止される依存**:
- Infrastructure → Application (❌)
- Infrastructure → Presentation (❌)
- Application → Presentation (❌)

### 循環依存の禁止

```typescript
// ❌ 悪い例: 循環依存
// sessionStore.ts
import { usePlayer } from '../hooks/usePlayer';

// usePlayer.ts
import { useSessionStore } from '../stores/sessionStore';

// ✅ 良い例: 依存方向を統一
// usePlayer.ts（フックがストアに依存）
import { useSessionStore } from '../stores/sessionStore';

// sessionStore.ts（ストアは純粋な状態管理のみ）
export const useSessionStore = create<SessionState>(...);
```

---

## スケーリング戦略

### 機能の追加

新しい機能を追加する際の配置方針:

**1. 小規模機能（1-2ファイル）**: 既存ディレクトリに配置
```
src/components/common/
├── Button.tsx
├── Card.tsx
└── Badge.tsx        # 新規追加
```

**2. 中規模機能（3-5ファイル）**: 機能ディレクトリを作成
```
src/components/
├── common/
├── player/
└── progress/        # Phase 3 新規機能ディレクトリ
    ├── ProgressCard.tsx
    ├── WeakBadge.tsx
    └── StatsChart.tsx
```

### ファイルサイズの管理

**ファイル分割の目安**:
- 1ファイル: 300行以下を推奨
- 300-500行: リファクタリングを検討
- 500行以上: 分割を強く推奨

**分割例**:
```typescript
// Before: VideoPlayer.tsx (500行)
// - 動画制御ロジック
// - UI表示
// - ジェスチャー処理

// After: 責務ごとに分割
// VideoPlayer.tsx (150行) - メインコンポーネント
// useVideoControl.ts (100行) - 動画制御フック
// VideoOverlay.tsx (100行) - オーバーレイUI
```

---

## 特殊ディレクトリ

### .steering/ (ステアリングファイル)

**役割**: 特定の開発作業における計画とタスク管理

**構造**:
```
.steering/
└── [YYYYMMDD]-[task-name]/
    ├── requirements.md      # 今回の作業の要求内容
    ├── design.md            # 変更内容の設計
    └── tasklist.md          # タスクリスト
```

**命名規則**: `20250115-add-weak-detection` 形式

### .claude/ (Claude Code設定)

**役割**: Claude Codeのカスタマイズと設定

**構造**:
```
.claude/
├── commands/                # スラッシュコマンド
├── skills/                  # タスクモード別スキル
└── agents/                  # サブエージェント定義
```

### docs/ (ドキュメント)

**配置ドキュメント**:
- `product-requirements.md`: プロダクト要求定義書
- `functional-design.md`: 機能設計書
- `architecture.md`: アーキテクチャ設計書
- `repository-structure.md`: リポジトリ構造定義書（本ドキュメント）
- `development-guidelines.md`: 開発ガイドライン
- `glossary.md`: 用語集
- `ideas/`: アイデア・壁打ちメモ

---

## 除外設定

### .gitignore

```gitignore
# 依存関係
node_modules/

# ビルド成果物
dist/
*.tsbuildinfo

# 環境設定
.env
.env.local
.env.*.local

# ログ
*.log
npm-debug.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# テスト
coverage/

# キャッシュ
.cache/
```

### .prettierignore / .eslintignore

```
node_modules/
dist/
coverage/
*.json
*.md
public/
content/movies/
```

---

## Phase 3以降の拡張構造

Phase 3でバックエンドAPIを追加する際の構造:

```
oneq-onea/
├── src/                           # Webアプリ（既存）
├── api/                           # バックエンドAPI（Phase 3追加）
│   ├── src/
│   │   ├── routes/
│   │   ├── handlers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── db/
│   │   └── index.ts
│   ├── wrangler.toml
│   └── package.json
├── content/                       # 学習コンテンツ（既存）
├── docs/                          # ドキュメント（既存）
└── package.json                   # ルート（workspaces追加）
```

この時点でモノレポ構成に移行し、npm workspacesを使用します。
