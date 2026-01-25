# 開発ガイドライン (Development Guidelines)

## コーディング規約

### 命名規則

#### 変数・関数

**TypeScript**:
```typescript
// 変数: camelCase、名詞または名詞句
const userSettings = getSettings();
const questionStats = await fetchStats();
const sessionContents = generateSession(config);

// 関数: camelCase、動詞で始める
function calculateAccuracy(stats: QuestionStats): number { }
function fetchWeakQuestions(): Promise<Question[]> { }
async function updateProgress(index: number): Promise<void> { }

// Boolean: is, has, should, can で始める
const isWeak = stats.accuracyPercent < threshold;
const hasNextContent = currentIndex < contents.length - 1;
const shouldAutoPlay = settings.autoNextVideo;
const canResume = lastSession !== null;

// 定数: UPPER_SNAKE_CASE
const DEFAULT_VIDEOS_PER_SESSION = 5;
const WEAK_THRESHOLD_PERCENT = 70;
const MAX_RETRY_COUNT = 3;
```

#### クラス・インターフェース

```typescript
// クラス: PascalCase、名詞 + 役割接尾辞
class RangeContentService { }
class StorageService { }

// インターフェース: PascalCase
interface RangeFolder { }
interface VerticalVideo { }
interface UserSettings { }

// 型エイリアス: PascalCase
type OrderMode = 'sequential' | 'random' | 'smart';
type FeedbackType = 'perfect' | 'unsure' | 'bad';
```

#### React コンポーネント

```typescript
// コンポーネント: PascalCase
function VideoPlayer({ video, onComplete }: VideoPlayerProps) { }
function QuestionCard({ question, onAnswer }: QuestionCardProps) { }
function StartButton({ onPress }: StartButtonProps) { }

// Props型: コンポーネント名 + Props
interface VideoPlayerProps {
  video: Video;
  onComplete: () => void;
}

// フック: use + 名詞/動詞
function useSession() { }
function usePlayer() { }
function useSwipe() { }
```

#### Zustand ストア

```typescript
// ストア: camelCase + Store
const useSessionStore = create<SessionState>(...);
const useSettingsStore = create<SettingsState>(...);

// State型: 名詞 + State
interface SessionState {
  currentSession: SessionContent[] | null;
  isLoading: boolean;
  error: Error | null;
  // アクション
  startSession: () => Promise<void>;
  updateProgress: (index: number) => void;
}
```

### コードフォーマット

**インデント**: 2スペース

**行の長さ**: 最大100文字

**Prettier設定** (`.prettierrc`):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### コメント規約

**TSDoc形式**（公開API・複雑なロジック）:
```typescript
/**
 * 学習セッションを生成する
 *
 * @param settings - ユーザー設定
 * @param videos - 利用可能な動画一覧
 * @param questions - 利用可能な問題一覧
 * @returns 生成されたセッションコンテンツ配列
 *
 * @example
 * ```typescript
 * const contents = createSession(settings, videos, questions);
 * ```
 */
function createSession(
  settings: UserSettings,
  videos: Video[],
  questions: Question[]
): SessionContent[] {
  // 実装
}
```

**インラインコメント**:
```typescript
// ✅ 良い例: なぜそうするかを説明
// 苦手問題を先に配置し、残りをランダム化
const sortedQuestions = [...weakQuestions, ...shuffle(normalQuestions)];

// ✅ 良い例: 複雑なロジックを説明
// Fisher-Yatesアルゴリズムでシャッフル（偏りなし）
for (let i = result.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [result[i], result[j]] = [result[j], result[i]];
}

// ❌ 悪い例: コードの内容を繰り返すだけ
// iを1増やす
i++;
```

### エラーハンドリング

**カスタムエラークラス**:
```typescript
// src/utils/errors.ts
export class StorageError extends Error {
  constructor(message: string, public key: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class ContentLoadError extends Error {
  constructor(message: string, public contentType: string) {
    super(message);
    this.name = 'ContentLoadError';
  }
}
```

**エラーハンドリングパターン**:
```typescript
// サービス層
function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    throw new StorageError('設定の保存に失敗しました', STORAGE_KEYS.SETTINGS);
  }
}

// UI層（React）
function SettingsPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      saveSettings(settings);
      setError(null);
    } catch (err) {
      if (err instanceof StorageError) {
        setError('設定を保存できませんでした。ストレージ容量を確認してください。');
      } else {
        setError('予期しないエラーが発生しました。');
      }
    }
  };
}
```

### React 固有の規約

