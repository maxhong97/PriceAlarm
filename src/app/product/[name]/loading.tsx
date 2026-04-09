import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <div className="p-4 flex flex-col gap-6 pt-8">
      <Skeleton className="h-4 w-48" />
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="rounded-xl border p-5">
        <Skeleton className="h-12 w-40 mb-4" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-[90px] rounded-lg" />
      <Skeleton className="h-[200px] rounded-lg" />
      <Skeleton className="h-[90px] rounded-lg" />
      <Skeleton className="h-12 rounded-xl" />
    </div>
  );
}
