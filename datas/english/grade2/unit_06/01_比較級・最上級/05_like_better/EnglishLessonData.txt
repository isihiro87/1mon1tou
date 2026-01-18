import { staticFile } from 'remotion';
import { QuizBoard, EnglishLessonBoard, RedText, FormulaContainer, FormulaItem, FormulaText, CenteredList, CrossedText } from './components/english';
import { Scene } from './data';

export type { Scene };

const AUDIO_BASE = 'audio/explain/05_better_part';
// const TOPIC = '比較級最上級';

export const englishLessonData: Scene[] = [
    {
        id: 'scene-5-001',
        durationInFrames: 16,
        audioSrc: staticFile(`${AUDIO_BASE}001.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                imageSrc={staticFile('images/quiz_intro.png')}
                speechBubble="さあ、解けるかな？"
                japaneseText={<>私は冬より夏の方が好きです。</>}
                englishText={<>I (　) summer (　) than winter.</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-002',
        durationInFrames: 65,
        audioSrc: staticFile(`${AUDIO_BASE}002.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                imageSrc={staticFile('images/quiz_intro.png')}
                speechBubble="さあ、解けるかな？"
                japaneseText={<>私は冬より夏の方が好きです。</>}
                englishText={<>I (　) summer (　) than winter.</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-003',
        durationInFrames: 71,
        audioSrc: staticFile(`${AUDIO_BASE}003.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble="まずは型から！"
                japaneseText={<>～のほうが好き</>}
                englishText={<> </>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-004',
        durationInFrames: 58,
        audioSrc: staticFile(`${AUDIO_BASE}004.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble=""
                japaneseText={<>～のほうが好き</>}
                englishText={<> </>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-005',
        durationInFrames: 118,
        audioSrc: staticFile(`${AUDIO_BASE}005.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble=""
                japaneseText={<>～のほうが好き</>}
                englishText={<>like ～ better than ...</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-006',
        durationInFrames: 54,
        audioSrc: staticFile(`${AUDIO_BASE}006.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                japaneseText={<>～のほうが好き</>}
                englishText={<>like ～ better than ...</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-007',
        durationInFrames: 51,
        audioSrc: staticFile(`${AUDIO_BASE}007.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                japaneseText={<>～のほうが好き</>}
                englishText={<>like ～ better than ...</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-008',
        durationInFrames: 52,
        audioSrc: staticFile(`${AUDIO_BASE}008.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble="口に出して言ってみよう！"
                japaneseText={<>～のほうが好き</>}
                englishText={<>like ～ better than ...</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-009',
        durationInFrames: 92,
        audioSrc: staticFile(`${AUDIO_BASE}009.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble=""
                japaneseText={<>なんで better ?<br /> </>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-010',
        durationInFrames: 124,
        audioSrc: staticFile(`${AUDIO_BASE}010.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble=""
                japaneseText={<>なんで better ?<br /><RedText>well</RedText> の比較級だから！</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-011',
        durationInFrames: 132,
        audioSrc: staticFile(`${AUDIO_BASE}011.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble="そのまま訳すと..."
                swapTextOrder={true}
                englishText={<><span style={{ fontSize: '58px' }}>like summer better than winter</span></>}
                japaneseText={<> <br/> </>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-012',
        durationInFrames: 93,
        audioSrc: staticFile(`${AUDIO_BASE}012.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble="そのまま訳すと..."
                swapTextOrder={true}
                englishText={<><span style={{ fontSize: '58px' }}>like summer better than winter</span></>}
                japaneseText={<>夏を冬より良く好む<br/> </>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-013',
        durationInFrames: 72,
        audioSrc: staticFile(`${AUDIO_BASE}013.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble="そのまま訳すと..."
                swapTextOrder={true}
                japaneseText={<>夏を冬より良く好む<br/><RedText>⇒</RedText>夏の方が好き</>}
                englishText={<><span style={{ fontSize: '58px' }}>like summer better than winter</span></>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-014',
        durationInFrames: 84,
        audioSrc: staticFile(`${AUDIO_BASE}014.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                japaneseText={<>good (よい) の比較級も better<br /> </>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-015',
        durationInFrames: 93,
        audioSrc: staticFile(`${AUDIO_BASE}015.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                speechBubble="テストに出るよ！"
                japaneseText={<>good (よい) の比較級も better<br /><RedText>better</RedText> は超重要！</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-016',
        durationInFrames: 96,
        audioSrc: staticFile(`${AUDIO_BASE}016.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                imageSrc={staticFile('images/quiz_intro.png')}
                speechBubble="問題に戻るよ。"
                japaneseText={<><span>私は冬より夏の方が好きです。</span></>}
                englishText={<>I (　) summer (　) than winter.</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-017',
        durationInFrames: 88,
        audioSrc: staticFile(`${AUDIO_BASE}017.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                imageSrc={staticFile('images/quiz_intro.png')}
                japaneseText={<><span>私は冬より夏の方が好きです。</span></>}
                englishText={<>I (　) summer (　) than winter.</>}
            />
        ),
        pauseAfter: 15,
    },
    {
        id: 'scene-5-018',
        durationInFrames: 112,
        audioSrc: staticFile(`${AUDIO_BASE}018.wav`),
        boardContent: () => (
            <EnglishLessonBoard
                step="title"
                layout="standard"
                imageSrc={staticFile('images/quiz_intro.png')}
                speechBubble=""
                japaneseText={<><span>私は冬より夏の方が好きです。</span></>}
                englishText={<><span style={{ fontSize: '55px' }}>I <RedText>like</RedText> summer <RedText>better</RedText> than winter.</span></>}
            />
        ),
        pauseAfter: 15,
    },
];
