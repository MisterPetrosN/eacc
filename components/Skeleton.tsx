interface SkeletonProps {
  variant?: "card" | "text" | "number" | "circle" | "custom";
  className?: string;
}

export function Skeleton({ variant = "text", className = "" }: SkeletonProps) {
  const baseClasses = "skeleton-pulse bg-[var(--border)]";

  const variantClasses = {
    card: "rounded-2xl h-32 w-full",
    text: "rounded h-4 w-3/4",
    number: "rounded h-10 w-1/3",
    circle: "rounded-full h-10 w-10",
    custom: "",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Top bar skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Skeleton variant="custom" className="rounded-2xl h-16" />
        <Skeleton variant="custom" className="rounded-2xl h-16" />
      </div>

      {/* Commodity tabs skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="custom" className="rounded-full h-8 w-20" />
        ))}
      </div>

      {/* Hero section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
        <Skeleton variant="custom" className="rounded-2xl h-48" />
        <div className="space-y-3">
          <Skeleton variant="custom" className="rounded-2xl h-[88px]" />
          <Skeleton variant="custom" className="rounded-2xl h-[88px]" />
        </div>
      </div>

      {/* Spot grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
    </div>
  );
}

export function AgentSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="custom" className="rounded-2xl h-32" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="card" />
        ))}
      </div>
      <Skeleton variant="custom" className="rounded-2xl h-24" />
      <Skeleton variant="custom" className="rounded-2xl h-48" />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="custom" className="rounded-2xl h-12 w-1/3" />
      <div className="flex gap-2 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} variant="custom" className="rounded-full h-8 w-16 flex-shrink-0" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton key={i} variant="custom" className="rounded-xl h-14" />
        ))}
      </div>
    </div>
  );
}

export function LotterySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="custom" className="rounded-2xl h-32" />
      <Skeleton variant="custom" className="rounded-2xl h-64" />
      <Skeleton variant="custom" className="rounded-2xl h-48" />
    </div>
  );
}
