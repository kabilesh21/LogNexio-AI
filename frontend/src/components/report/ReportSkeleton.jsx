import React from 'react';

function SkeletonBox({ className = '' }) {
  return <div className={`bg-slate-800/60 rounded-xl animate-pulse ${className}`} />;
}

export default function ReportSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-panel border border-background-border rounded-2xl p-5 flex flex-col gap-2 animate-pulse">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Cards grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel border border-background-border rounded-2xl p-5 flex flex-col gap-4 animate-pulse">
            <div className="flex items-center justify-between">
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-5 w-16 rounded-full" />
            </div>
            <SkeletonBox className="h-5 w-48" />
            <SkeletonBox className="h-12 w-full rounded-xl" />
            <div className="flex justify-between pt-2">
              <SkeletonBox className="h-8 w-20 rounded-xl" />
              <SkeletonBox className="h-8 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
