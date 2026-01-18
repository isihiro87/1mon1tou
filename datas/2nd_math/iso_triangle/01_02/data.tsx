import React from 'react';
import { staticFile, Img } from 'remotion';

export type Scene = {
  id: string;
  durationInFrames: number;
  audioSrc: string;
  boardContent: () => React.ReactElement;
  overlayText?: string;
  characterComment: string;
  characterCommentColor?: string;
  characterCommentImportant?: boolean;
  characterCommentContinuous?: boolean;
  overlayTextContinuous?: boolean;
  overlayStrokeColor?: string;
  overlayYOffset?: number;
  role?: 'maintitle' | 'subtitle' | 'answer' | 'explanation' | 'transition' | 'question';
  roleGroup?: string;
};

export const GLOBAL_TITLE = '二等辺三角形の性質';

const ImageBoard = ({ src }: { src: string }) => {
  console.log('ImageBoard rendering with src:', src);
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export const mathLessonData: Scene[] = [
  // Line 1: 中2数学
  {
    id: 'scene0',
    durationInFrames: 50,
    audioSrc: staticFile('audio/iso_triangle/00-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/01_02_mixed.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'maintitle',
  },
  // Line 2: 二等辺三角形の超基本を1分でマスター！
  {
    id: 'scene1',
    durationInFrames: 85,
    audioSrc: staticFile('audio/iso_triangle/01-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/01_02_mixed.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'maintitle',
  },
  // Line 3: まず、長さが等しい2つの辺に挟まれた角。
  {
    id: 'scene2',
    durationInFrames: 130,
    audioSrc: staticFile('audio/iso_triangle/02-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/isosceles_property_step1.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'explanation',
  },
  // Line 4: ここを「頂角」って言います。
  {
    id: 'scene3',
    durationInFrames: 80,
    audioSrc: staticFile('audio/iso_triangle/03-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/isosceles_property_step1.png')} />,
    overlayText: '頂角',
    overlayYOffset: -80,
    characterComment: '',
    role: 'explanation',
  },
  // Line 5: そして、底辺の両端にある2つの角。
  {
    id: 'scene4',
    durationInFrames: 115,
    audioSrc: staticFile('audio/iso_triangle/04-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/isosceles_property_step3.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'transition',
  },
  // Line 6: ここを「底角」って言うんだ。
  {
    id: 'scene5',
    durationInFrames: 75,
    audioSrc: staticFile('audio/iso_triangle/05-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/isosceles_property_step3.png')} />,
    overlayText: '底角',
    overlayStrokeColor: '#4B4BFF',
    overlayYOffset: 250,
    characterComment: '',
    role: 'explanation',
  },
  // Line 7: ここで一番大事なポイント！
  {
    id: 'scene6',
    durationInFrames: 75,
    audioSrc: staticFile('audio/iso_triangle/06-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/isosceles_property_step4.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'transition',
  },
  // Line 8: 「2つの底角の大きさは、必ず等しくなる！」
  {
    id: 'scene7',
    durationInFrames: 130,
    audioSrc: staticFile('audio/iso_triangle/07-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/isosceles_property_step4.png')} />,
    overlayText: '',
    characterComment: '2つの底角は\n必ず等しい！',
    characterCommentImportant: true,
    role: 'explanation',
  },
  // Line 9: じゃあ、実際に問題を解いてみよう！
  {
    id: 'scene8',
    durationInFrames: 100,
    audioSrc: staticFile('audio/iso_triangle/08-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/isosceles_property_step4.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'transition',
  },
  // Line 11: 第一問！
  {
    id: 'scene9',
    durationInFrames: 45,
    audioSrc: staticFile('audio/iso_triangle/09-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step0.png')} />,
    overlayText: '第1問！',
    characterComment: '',
    role: 'subtitle',
    roleGroup: '1-1',
  },
  // Line 12: xの角度は？
  {
    id: 'scene10',
    durationInFrames: 60,
    audioSrc: staticFile('audio/iso_triangle/10-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step0.png')} />,
    // overlayTextContinuous: true,
    characterComment: 'xの角度は？',
    role: 'question',
    roleGroup: '1-2',
  },
  // Line 14: 二等辺三角形だから
  {
    id: 'scene11',
    durationInFrames: 75,
    audioSrc: staticFile('audio/iso_triangle/11-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step0.png')} />,
    overlayText: '',
    characterComment: '二等辺三角形',
    role: 'explanation',
  },
  // Line 15: ここの角が65°なら、
  {
    id: 'scene12',
    durationInFrames: 80,
    audioSrc: staticFile('audio/iso_triangle/12-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step4.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'explanation',
  },
  // Line 16: 反対側のここの角も65°にだね。
  {
    id: 'scene13',
    durationInFrames: 100,
    audioSrc: staticFile('audio/iso_triangle/13-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step2.png')} />,
    overlayText: '',
    characterComment: '',
    role: 'explanation',
  },
  // Line 17: 三角形は全部で180°だから、
  {
    id: 'scene14',
    durationInFrames: 100,
    audioSrc: staticFile('audio/iso_triangle/14-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step2.png')} />,
    overlayText: '',
    characterComment: '内角の和 = 180°',
    role: 'explanation',
  },
  // Line 18: そこから65°を2つ引けばOK！
  {
    id: 'scene15',
    durationInFrames: 100,
    audioSrc: staticFile('audio/iso_triangle/15-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step2.png')} />,
    overlayText: '',
    characterComment: '180° - (65°+65°)',
    role: 'explanation',
  },
  // Line 19: 式はこうだね。
  // {
  //   id: 'scene16',
  //   durationInFrames: 55,
  //   audioSrc: staticFile('audio/iso_triangle/16-iso_triangle01_02.wav'),
  //   boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step2.png')} />,
  //   overlayText: '',
  //   characterComment: '',
  //   role: 'explanation',
  // },
  // Line 20: 計算すると、
  {
    id: 'scene17',
    durationInFrames: 50,
    audioSrc: staticFile('audio/iso_triangle/17-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step2.png')} />,
    overlayText: '',
    characterComment: '',
    characterCommentContinuous: true,
    role: 'explanation',
  },
  // Line 21: 答えは 50°！
  {
    id: 'scene18',
    durationInFrames: 55,
    audioSrc: staticFile('audio/iso_triangle/18-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_01_step3.png')} />,
    overlayText: '',
    characterComment: 'x = 50°',
    characterCommentColor: '#FFD93D',
    characterCommentImportant: true,
    role: 'answer',
  },
  // Line 23: 第二問！
  {
    id: 'scene19',
    durationInFrames: 45,
    audioSrc: staticFile('audio/iso_triangle/19-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step0.png')} />,
    overlayText: '第2問！',
    characterComment: '',
    role: 'subtitle',
    roleGroup: '2-1',
  },
  // Line 24: xの角度は？
  {
    id: 'scene20',
    durationInFrames: 65,
    audioSrc: staticFile('audio/iso_triangle/20-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step0.png')} />,
    characterComment: 'xの角度は？',
    role: 'question',
    roleGroup: '2-1',
  },
  // Line 25: てっぺんの頂角が40°だね。
  {
    id: 'scene21',
    durationInFrames: 85,
    audioSrc: staticFile('audio/iso_triangle/21-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step4.png')} />,
    overlayText: '',
    characterComment: '頂角が40°',
    role: 'explanation',
  },
  // Line 26: 180°からてっぺんの40°を引いてみよう。
  {
    id: 'scene22',
    durationInFrames: 95,
    audioSrc: staticFile('audio/iso_triangle/22-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step4.png')} />,
    overlayText: '',
    characterComment: '180° - 40° \n= 140°',
    role: 'explanation',
  },
  // Line 27: この残った140°を、
  {
    id: 'scene23',
    durationInFrames: 75,
    audioSrc: staticFile('audio/iso_triangle/23-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step4.png')} />,
    overlayText: '',
    characterComment: '残り140°',
    role: 'explanation',
  },
  // Line 28: 2つの底角で仲良く半分こすればいいね！
  {
    id: 'scene24',
    durationInFrames: 110,
    audioSrc: staticFile('audio/iso_triangle/24-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step2.png')} />,
    overlayText: '',
    characterComment: '140° ÷ 2',
    role: 'explanation',
  },
  // Line 29: 答えは70°！
  {
    id: 'scene25',
    durationInFrames: 60,
    audioSrc: staticFile('audio/iso_triangle/25-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step2.png')} />,
    overlayText: '',
    characterComment: 'x = 70°',
    characterCommentImportant: true,
    role: 'answer',
  },
  // Line 30: できたかな？
  {
    id: 'scene26',
    durationInFrames: 45,
    audioSrc: staticFile('audio/iso_triangle/26-iso_triangle01_02.wav'),
    boardContent: () => <ImageBoard src={staticFile('images/iso_triangle/prob_02_step2.png')} />,
    overlayText: '',
    characterComment: 'できたかな？',
    role: 'transition',
  },
];
