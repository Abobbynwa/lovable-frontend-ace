import { Skeleton } from '@/components/ui/skeleton';

export const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-card rounded-lg border p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <Skeleton className="h-10 w-20" />
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
};
