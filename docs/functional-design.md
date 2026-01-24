# 機能設計書 (Functional Design Document)

## システム構成図

### Phase 1（MVP）構成

```mermaid
graph TB
    User[ユーザー]

    subgraph "フロントエンド (Web/PWA)"
        UI[UIレイヤー]
        State[状態管理]
        Player[動画プレイヤー]
        LocalStore[ローカルストレージ]
    end

    subgraph "コンテンツ配信"
        CDN[動画配信]
        Static[静的コンテンツ]
    end

    User --> UI
    UI --> State
    UI --> Player
    State --> LocalStore
    Player --> CDN
    UI --> Static
```

### Phase 3以降（サーバ連携時）

```mermaid
graph TB
    User[ユーザー]

    subgraph "フロントエンド (Web/PWA)"
        UI[UIレイヤー]
        State[状態管理]
        Player[動画プレイヤー]
        LocalStore[ローカルストレージ]
    end

    subgraph "バックエンド (API)"
        API[APIレイヤー]
        Service[サービスレイヤー]
    end

    subgraph "データストア"
        DB[(データベース)]
        CDN[動画配信]
    end

    User --> UI
    UI --> State
    UI --> Player
    State --> API
    State --> LocalStore
    Player --> CDN
    API --> Service
    Service --> DB
```

## 技術スタック

### Phase 1（MVP）

| 分類 | 技術 | 選定理由 |
|------|------|----------|
| フロントエンド | React + Vite | 高速ビルド、PWA対応、TypeScript統合 |
| 状態管理 | Zustand | 軽量、シンプルなAPI |
| ローカル保存 | localStorage / IndexedDB | 端末内保存、サーバ不要 |
| 動画プレイヤー | HTML5 Video / React Player | 終了検知対応、カスタマイズ可能 |
| スタイリング | Tailwind CSS | ユーティリティファースト、高速開発 |
| ジェスチャー | react-swipeable | スワイプ操作対応 |

### Phase 3以降（サーバ連携時）

| 分類 | 技術 | 選定理由 |
|------|------|----------|
| バックエンドAPI | Node.js + Hono | TypeScript統一、高速、軽量 |
| データベース | PostgreSQL / Cloudflare D1 | リレーショナル、スケーラブル |
| 認証 | Firebase Auth（必要時） | ソーシャルログイン対応 |
| 動画配信 | Cloudflare Stream（必要時） | 低遅延、アダプティブビットレート |

---

## データモデル定義

### Phase 1 データモデル（端末内保存）

#### Video（動画）

```typescript
interface Video {
  id: string;                    // 動画ID
  title: string;                 // 動画タイトル
  tags: string[];                // タグ（時代/テーマ等）
  videoUrl: string;              // 動画URL（ローカル or CDN）
  thumbnailUrl?: string;         // サムネイルURL
  durationSeconds?: number;      // 動画の長さ（秒）
  orderIndex: number;            // 表示順
}
```

#### Question（問題）

```typescript
interface Question {
  id: string;                    // 問題ID
  videoId: string;               // 関連動画ID
  questionText: string;          // 問題文
  answerText: string;            // 正解
  explanation?: string;          // 解説（任意）
  orderIndex: number;            // 動画内での順番
}
```

#### UserSettings（ユーザー設定）

```typescript
interface UserSettings {
  autoPlayNextVideo: boolean;    // 動画終了後に自動で次の動画へ
}

// デフォルト値
const DEFAULT_SETTINGS: UserSettings = {
  autoPlayNextVideo: true,
};
```

**注**: 動画本数は範囲選択画面で直接選択するため、設定から削除。

#### LearningLog（学習ログ）

```typescript
interface LearningLog {
  id: string;                    // ログID
  questionId: string;            // 問題ID
  result: 'correct' | 'incorrect'; // 正誤
  timestamp: number;             // タイムスタンプ（Unix ms）
}
```

#### SessionState（セッション状態）

```typescript
interface SessionState {
  currentIndex: number;          // 現在位置
  contents: SessionContent[];    // コンテンツ一覧
  startedAt: number;             // 開始時刻
}

interface SessionContent {
  type: 'video' | 'question';
  contentId: string;             // Video.id or Question.id
  completed: boolean;
}
```

### Phase 2 追加データモデル

```typescript
// Phase 2: カスタマイズ設定の拡張
interface UserSettingsV2 extends UserSettings {
  videosPerQuestionSet: number;  // N本の動画ごとに問題を出す
  questionsPerVideoSet: number;  // 問題をM問出す
  orderMode: 'sequential' | 'random'; // 出題順
}
```

### Phase 3 追加データモデル

