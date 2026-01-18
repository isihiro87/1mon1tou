# slide_content.md 作成ルール

`slide_content.md` ファイルを作成・更新する際は、以下のルールに従ってください。

## 1. ファイル形式
- **ファイル名**: `slide_content[数字].md`（`video_content[数字].md` と対応）。
- **フォーマット**: Markdown のテーブル形式。

## 2. テーブル構造
以下のカラムを持つテーブルを作成する。

| 行No | 読み上げ原稿 | スライドテキスト | 画像・演出指示 |
| :--- | :--- | :--- | :--- |
| 1 | 第1問！ | （維持） | タイトル表示 |
| 2 | 「このバッグは...」 | A is ...er than B | 比較級の基本形を表示 |

## 3. 記述ルール
- **行No**: `video_content.md` の読み上げ原稿の行順（空行は除く）。
- **読み上げ原稿**: `video_content.md` からそのまま転記する。
- **スライドテキスト**: そのタイミングで画面に表示する文字。
  - **問題導入時**: 「第〇問！」のタイミングで、問題文（英文と和訳）を必ず表示する。
  - **代名詞の回避**: `one` などの代名詞は中学生には分かりにくいため、`bag` などの具体的な名詞を繰り返して表示する（例: `that one` -> `that bag`）。
  - 前の行から変更がない場合は `（維持）` と記述する。
  - 新しく表示するテキストがある場合は、その内容を記述する。
  - 重要な語句は `**太字**` や `<span style="color:red">赤字</span>` で強調する。
- **画像・演出指示**:
  - イラストの表示タイミングや、特定箇所の強調（矢印、枠囲みなど）を指示する。
  - `video_content.md` の「必要な画像」セクションを参照する。

## 4. 出力コード例 (EnglishLessonData.tsx)
`slide_content.md` から `EnglishLessonData.tsx` を生成する際は、以下のコード構造に従ってください。

```tsx
import { staticFile } from 'remotion';
import { QuizBoard, EnglishLessonBoard, RedText, FormulaContainer, FormulaItem, FormulaText, CenteredList, CrossedText } from './components/english';
import { Scene } from './data';

export type { Scene };

const AUDIO_BASE = 'audio/compare/long_explanation_part';
// const TOPIC = '比較級・最上級 (変化のルール)';

export const englishLessonData: Scene[] = [
    // More Lesson Scenes
    // Scene 1: Question Intro
    {
        id: 'scene-more-001',
        durationInFrames: 150,
        audioSrc: staticFile(`${AUDIO_BASE}001.wav`), // Placeholder audio
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                japaneseText="この本はあの本よりも面白いです。"
                englishText={
                    <>
                        This book is (　) (　) than that book.
                    </>
                }
                imageSrc={staticFile('images/quiz_intro.png')} // Placeholder
                speechBubble="カッコに入る単語は分かるかな？"
            />
        ),
        characterComment: "",
        pauseAfter: 15,
    },
    // Scene 2: "interesting" is long
    {
        id: 'scene-more-002',
        durationInFrames: 200,
        audioSrc: staticFile(`${AUDIO_BASE}002.wav`), // Placeholder audio
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                japaneseText="この本はあの本よりも面白いです。"
                englishText={
                    <>
                        This book is ( <RedText>interesting</RedText> ) ... than that book.
                    </>
                }
                words={['interesting']}
                bottomComment={<>長い！</>}
                speechBubble="「面白い」は interesting だよね。"
                imageSrc={staticFile('images/quiz_intro.png')} // Placeholder
            />
        ),
        characterComment: "",
        pauseAfter: 15,
    },
    // Scene 3: "er" crossed out
    {
        id: 'scene-more-003',
        durationInFrames: 200,
        audioSrc: staticFile(`${AUDIO_BASE}003.wav`), // Placeholder audio
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                japaneseText="この本はあの本よりも面白いです。"
                englishText={
                    <>
                        This book is ( <RedText>interesting</RedText> ) ... than that book.
                    </>
                }
                formula={
                    <FormulaContainer>
                        <FormulaItem>interesting</FormulaItem>
                        <FormulaText>+</FormulaText>
                        <FormulaItem variant="pink"><CrossedText>er</CrossedText></FormulaItem>
                    </FormulaContainer>
                }
                bottomComment={<>言いにくい...</>}
                speechBubble="interesting-er なんて噛んじゃうよね？"
                imageSrc={staticFile('images/quiz_intro.png')} // Placeholder
            />
        ),
        characterComment: "",
        pauseAfter: 15,
    },
    // Scene 4: "more" rule introduction
    {
        id: 'scene-more-004',
        durationInFrames: 200,
        audioSrc: staticFile(`${AUDIO_BASE}004.wav`), // Placeholder audio
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                sentences={[
                    <CenteredList>
                        more + interesting<br />
                        more + beautiful<br />
                        more + popular
                    </CenteredList>
                ]}
                explanation="長い単語は more を使う！"
                imageSrc={staticFile('images/cool_style.png')} // Placeholder
            />
        ),
        characterComment: "",
        pauseAfter: 15,
    },
    // Scene 5: Answer Reveal
    {
        id: 'scene-more-005',
        durationInFrames: 150,
        audioSrc: staticFile(`${AUDIO_BASE}005.wav`), // Placeholder audio
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                japaneseText="この本はあの本よりも面白いです。"
                englishText={
                    <>
                        This book is <RedText>more interesting</RedText> than that book.
                    </>
                }
                imageSrc={staticFile('images/cool_style.png')} // Placeholder
                speechBubble="more interesting にするよ。"
            />
        ),
        characterComment: "",
        pauseAfter: 15,
    },
    // Scene 6: Conclusion
    {
        id: 'scene-more-006',
        durationInFrames: 150,
        audioSrc: staticFile(`${AUDIO_BASE}006.wav`), // Placeholder audio
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                japaneseText="この本はあの本よりも面白いです。"
                englishText={
                    <>
                        This book is <RedText>more interesting</RedText> than that book.
                    </>
                }
                bottomComment="これでバッチリ！"
                speechBubble="これでバッチリ！"
            />
        ),
        characterComment: "",
        pauseAfter: 15,
    },
];
```
