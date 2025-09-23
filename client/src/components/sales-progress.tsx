import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

export function SalesProgress() {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: salesTarget } = useQuery({
    queryKey: ["/api/sales-target", month, year],
    queryFn: async () => {
      const response = await fetch(`/api/sales-target/${month}/${year}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sales target');
      }
      return response.json();
    },
  });

  if (!salesTarget) {
    return (
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-3 bg-muted rounded mb-3"></div>
          <div className="flex justify-between">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  const current = parseFloat(salesTarget.currentAmount);
  const target = parseFloat(salesTarget.targetAmount);
  const percentage = Math.round((current / target) * 100);
  const remaining = target - current;

  return (
    <div className="bg-card rounded-lg border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" data-testid="text-sales-target-title">Monthly Sales Target</h2>
        <span className="text-sm text-muted-foreground" data-testid="text-sales-target-amount">
          TTD ${current.toLocaleString()} / ${target.toLocaleString()}
        </span>
      </div>
      <Progress value={percentage} className="mb-3" data-testid="progress-sales-target" />
      <div className="flex justify-between text-sm">
        <span className="text-accent font-medium" data-testid="text-sales-percentage">
          {percentage}% Complete
        </span>
        <span className="text-muted-foreground" data-testid="text-sales-remaining">
          ${remaining.toLocaleString()} remaining
        </span>
      </div>
    </div>
  );
}
