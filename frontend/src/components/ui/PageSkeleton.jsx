/**
 * PageSkeleton — used as the Suspense fallback when lazy-loaded pages are loading.
 * Shows an animated shimmer layout that matches the general page structure,
 * giving users instant visual feedback instead of a blank screen.
 */

// Reusable shimmer block
function Shimmer({ className = '' }) {
  return (
    <div
      className={`relative overflow-hidden bg-white/5 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/8 before:to-transparent ${className}`}
    />
  );
}

// KPI card skeleton (3-column row)
function SkeletonKPIRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-5 border border-border rounded-2xl bg-void/40 space-y-3">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="h-8 w-16" />
          <Shimmer className="h-2 w-32" />
        </div>
      ))}
    </div>
  );
}

// Card list skeleton
function SkeletonCardList({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="p-5 border border-border rounded-xl bg-void/40 space-y-3">
          <div className="flex items-center gap-3">
            <Shimmer className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-3 w-36" />
              <Shimmer className="h-2 w-24" />
            </div>
          </div>
          <Shimmer className="h-2 w-full" />
          <Shimmer className="h-2 w-3/4" />
          <div className="flex gap-2 pt-1">
            <Shimmer className="h-5 w-14 rounded-full" />
            <Shimmer className="h-5 w-14 rounded-full" />
            <Shimmer className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table row skeleton
function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/40">
      <Shimmer className="h-8 w-8 rounded-full shrink-0" />
      <Shimmer className="h-3 w-32" />
      <Shimmer className="h-3 w-20 ml-auto" />
      <Shimmer className="h-3 w-16" />
      <Shimmer className="h-6 w-20 rounded-lg" />
    </div>
  );
}

// Full page skeleton used as Suspense fallback
export default function PageSkeleton() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-void relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Page header */}
        <div className="flex items-center justify-between border-b border-border pb-5">
          <div className="space-y-2">
            <Shimmer className="h-7 w-64" />
            <Shimmer className="h-3 w-48" />
          </div>
          <Shimmer className="h-9 w-28 rounded-xl" />
        </div>

        {/* KPI row */}
        <SkeletonKPIRow />

        {/* Main content area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/main panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border border-border rounded-2xl bg-void/40 overflow-hidden">
              {/* Table header */}
              <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-white/2">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-3 w-20 ml-auto" />
                <Shimmer className="h-3 w-16" />
              </div>
              {[...Array(5)].map((_, i) => (
                <SkeletonTableRow key={i} />
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="border border-border rounded-2xl bg-void/40 p-5 space-y-4">
              <Shimmer className="h-4 w-32" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Shimmer className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Shimmer className="h-3 w-28" />
                    <Shimmer className="h-2 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card grid */}
        <SkeletonCardList count={4} />
      </div>
    </div>
  );
}

// Named exports for use in individual page components
export { Shimmer, SkeletonKPIRow, SkeletonCardList, SkeletonTableRow };
