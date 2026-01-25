import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { ChapterGroup } from '../components/range/ChapterGroup';
import { OrderModeSelector } from '../components/range/OrderModeSelector';
import { useRangeStore } from '../stores/rangeStore';
import { useLearningLogStore } from '../stores/learningLogStore';
import { RangeContentService } from '../services/RangeContentService';
import type { RangeFolder } from '../types';

// 確認ダイアログコンポーネント
function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 mx-4 max-w-sm w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            キャンセル
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RangeSelectPage() {
  const navigate = useNavigate();
  const {
    availableFolders,
    selectedFolderIds,
    orderMode,
    isLoading,
    error,
    loadFolders,
    toggleFolder,
    toggleChapter,
    selectAll,
    deselectAll,
    setOrderMode,
  } = useRangeStore();

  useEffect(() => {
    if (availableFolders.length === 0) {
      loadFolders();
    }
  }, [availableFolders.length, loadFolders]);

  // フォルダを章ごとにグルーピング
  const groupedFolders = useMemo(() => {
    return RangeContentService.groupFoldersByChapter(availableFolders);
  }, [availableFolders]);

  // 章を順番にソート
  const sortedChapters = useMemo(() => {
    return Array.from(groupedFolders.keys()).sort();
  }, [groupedFolders]);

  // 学習ログのrecordsを購読
  const learningRecords = useLearningLogStore((state) => state.records);
  const addRecord = useLearningLogStore((state) => state.addRecord);
  const getWeakVideoIds = useLearningLogStore((state) => state.getWeakVideoIds);
  const getMasteredVideoIds = useLearningLogStore((state) => state.getMasteredVideoIds);
  const clearAllRecords = useLearningLogStore((state) => state.clearAllRecords);

  // リセット確認ダイアログの状態（0: 閉じ, 1: 1回目の確認, 2: 2回目の確認）
  const [resetConfirmStep, setResetConfirmStep] = useState(0);

  // 学習済みフォルダIDを取得（50%以上視聴したもののみ）
  const completedFolderIds = useMemo(() => {
    const completedIds = new Set<string>();
    learningRecords
      .filter((r) => r.viewCompleted !== false) // 視聴完了のレコードのみ
      .forEach((r) => {
        completedIds.add(r.videoId);
      });
    return completedIds;
  }, [learningRecords]);

  // 苦手フォルダIDを取得
  const weakFolderIds = useMemo(() => {
    return new Set(getWeakVideoIds());
  }, [getWeakVideoIds, learningRecords]); // recordsが変更されたら再計算

  // 習得済みフォルダIDを取得
  const masteredFolderIds = useMemo(() => {
    return new Set(getMasteredVideoIds());
  }, [getMasteredVideoIds, learningRecords]); // recordsが変更されたら再計算

  const handleStartLearning = () => {
    if (selectedFolderIds.length === 0) {
      return;
    }
    navigate('/vertical-player');
  };

  // 苦手トグル処理
  const handleToggleWeak = useCallback((folder: RangeFolder) => {
    const isCurrentlyWeak = weakFolderIds.has(folder.id);
    addRecord({
      videoId: folder.id,
      displayName: folder.displayName,
      chapter: folder.chapter,
      topic: folder.topic,
      feedback: isCurrentlyWeak ? null : 'bad',
      viewCompleted: false, // 苦手トグルは視聴完了としてカウントしない
    });
  }, [weakFolderIds, addRecord]);

  const handleBack = () => {
    navigate('/');
  };

  // リセット処理
  const handleResetClick = () => {
    setResetConfirmStep(1); // 1回目の確認を開始
  };

  const handleFirstConfirm = () => {
    setResetConfirmStep(2); // 2回目の確認へ
  };

  const handleSecondConfirm = () => {
    clearAllRecords(); // 実際にリセット
    setResetConfirmStep(0);
  };

  const handleCancelReset = () => {
    setResetConfirmStep(0);
  };

  const isAllSelected = selectedFolderIds.length === availableFolders.length;
  const hasSelection = selectedFolderIds.length > 0;

  if (isLoading) {
    return (
      <div className="flex flex-col h-dvh bg-white">
        <Header title="範囲選択" showBack onBack={handleBack} />
        <div className="flex-1 flex items-center justify-center">
          <Loading message="読み込み中..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-dvh bg-white">
        <Header title="範囲選択" showBack onBack={handleBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <p className="text-red-600">{error}</p>
          <Button variant="primary" onClick={loadFolders}>
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-white">
      <Header title="範囲選択" showBack onBack={handleBack} />

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 全選択/全解除ボタン */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={selectAll}
            disabled={isAllSelected}
            className="flex-1"
          >
            全選択
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={deselectAll}
            disabled={!hasSelection}
            className="flex-1"
          >
            全解除
          </Button>
        </div>

        {/* 出題順選択 */}
        <div className="mb-4">
          <OrderModeSelector orderMode={orderMode} onSelect={setOrderMode} />
        </div>

        {/* フォルダ一覧（章ごとにグルーピング） */}
        <div className="mb-4">
          {sortedChapters.map(chapter => {
            const folders = groupedFolders.get(chapter) || [];
            return (
              <ChapterGroup
                key={chapter}
                chapter={chapter}
                folders={folders}
                selectedFolderIds={selectedFolderIds}
                completedFolderIds={completedFolderIds}
                masteredFolderIds={masteredFolderIds}
                weakFolderIds={weakFolderIds}
                onToggle={toggleFolder}
                onToggleChapter={toggleChapter}
                onToggleWeak={handleToggleWeak}
              />
            );
          })}
        </div>

        {/* リセットボタン */}
        {completedFolderIds.size > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetClick}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              視聴履歴・苦手をリセット
            </Button>
          </div>
        )}
      </div>

      {/* フッター（学習開始ボタン） */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 safe-area-inset-bottom">
        <Button
          variant="primary"
          size="lg"
          onClick={handleStartLearning}
          disabled={!hasSelection}
          className="w-full"
        >
          {hasSelection ? `${selectedFolderIds.length}件を学習開始` : '範囲を選択してください'}
        </Button>
      </div>

      {/* リセット確認ダイアログ（1回目） */}
      <ConfirmDialog
        isOpen={resetConfirmStep === 1}
        title="リセットの確認"
        message="視聴履歴と苦手マークをすべてリセットします。この操作は取り消せません。"
        confirmLabel="続ける"
        onConfirm={handleFirstConfirm}
        onCancel={handleCancelReset}
      />

      {/* リセット確認ダイアログ（2回目） */}
      <ConfirmDialog
        isOpen={resetConfirmStep === 2}
        title="本当にリセットしますか？"
        message="すべての視聴履歴と苦手マークが削除されます。本当によろしいですか？"
        confirmLabel="リセットする"
        onConfirm={handleSecondConfirm}
        onCancel={handleCancelReset}
      />
    </div>
  );
}
