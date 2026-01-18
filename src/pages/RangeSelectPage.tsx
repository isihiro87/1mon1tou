import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Loading } from '../components/common/Loading';
import { Button } from '../components/common/Button';
import { ChapterGroup } from '../components/range/ChapterGroup';
import { OrderModeSelector } from '../components/range/OrderModeSelector';
import { useRangeStore } from '../stores/rangeStore';
import { RangeContentService } from '../services/RangeContentService';

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

  const handleStartLearning = () => {
    if (selectedFolderIds.length === 0) {
      return;
    }
    navigate('/vertical-player');
  };

  const isAllSelected = selectedFolderIds.length === availableFolders.length;
  const hasSelection = selectedFolderIds.length > 0;

  if (isLoading) {
    return (
      <div className="flex flex-col h-dvh bg-white">
        <Header title="範囲選択" showBack />
        <div className="flex-1 flex items-center justify-center">
          <Loading message="読み込み中..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-dvh bg-white">
        <Header title="範囲選択" showBack />
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
      <Header title="範囲選択" showBack />

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
                onToggle={toggleFolder}
                onToggleChapter={toggleChapter}
              />
            );
          })}
        </div>
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
    </div>
  );
}