```typescript
// Phase 3: 苦手機能
interface QuestionStats {
  questionId: string;            // 問題ID
  totalAttempts: number;         // 総回答数
  correctAttempts: number;       // 正解数
  lastAnsweredAt: number;        // 最終回答日時
}

interface UserSettingsV3 extends UserSettingsV2 {
  orderMode: 'sequential' | 'random' | 'weak_first';
  weakThresholdPercent: number;  // 苦手判定閾値（%）
}
```

### Phase 4 追加データモデル

```typescript
// Phase 4: テスト範囲
interface RangePreset {
  id: string;                    // プリセットID
  name: string;                  // プリセット名（例: 期末テスト範囲）
  tags: string[];                // 対象タグ（時代/単元）
  createdAt: number;
}
```

---

## 画面遷移図

### Phase 1（MVP）

```mermaid
stateDiagram-v2
    [*] --> Home: アプリ起動

    Home --> ContinuousPlayer: 連続学習をはじめる
    Home --> Settings: 設定

    ContinuousPlayer --> VideoView: 動画コンテンツ
    ContinuousPlayer --> QuestionView: 問題コンテンツ
    VideoView --> QuestionView: 自動遷移/スワイプ
    QuestionView --> VideoView: 自動遷移/スワイプ
    QuestionView --> SessionComplete: セッション完了

    SessionComplete --> Home: ホームへ
    SessionComplete --> ContinuousPlayer: もう1セット

    Settings --> Home: 戻る
```

### Phase 3以降（最終形）

```mermaid
stateDiagram-v2
    [*] --> Home: アプリ起動

    Home --> ContinuousPlayer: 続きから再開
    Home --> ContinuousPlayer: 連続学習をはじめる
    Home --> ContinuousPlayer: 苦手だけ
    Home --> RangeSelect: テスト範囲
    Home --> Settings: 設定
    Home --> Progress: 進捗

    RangeSelect --> ContinuousPlayer: 範囲選択完了

    ContinuousPlayer --> VideoView: 動画コンテンツ
    ContinuousPlayer --> QuestionView: 問題コンテンツ
    VideoView --> QuestionView: 自動遷移/スワイプ
    QuestionView --> VideoView: 自動遷移/スワイプ
    QuestionView --> SessionComplete: セッション完了

    SessionComplete --> Home: ホームへ
    SessionComplete --> ContinuousPlayer: もう1セット

    Settings --> Home: 戻る
    Progress --> Home: 戻る
```

---

## コンポーネント設計

### UIレイヤー

#### ContinuousPlayerScreen（連続学習画面）

**責務**:
- 動画/問題の連続表示
- スワイプ操作の処理
- 自動遷移の制御
- 進捗表示

```typescript
interface ContinuousPlayerScreenProps {
  // セッション情報は内部状態で管理
}

// 内部状態
interface PlayerState {
  currentIndex: number;
  contents: SessionContent[];
  isAutoNext: boolean;
}
```

#### VideoPlayer（動画プレイヤー）

**責務**:
- 動画の再生/一時停止
- 再生完了の検知（必須要件）
- 再生位置の管理

```typescript
interface VideoPlayerProps {
  video: Video;
  onComplete: () => void;  // 終了検知（必須）
}
```

#### QuestionCard（問題カード）

**責務**:
- 問題の表示
- 「答えを見る」→「正解/不正解」フロー

```typescript
interface QuestionCardProps {
  question: Question;
  onAnswer: (result: 'correct' | 'incorrect') => void;
}

// Phase 1 問題UIフロー:
// 1. 問題文を表示
// 2. 「答えを見る」ボタン
// 3. 正解を表示
// 4. 「正解 ○」「不正解 ×」2択ボタン
```

### サービスレイヤー

#### RangeContentService（範囲コンテンツ管理）

**責務**:
- 範囲選択用のフォルダ一覧取得
- 選択されたフォルダから動画リストの生成
- 出題順（順番/ランダム/スマート）の制御

```typescript
class RangeContentService {
  // フォルダ一覧を取得
  static fetchRangeFolders(): Promise<RangeFolder[]>;

  // 選択されたフォルダから動画リストを生成
  static createVideoListFromFolders(
    folders: RangeFolder[],
    selectedIds: string[],
    orderMode: OrderMode
  ): VerticalVideo[];

  // フォルダを章ごとにグルーピング
  static groupFoldersByChapter(folders: RangeFolder[]): Map<string, RangeFolder[]>;
}
```

#### SessionPersistenceService（セッション永続化）

**責務**:
- セッション状態のローカルストレージ保存
- セッション復元

