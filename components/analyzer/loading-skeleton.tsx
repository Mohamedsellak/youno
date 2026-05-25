import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Overview skeleton */}
      <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      {/* Tech / Signals skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Score skeleton */}
      <Card className="border-border/30 bg-card/40 backdrop-blur-xl shadow-2xl hover:border-border/50 hover:bg-card/50 transition-all duration-500">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-full rounded-full" />
        </CardContent>
      </Card>
    </div>
  );
}