**コンポーネント構造**:
```typescript
// ✅ 良い例: 関数コンポーネント + TypeScript
interface QuestionCardProps {
  question: Question;
  onAnswer: (result: 'correct' | 'incorrect') => void;
}

export function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
  }, []);

  const handleAnswer = useCallback((result: 'correct' | 'incorrect') => {
    onAnswer(result);
  }, [onAnswer]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* コンテンツ */}
    </div>
  );
}
```

**スタイル定義（Tailwind CSS）**:
```typescript
// ✅ 良い例: Tailwind クラスを使用
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  開始
</button>

// ✅ 良い例: 条件付きクラス（clsx使用）
<div className={clsx(
  'p-4 rounded-lg',
  isCorrect ? 'bg-green-100' : 'bg-red-100'
)}>

// ❌ 悪い例: インラインスタイル（パフォーマンス低下）
<div style={{ padding: 16, backgroundColor: '#ffffff' }}>
```

**パフォーマンス最適化**:
```typescript
// ✅ 良い例: useCallbackでコールバックをメモ化
const handlePress = useCallback(() => {
  onPress(item.id);
}, [item.id, onPress]);

// ✅ 良い例: useMemoで計算結果をキャッシュ
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.orderIndex - b.orderIndex);
}, [items]);

// ✅ 良い例: React.memoでコンポーネントをメモ化
const VideoItem = memo(function VideoItem({ video }: { video: Video }) {
  return <div>{video.title}</div>;
});
```

---

## Git運用ルール

### ブランチ戦略（Git Flow簡易版）

```
main (本番環境)
└── develop (開発・統合環境)
    ├── feature/continuous-player   # 新機能開発
    ├── feature/weak-detection      # 新機能開発
    ├── fix/video-playback          # バグ修正
    └── refactor/session-service    # リファクタリング
```

**運用ルール**:
- **main**: 本番リリース済みの安定版。タグでバージョン管理（v1.0.0形式）
- **develop**: 次期リリースに向けた最新コード。CIで自動テスト実施
- **feature/\*、fix/\***: developから分岐し、PRでdevelopへマージ
- **直接コミット禁止**: すべてのブランチでPRレビュー必須
- **マージ方針**: feature→develop は squash merge

### コミットメッセージ規約（Conventional Commits）

**フォーマット**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type一覧**:
| Type | 説明 | 例 |
|------|------|-----|
| feat | 新機能 | `feat(player): 動画プリロード機能を追加` |
| fix | バグ修正 | `fix(session): 中断位置の復元を修正` |
| docs | ドキュメント | `docs: 開発ガイドラインを更新` |
| style | フォーマット | `style: Prettier設定を適用` |
| refactor | リファクタリング | `refactor(store): セッション状態を分離` |
| perf | パフォーマンス改善 | `perf(video): プリロード戦略を最適化` |
| test | テスト | `test(service): RangeContentServiceのテストを追加` |
| build | ビルドシステム | `build: Vite設定を更新` |
| ci | CI/CD | `ci: GitHub Actionsワークフローを追加` |
| chore | その他 | `chore: 依存関係を更新` |

**Scope一覧（本プロジェクト固有）**:
- `player`: 連続学習プレイヤー
- `session`: セッション管理
- `question`: 問題・統計
- `settings`: 設定
- `storage`: ローカルストレージ
- `ui`: 共通UIコンポーネント

**例**:
```
feat(player): 自動遷移機能を実装

動画終了後に自動で問題画面へ遷移する機能を追加しました。

実装内容:
- VideoPlayerにonCompleteコールバックを追加
- settingsStore.autoNextVideoの参照を追加
- 遷移アニメーションを実装

Closes #45
```

### プルリクエストプロセス

**作成前のチェック**:
- [ ] 全てのテストがパス (`npm run test`)
- [ ] Lintエラーがない (`npm run lint`)
- [ ] 型チェックがパス (`npm run typecheck`)
- [ ] 競合が解決されている

**PRテンプレート**:
```markdown
## 変更の種類
- [ ] 新機能 (feat)
- [ ] バグ修正 (fix)
- [ ] リファクタリング (refactor)
- [ ] ドキュメント (docs)

## 変更内容
### 何を変更したか
[簡潔な説明]

### なぜ変更したか
[背景・理由]

### どのように変更したか
- [変更点1]
- [変更点2]

## テスト
- [ ] ユニットテスト追加
- [ ] 手動テスト実施
- [ ] iOS Safari確認
- [ ] Android Chrome確認

## スクリーンショット（UI変更の場合）
| Before | After |
|--------|-------|
| [画像] | [画像] |

## 関連Issue
Closes #[番号]

## レビューポイント
[レビュアーに特に見てほしい点]
```

---

## テスト戦略

### テストの種類とツール

