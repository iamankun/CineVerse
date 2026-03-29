import { useMemo, useState, useCallback, useRef } from 'react';

interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualItem {
  index: number;
  offsetTop: number;
  isVirtual: boolean;
}

export const useVirtualScroll = <T,>(
  items: T[],
  options: UseVirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );

    const virtualItems: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        offsetTop: i * itemHeight,
        isVirtual: i < startIndex || i > endIndex
      });
    }

    return {
      items: virtualItems,
      startIndex,
      endIndex,
      totalHeight: items.length * itemHeight
    };
  }, [items.length, scrollTop, itemHeight, containerHeight, overscan]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const getItemData = useCallback((index: number) => {
    return items[index];
  }, [items]);

  return {
    visibleItems,
    getItemData,
    handleScroll,
    scrollElementRef,
    totalHeight: visibleItems.totalHeight
  };
};

// Hook cho lazy loading chunks
export const useChunkedLoading = <T,>(
  items: T[],
  chunkSize: number = 20
) => {
  const [loadedChunks, setLoadedChunks] = useState<Set<number>>(new Set([0]));
  const [visibleChunk, setVisibleChunk] = useState(0);

  const loadChunk = useCallback((chunkIndex: number) => {
    if (!loadedChunks.has(chunkIndex)) {
      setLoadedChunks(prev => new Set(prev).add(chunkIndex));
    }
  }, [loadedChunks]);

  const getVisibleItems = useCallback((startIndex: number, endIndex: number) => {
    const startChunk = Math.floor(startIndex / chunkSize);
    const endChunk = Math.floor(endIndex / chunkSize);
    
    // Load chunks trong viewport
    for (let i = startChunk; i <= endChunk; i++) {
      loadChunk(i);
    }

    // Return items từ loaded chunks
    const result: T[] = [];
    for (let i = 0; i < loadedChunks.size; i++) {
      if (loadedChunks.has(i)) {
        const chunkStart = i * chunkSize;
        const chunkEnd = Math.min(chunkStart + chunkSize, items.length);
        result.push(...items.slice(chunkStart, chunkEnd));
      }
    }
    
    return result;
  }, [items, chunkSize, loadChunk, loadedChunks]);

  return {
    getVisibleItems,
    loadedChunks,
    totalChunks: Math.ceil(items.length / chunkSize)
  };
};
