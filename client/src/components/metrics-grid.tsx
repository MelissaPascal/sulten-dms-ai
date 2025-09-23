import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, PackageCheck, Users, TrendingUp } from "lucide-react";

export function MetricsGrid() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard/metrics");
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      return response.json();
    },
  });

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      icon: ShoppingCart,
      title: "Total Orders",
      value: metrics.totalOrders,
      change: "+12% vs last month",
      color: "text-primary",
      changeColor: "text-accent",
      testId: "metric-total-orders"
    },
    {
      icon: PackageCheck,
      title: "Items in Stock",
      value: metrics.itemsInStock,
      change: `${metrics.lowStockItems.length} items low stock`,
      color: "text-accent",
      changeColor: metrics.lowStockItems.length > 0 ? "text-destructive" : "text-muted-foreground",
      testId: "metric-items-stock"
    },
    {
      icon: Users,
      title: "Active Retailers",
      value: metrics.activeRetailers,
      change: "Across 3 regions",
      color: "text-secondary",
      changeColor: "text-muted-foreground",
      testId: "metric-active-retailers"
    },
    {
      icon: TrendingUp,
      title: "Avg Order Value",
      value: `$${metrics.avgOrderValue}`,
      change: "+8% vs last month",
      color: "text-accent",
      changeColor: "text-accent",
      testId: "metric-avg-order-value"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricCards.map((metric, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-4" data-testid={metric.testId}>
          <div className="flex items-center space-x-2 mb-2">
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
            <span className="text-sm font-medium">{metric.title}</span>
          </div>
          <div className="text-2xl font-bold text-foreground" data-testid={`${metric.testId}-value`}>
            {metric.value}
          </div>
          <div className={`text-xs ${metric.changeColor}`} data-testid={`${metric.testId}-change`}>
            {metric.change}
          </div>
        </div>
      ))}
    </div>
  );
}
