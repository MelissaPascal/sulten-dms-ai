import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InventoryWithProduct } from "@shared/schema";

export function InventoryAlerts() {
  const { toast } = useToast();
  
  const { data: inventory } = useQuery<InventoryWithProduct[]>({
    queryKey: ["/api/inventory"],
  });

  const lowStockItems = inventory?.filter(item => 
    item.currentStock <= item.product.reorderThreshold
  ) || [];

  const handleTriggerPO = () => {
    toast({
      title: "Purchase Orders Triggered",
      description: `PO requests have been generated for ${lowStockItems.length} low stock items.`,
    });
  };

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="font-medium text-destructive" data-testid="text-low-stock-title">
          Low Stock Alerts
        </h3>
      </div>
      <p className="text-sm text-destructive/80 mb-3" data-testid="text-low-stock-count">
        {lowStockItems.length} items require immediate attention
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {lowStockItems.map((item) => (
          <Badge
            key={item.id}
            className="bg-destructive text-destructive-foreground"
            data-testid={`badge-low-stock-${item.product.id}`}
          >
            {item.product.name} ({item.currentStock} left)
          </Badge>
        ))}
      </div>
      <Button 
        variant="destructive"
        onClick={handleTriggerPO}
        data-testid="button-trigger-po"
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Trigger Purchase Orders
      </Button>
    </div>
  );
}
