'use client';

import { Card, Chip } from '@heroui/react';
import { useEffect, useState } from 'react';
import { IoShieldCheckmarkOutline } from 'react-icons/io5';
import { playerAdBlocker } from '@/utils/player-ad-blocker';

interface PlayerAdBlockStatsProps {
  className?: string;
  compact?: boolean;
}

export default function PlayerAdBlockStats({ className = '', compact = false }: PlayerAdBlockStatsProps) {
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    // Update blocked count every 2 seconds
    const interval = setInterval(() => {
      setBlockedCount(playerAdBlocker.getBlockedCount());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (blockedCount === 0 && compact) {
    return null; // Don't show if no ads blocked in compact mode
  }

  if (compact) {
    return (
      <Chip
        size="sm"
        variant="flat"
        color="success"
        startContent={<IoShieldCheckmarkOutline className="text-lg" />}
        className={className}
      >
        {blockedCount} ads blocked
      </Chip>
    );
  }

  return (
    <Card className={`p-3 bg-success-50/10 border border-success-500/20 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-success-500/20">
          <IoShieldCheckmarkOutline className="text-2xl text-success-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-success-500">
            Ad Blocker Active
          </p>
          <p className="text-xs text-default-500">
            {blockedCount} {blockedCount === 1 ? 'ad' : 'ads'} blocked
          </p>
        </div>
      </div>
    </Card>
  );
}