```typescript
interface PersistedSession {
  videos: VerticalVideo[];
  currentIndex: number;
  selectedFolderIds: string[];
  orderMode: OrderMode;
  savedAt: number;
}

class SessionPersistenceService {
  static saveSession(session: PersistedSession): void;
  static loadSession(): PersistedSession | null;
  static clearSession(): void;
}
```

#### StorageService（ストレージ管理）

**責務**:
- ローカルストレージへの保存/読み込み
- データのシリアライズ/デシリアライズ

```typescript
class StorageService {
  // 設定の保存/取得
  saveSettings(settings: UserSettings): void;
  getSettings(): UserSettings;
}
```

#### WeakVideoService（苦手動画管理）

**責務**:
- 苦手動画の判定・取得
- 苦手解除判定（連続N回の非badフィードバックで解除）
- スマート出題順の優先度計算

```typescript
// 苦手解除に必要な連続回数
const WEAK_RESOLUTION_THRESHOLD = 2;

class WeakVideoService {
  // 苦手動画のIDリストを取得（最新記録がbadの動画）
  static getWeakVideoIds(records: LearningRecord[]): string[];

  // 指定動画が苦手かどうか判定
  static isWeakVideo(videoId: string, records: LearningRecord[]): boolean;

  // 苦手解除判定（連続N回のnon-badフィードバックで解除）
  static checkWeakResolution(videoId: string, records: LearningRecord[]): boolean;

  // 苦手から解除された動画IDを取得
  static getResolvedWeakVideoIds(
    previousWeakIds: string[],
    records: LearningRecord[]
  ): string[];

  // スマート順の優先度計算
  static calculatePriority(videoId: string, records: LearningRecord[]): number;

  // 動画リストをスマート順でソート
  static sortBySmartOrder<T extends { id: string }>(
    videos: T[],
    records: LearningRecord[]
  ): T[];
}
```

**苦手解除ロジック**:
1. 過去にfeedback='bad'の記録があること
2. 最新のbad記録以降、連続N回のnon-badフィードバック（null, perfect, unsure）があること
3. 条件を満たすと「苦手から卒業」と判定

#### マイルストーン機能

**責務**:
- 累計視聴本数に基づくマイルストーン達成判定
- セッション完了時のマイルストーン達成表示

```typescript
// マイルストーン定義
const MILESTONES: Milestone[] = [
  { count: 10, label: '10本達成', emoji: '🌟' },
  { count: 25, label: '25本達成', emoji: '⭐' },
  { count: 50, label: '50本達成', emoji: '🏅' },
  { count: 100, label: '100本達成', emoji: '🏆' },
  { count: 200, label: '200本達成', emoji: '👑' },
];

// 達成判定（verticalSessionStore.getSessionStats()内）
const achievedMilestones = MILESTONES.filter(
  (milestone) =>
    totalViewCountAtStart < milestone.count &&
    currentTotalViewCount >= milestone.count
);
```

#### 章完了機能

**責務**:
- セッション内で全動画を視聴した章の検出
- セッション完了時の章完了表示

```typescript
// 章完了判定（verticalSessionStore.getSessionStats()内）
// セッション内の全動画を視聴した章を抽出
const completedChapters: string[] = [];
chapterVideoCount.forEach((count, chapter) => {
  const viewedCount = chapterViewedCount.get(chapter) || 0;
  if (viewedCount >= count) {
    completedChapters.push(chapter);
  }
});
```

---

## UI設計

### ホーム画面（Phase 1）

```
┌─────────────────────────────────┐
│  OneQ-OneA                      │
├─────────────────────────────────┤
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │   ▶️ 連続学習をはじめる    │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│                                 │
│  ┌───────────────────────────┐  │
│  │        ⚙️ 設定             │  │
│  └───────────────────────────┘  │
│                                 │
│                                 │
└─────────────────────────────────┘
```

### 連続学習画面（動画表示時）

```
┌─────────────────────────────────┐
│  ←                      3/15    │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │                           │  │
│  │      🎬 動画プレイヤー     │  │
│  │                           │  │
│  │                           │  │
│  │     advancement ▶️ advancement │  │
│  └───────────────────────────┘  │
│                                 │
│  聖徳太子と冠位十二階          │
│                                 │
│                                 │
├─────────────────────────────────┤
│  ◀️ 前へ    🔄 自動ON    次へ ▶️  │
└─────────────────────────────────┘

← 右スワイプ: 前へ
→ 左スワイプ: 次へ
```

### 連続学習画面（問題表示時）