| テスト種別 | ツール | 対象 | カバレッジ目標 |
|-----------|--------|------|---------------|
| ユニットテスト | Vitest | サービス、ユーティリティ、ストア | 80% |
| E2Eテスト | Playwright | ユーザーフロー | 主要フロー100% |

### ユニットテスト

**Given-When-Then パターン**:
```typescript
describe('RangeContentService', () => {
  describe('createVideoListFromFolders', () => {
    it('選択されたフォルダから動画リストを生成する', () => {
      // Given: 準備
      const folders = createMockFolders(10);
      const selectedIds = ['folder1', 'folder2', 'folder3'];
      const orderMode = 'sequential';

      // When: 実行
      const videos = RangeContentService.createVideoListFromFolders(
        folders, selectedIds, orderMode
      );

      // Then: 検証
      expect(videos).toHaveLength(3);
    });

    it('ランダムモードで順番がシャッフルされる', () => {
      // Given
      const folders = createMockFolders(5);
      const selectedIds = folders.map(f => f.id);
      const orderMode = 'random';

      // When
      const videos = RangeContentService.createVideoListFromFolders(
        folders, selectedIds, orderMode
      );

      // Then
      expect(videos).toHaveLength(5);
      // 順番がシャッフルされていることを確認（または同じ順番でないことを確認）
    });
  });
});
```

**モックの使用**:
```typescript
// ストレージのモック
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
  });
});
```

### E2Eテスト（Playwright）

**学習フローのテスト**:
```typescript
// tests/e2e/learning-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('連続学習フロー', () => {
  test('ホームから学習を開始し、問題に回答できる', async ({ page }) => {
    // ホーム画面を開く
    await page.goto('/');
    await expect(page.getByText('連続学習をはじめる')).toBeVisible();

    // 学習を開始
    await page.click('text=連続学習をはじめる');

    // 動画プレイヤーが表示される
    await expect(page.locator('video')).toBeVisible();

    // 動画終了を待機（またはスキップ）
    await page.click('text=次へ');

    // 問題画面が表示される
    await expect(page.getByText('答えを見る')).toBeVisible();

    // 答えを見る
    await page.click('text=答えを見る');

    // 正解ボタンが表示される
    await expect(page.getByText('正解')).toBeVisible();

    // 正解を選択
    await page.click('text=正解');
  });
});
```

### テスト命名規則

**パターン**: 日本語で明確に

```typescript
// ✅ 良い例
it('設定に基づいてセッションを生成する', () => { });
it('動画終了時にonCompleteが呼ばれる', () => { });

// ❌ 悪い例
it('test1', () => { });
it('works', () => { });
```

---

## コードレビュー基準

### レビューポイント

**機能性**:
- [ ] 要件を満たしているか（PRD・機能設計書との整合性）
- [ ] エッジケースが考慮されているか
- [ ] エラーハンドリングが適切か

**可読性**:
- [ ] 命名が明確か（ガイドラインに従っているか）
- [ ] コメントが適切か（なぜを説明しているか）
- [ ] 複雑なロジックが説明されているか

**パフォーマンス**:
- [ ] 不要な再レンダリングがないか（useCallback, useMemo）
- [ ] 重い処理がUIスレッドをブロックしていないか

**セキュリティ**:
- [ ] 入力検証が適切か
- [ ] 機密情報がハードコードされていないか

### レビューコメントの書き方

**優先度の明示**:
```markdown
[必須] セキュリティ: APIキーが直接埋め込まれています。環境変数を使用してください。

[推奨] パフォーマンス: このuseEffectはdepsが空なので、useMemoに変更できます。

[提案] 可読性: この関数名を`calculateWeakScore`に変更すると意図が明確になりそうです。

[質問] この条件分岐の意図を教えてください。
```

---

## 開発環境セットアップ

### 必要なツール

| ツール | バージョン | インストール方法 |
|--------|-----------|-----------------|
| Node.js | v24.11.0 | `nvm install 24` |
| npm | 11.x | Node.jsに付属 |

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone https://github.com/[org]/oneq-onea.git
cd oneq-onea

# 2. 依存関係のインストール
npm install

# 3. 開発サーバーの起動
npm run dev
```

### npm scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

### 推奨 VSCode 拡張機能

- **ESLint**: コードリンティング
- **Prettier**: コードフォーマット
- **TypeScript Importer**: インポート自動補完
- **Tailwind CSS IntelliSense**: Tailwindクラス補完
- **Playwright Test for VSCode**: E2Eテストサポート

### VSCode設定 (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

---

## CI/CD パイプライン

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Pre-commit フック

```bash
# .husky/pre-commit
npm run lint-staged
npm run typecheck
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```
