import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, PackagePlus } from "lucide-react";
import { exportInventory } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { AddProductDialog } from "@/components/add-product-dialog";
import type { InventoryWithProduct } from "@shared/schema";

export function InventoryGrid() {
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const { toast } = useToast();
  
  const { data: inventory, isLoading } = useQuery<InventoryWithProduct[]>({
    queryKey: ["/api/inventory"],
  });

  const handleExport = async () => {
    try {
      await exportInventory();
      toast({
        title: "Export successful",
        description: "Inventory has been exported to CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (currentStock: number, threshold: number) => {
    const percentage = Math.round((currentStock / (threshold * 2)) * 100);
    
    if (currentStock <= threshold / 2) {
      return {
        label: "Critical",
        variant: "destructive" as const,
        color: "bg-destructive",
        percentage: Math.max(percentage, 10)
      };
    } else if (currentStock <= threshold) {
      return {
        label: "Low Stock",
        variant: "destructive" as const,
        color: "bg-destructive",
        percentage
      };
    } else {
      return {
        label: "In Stock",
        variant: "secondary" as const,
        color: "bg-accent",
        percentage: Math.min(percentage, 100)
      };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-8 bg-muted rounded mb-3"></div>
                <div className="h-2 bg-muted rounded mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-inventory-title">Inventory Overview</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              data-testid="button-export-inventory"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setShowAddProductDialog(true)}
              data-testid="button-add-product"
            >
              <PackagePlus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!inventory || inventory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-inventory">
            No inventory items found. Add your first product above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const status = getStockStatus(item.currentStock, item.product.reorderThreshold);
              
              return (
                <div 
                  key={item.id} 
                  className="bg-muted/50 rounded-lg p-4"
                  data-testid={`card-inventory-${item.product.id}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm" data-testid={`text-product-name-${item.product.id}`}>
                      {item.product.name}
                    </h4>
                    <Badge 
                      variant={status.variant}
                      className={status.variant === "destructive" ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent"}
                      data-testid={`badge-stock-status-${item.product.id}`}
                    >
                      {status.label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold" data-testid={`text-stock-level-${item.product.id}`}>
                      {item.currentStock}
                    </span>
                    <span className="text-xs text-muted-foreground">units remaining</span>
                  </div>
                  <Progress 
                    value={status.percentage} 
                    className={`mb-2 [&>div]:${status.color}`}
                    data-testid={`progress-stock-${item.product.id}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span data-testid={`text-reorder-threshold-${item.product.id}`}>
                      Reorder: {item.product.reorderThreshold} units
                    </span>
                    <span data-testid={`text-price-${item.product.id}`}>
                      ${item.product.pricePerUnit}/unit
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      <AddProductDialog
        open={showAddProductDialog}
        onOpenChange={setShowAddProductDialog}
      />
    </Card>
  );
}
