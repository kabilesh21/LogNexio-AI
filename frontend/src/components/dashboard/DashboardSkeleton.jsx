import React from 'react';

function SkeletonBox({ className = '' }) {
  return (
    <div className={`bg-slate-800/60 rounded-xl animate-pulse ${className}`} />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <SkeletonBox className="h-8 w-64" />
          <SkeletonBox className="h-4 w-48" />
        </div>
        <SkeletonBox className="h-9 w-32 rounded-xl" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-2xl border border-background-border p-5 flex flex-col gap-3 animate-pulse">
            <SkeletonBox className="h-10 w-10 rounded-xl" />
            <div className="flex flex-col gap-1.5">
              <SkeletonBox className="h-3 w-20" />
              <SkeletonBox className="h-7 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4 animate-pulse">
          <SkeletonBox className="h-5 w-32" />
          <SkeletonBox className="h-56 w-full rounded-xl" />
        </div>
        <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4 animate-pulse">
          <SkeletonBox className="h-5 w-32" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBox key={i} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="glass-panel rounded-2xl border border-background-border p-6 flex flex-col gap-4 animate-pulse">
        <SkeletonBox className="h-5 w-40" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBox key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
