import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Question, AnswerResult } from '../../types';
import { ChoiceButton, type ChoiceButtonState } from './ChoiceButton';
import { Button } from '../common/Button';

interface QuestionCardProps {
  question: Question;
  onAnswer: (result: AnswerResult) => void;
  autoNext?: boolean;
}

type QuestionState = 'selecting' | 'answered';

// 正誤フィードバックを表示する時間（ms）
const AUTO_NEXT_DELAY_MS = 1200;

// Fisher-Yatesアルゴリズムでシャッフル
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function QuestionCard({ question, onAnswer, autoNext = true }: QuestionCardProps) {
  const [state, setState] = useState<QuestionState>('selecting');
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // 選択肢をシャッフル（question.idが変わったときに再シャッフル）
  // wrongAnswersが存在しない場合は空配列をフォールバック
  const choices = useMemo(() => {
    const wrongAnswers = question.wrongAnswers ?? [];
    const allChoices = [question.correctAnswer, ...wrongAnswers];
    return shuffleArray(allChoices);
  }, [question.id, question.correctAnswer, question.wrongAnswers]);

  // 問題が変わったときに状態をリセット
  useEffect(() => {
    setState('selecting');
    setSelectedAnswer(null);
    setIsCorrect(false);
  }, [question.id]);

  // 選択肢の状態を判定
  const getChoiceState = useCallback(
    (choice: string): ChoiceButtonState => {
      if (state === 'selecting') {
        return 'default';
      }

      // answered 状態
      if (choice === question.correctAnswer) {
        return 'correct';
      }
      if (choice === selectedAnswer) {
        return 'incorrect';
      }
      return 'unselected';
    },
    [state, question.correctAnswer, selectedAnswer]
  );

  // 選択肢をタップしたときの処理
  const handleChoice = useCallback(
    (choice: string) => {
      if (state !== 'selecting') return;

      const correct = choice === question.correctAnswer;
      setSelectedAnswer(choice);
      setIsCorrect(correct);
      setState('answered');

      // 正誤を親に通知（自動遷移の場合は少し遅延）
      if (autoNext) {
        setTimeout(() => {
          onAnswer(correct ? 'correct' : 'incorrect');
        }, AUTO_NEXT_DELAY_MS);
      }
    },
    [state, question.correctAnswer, onAnswer, autoNext]
  );

  // 手動で次へ進む
  const handleNext = useCallback(() => {
    onAnswer(isCorrect ? 'correct' : 'incorrect');
  }, [onAnswer, isCorrect]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* 問題エリア */}
      <div className="flex-1 min-h-0 flex flex-col p-4 overflow-y-auto">
        {/* 問題文 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-base text-gray-900 leading-relaxed">
            {question.questionText}
          </p>
        </div>

        {/* 選択肢 */}
        <div className="flex flex-col gap-3 mb-4">
          {choices.map((choice, index) => (
            <ChoiceButton
              key={`${question.id}-${index}`}
              label={choice}
              state={getChoiceState(choice)}
              onClick={() => handleChoice(choice)}
            />
          ))}
        </div>

        {/* 回答後のフィードバックと次へボタン */}
        {state === 'answered' && (
          <div className="flex flex-col gap-3">
            {/* 正誤フィードバック */}
            <div
              className={`p-4 rounded-xl ${
                isCorrect
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {isCorrect ? (
                  <>
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-bold text-green-800">正解!</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-bold text-red-800">不正解</span>
                  </>
                )}
              </div>
              {!isCorrect && (
                <p className="text-sm text-gray-700">
                  正解: <span className="font-medium">{question.correctAnswer}</span>
                </p>
              )}
              {question.explanation && (
                <p className="text-sm text-gray-600 mt-2">{question.explanation}</p>
              )}
            </div>

            {/* 手動遷移の場合のみ「次へ」ボタンを表示 */}
            {!autoNext && (
              <Button variant="primary" size="lg" onClick={handleNext} className="w-full">
                次へ
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