```
┌─────────────────────────────────┐
│  ←                      4/15    │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  聖徳太子が定めた、       │  │
│  │  役人の位を色で分けた     │  │
│  │  制度は何か？             │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │      答えを見る           │  │
│  └───────────────────────────┘  │
│                                 │
│                                 │
├─────────────────────────────────┤
│  ◀️ 前へ    🔄 自動ON    次へ ▶️  │
└─────────────────────────────────┘
```

### 連続学習画面（正解表示時）

```
┌─────────────────────────────────┐
│  ←                      4/15    │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  聖徳太子が定めた、       │  │
│  │  役人の位を色で分けた     │  │
│  │  制度は何か？             │  │
│  │                           │  │
│  │  ─────────────────────    │  │
│  │  答え: 冠位十二階         │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌─────────┐    ┌─────────┐    │
│  │  ○ 正解  │    │  × 不正解 │    │
│  └─────────┘    └─────────┘    │
│                                 │
├─────────────────────────────────┤
│  ◀️ 前へ    🔄 自動ON    次へ ▶️  │
└─────────────────────────────────┘
```

### 設定画面

```
┌─────────────────────────────────┐
│  ← 設定                         │
├─────────────────────────────────┤
│                                 │
│  ┌───────────────────────────┐  │
│  │ [アバター] ユーザー名     │  │
│  │ email@example.com         │  │
│  │                  ログアウト│  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 学習設定                  │  │
│  │ ─────────────────────     │  │
│  │ 自動再生                  │  │
│  │ 動画終了後に自動で次へ    │  │
│  │               [ON/OFF]    │  │
│  └───────────────────────────┘  │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 💡 復習機能について       │  │
│  │ 動画視聴中に...           │  │
│  └───────────────────────────┘  │
│                                 │
│          OneQ-OneA v0.1.0       │
└─────────────────────────────────┘
```

**注**: 動画本数は範囲選択画面で直接選択するため、設定画面には含まない。

### カラーコーディング

**正誤フィードバック**:
- 正解: 緑（#22C55E）
- 不正解: 赤（#EF4444）

**進捗バー**:
- 完了: 青（#3B82F6）
- 未完了: グレー（#E5E7EB）

---

## ローカルストレージ設計

### ストレージキー

| キー | 型 | 説明 |
|------|-----|------|
| `oneq_settings` | UserSettings | ユーザー設定 |
| `oneq_persisted_session` | PersistedSession | 現在のセッション状態 |
| `oneq_session_history` | SessionHistoryEntry[] | セッション履歴 |

### 保存タイミング

- **設定**: 設定変更時に即時保存
- **セッション状態**: 各動画視聴完了時に保存
- **セッション履歴**: セッション完了時に追記保存

### データ移行設計

Phase 3以降でサーバ保存に移行する際の方針:

```typescript
// ローカルデータをサーバへ移行するインターフェース
interface DataMigration {
  // ローカルの学習ログをサーバへ同期
  syncLearningLogs(logs: LearningLog[]): Promise<void>;

  // ローカルの設定をサーバへ同期
  syncSettings(settings: UserSettings): Promise<void>;
}
```

---

## エラーハンドリング

### エラーの分類

| エラー種別 | 処理 | ユーザーへの表示 |
|-----------|------|-----------------|
| 動画読み込みエラー | スキップ提案 | 「動画を読み込めません。スキップしますか？」 |
| ローカルストレージ容量不足 | 古いログ削除提案 | 「ストレージ容量が不足しています」 |
| コンテンツ未取得 | リロード提案 | 「コンテンツを取得できません。再読み込みしてください」 |

---

## パフォーマンス最適化

- **動画プリロード**: 次の動画を事前にバッファリング
- **問題データのプリロード**: セッション開始時に全問題を取得
- **画像最適化**: サムネイルをWebP形式、適切なサイズにリサイズ
- **コード分割**: ルートベースのコード分割でバンドルサイズ削減

---

## PWA対応

### Phase 1（任意）/ Phase 2以降（推奨）

```javascript
// manifest.json
{
  "name": "OneQ-OneA",
  "short_name": "OneQ",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#3B82F6",
  "background_color": "#FFFFFF",
  "icons": [...]
}
```

**PWA機能**:
- ホーム画面への追加
- スプラッシュスクリーン
- フルスクリーン表示
- （将来）オフライン対応

---

## テスト戦略

### ユニットテスト
- RangeContentService: 動画リスト生成ロジック
- SessionPersistenceService: セッション永続化
- StorageService: 設定の保存/読み込み

### 統合テスト
- 範囲選択→連続学習フロー全体
- 設定変更の反映

### E2Eテスト（実機確認）
- スワイプ感度
- 自動遷移
- 戻る・中断復帰
