import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertTriangle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderWithDetails, InventoryWithProduct } from "@shared/schema";

export function RecentActivity() {
  const { data: orders } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const { data: inventory } = useQuery<InventoryWithProduct[]>({
    queryKey: ["/api/inventory"],
  });

  if (!orders || !inventory) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button variant="ghost" size="sm" data-testid="button-view-all">
            View All
          </Button>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div className="animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
              </div>
              <div className="flex-1 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Get recent completed orders
  const recentOrders = (orders ?? [])
    .filter((order: OrderWithDetails) => order.status === 'completed')
    .slice(0, 2);

  // Get low stock items
  const lowStockItems = (inventory ?? []).filter((item: InventoryWithProduct) => 
    item.currentStock <= item.product.reorderThreshold
  ).slice(0, 2);

  const activities = [
    ...recentOrders.map((order: OrderWithDetails) => ({
      id: `order-${order.id}`,
      icon: CheckCircle,
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      title: `Order ${order.orderNumber} completed`,
      subtitle: `${order.retailer.name} • ${Math.floor(Math.random() * 24)} hours ago`,
      type: 'order'
    })),
    ...lowStockItems.map((item: InventoryWithProduct) => ({
      id: `stock-${item.id}`,
      icon: AlertTriangle,
      iconBg: "bg-destructive/20",
      iconColor: "text-destructive",
      title: `Low stock alert: ${item.product.name}`,
      subtitle: `Only ${item.currentStock} units remaining`,
      type: 'stock'
    })),
    // Add new retailer activity (simulated)
    {
      id: 'retailer-new',
      icon: UserPlus,
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      title: "New retailer added: City Market Express",
      subtitle: "Port of Spain • 1 day ago",
      type: 'retailer'
    }
  ].slice(0, 3);

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" data-testid="text-recent-activity-title">Recent Activity</h3>
        <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg" data-testid={`activity-${activity.type}`}>
              <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center`}>
                <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" data-testid={`activity-${activity.type}-title`}>
                  {activity.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`activity-${activity.type}-subtitle`}>
                  {activity.subtitle}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
