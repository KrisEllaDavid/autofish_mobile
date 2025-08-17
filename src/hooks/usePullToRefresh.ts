import { useEffect, useRef, useState } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  resistance?: number;
  refreshingText?: string;
  pullText?: string;
  releaseText?: string;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
  refreshingText = "Actualisation...",
  pullText = "Tirez pour actualiser",
  releaseText = "Relâchez pour actualiser"
}: UsePullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [showIndicator, setShowIndicator] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (isRefreshing) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    // Only trigger if we're at the top of the scroll
    if (container.scrollTop > 0) return;
    
    startY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;
    
    currentY.current = e.touches[0].clientY;
    const deltaY = currentY.current - startY.current;
    
    if (deltaY > 0) {
      // Prevent default scrolling when pulling down
      e.preventDefault();
      
      // Apply resistance to the pull
      const distance = Math.min(deltaY / resistance, threshold * 1.5);
      setPullDistance(distance);
      setShowIndicator(distance > 10);
      
      // Add visual feedback to the container
      if (container) {
        container.style.transform = `translateY(${Math.min(distance, threshold)}px)`;
        container.style.transition = 'none';
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging.current) return;
    
    isDragging.current = false;
    const container = containerRef.current;
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // Reset the visual state
    setPullDistance(0);
    setShowIndicator(false);
    
    if (container) {
      container.style.transform = 'translateY(0)';
      container.style.transition = 'transform 0.3s ease';
      
      // Remove transition after animation
      setTimeout(() => {
        if (container) {
          container.style.transition = '';
        }
      }, 300);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, pullDistance, threshold]);

  const getIndicatorText = () => {
    if (isRefreshing) return refreshingText;
    if (pullDistance >= threshold) return releaseText;
    return pullText;
  };

  const getIndicatorOpacity = () => {
    if (isRefreshing) return 1;
    return Math.min(pullDistance / threshold, 1);
  };

  return {
    containerRef,
    isRefreshing,
    showIndicator,
    pullDistance,
    indicatorText: getIndicatorText(),
    indicatorOpacity: getIndicatorOpacity(),
  };
};



