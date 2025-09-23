import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, UserPlus } from "lucide-react";
import { exportOrders } from "@/lib/export-utils";
import { useToast } from "@/hooks/use-toast";
import { AddRetailerDialog } from "@/components/add-retailer-dialog";
import type { OrderWithDetails } from "@shared/schema";

export function OrdersTable() {
  const [showAddRetailerDialog, setShowAddRetailerDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const handleExport = async () => {
    try {
      await exportOrders();
      toast({
        title: "Export successful",
        description: "Orders have been exported to CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Unable to export orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "destructive",
      processing: "default", 
      completed: "secondary",
      cancelled: "outline"
    } as const;
    
    const colors = {
      pending: "bg-destructive/20 text-destructive hover:bg-destructive/30",
      processing: "bg-primary/20 text-primary hover:bg-primary/30",
      completed: "bg-accent/20 text-accent hover:bg-accent/30",
      cancelled: "bg-muted text-muted-foreground"
    };

    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || "outline"}
        className={colors[status as keyof typeof colors] || ""}
        data-testid={`badge-status-${status}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted rounded"></div>
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
          <CardTitle data-testid="text-orders-title">Recent Orders</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              data-testid="button-export-orders"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setShowAddRetailerDialog(true)}
              data-testid="button-add-retailer"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Retailer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!orders || orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground" data-testid="text-no-orders">
            No orders found. Create your first order above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Retailer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm" data-testid={`cell-order-number-${order.id}`}>
                      {order.orderNumber}
                    </TableCell>
                    <TableCell data-testid={`cell-retailer-${order.id}`}>
                      {order.retailer.name}
                    </TableCell>
                    <TableCell data-testid={`cell-product-${order.id}`}>
                      {order.product.name}
                    </TableCell>
                    <TableCell data-testid={`cell-quantity-${order.id}`}>
                      {order.quantity} units
                    </TableCell>
                    <TableCell data-testid={`cell-status-${order.id}`}>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="font-medium" data-testid={`cell-total-${order.id}`}>
                      ${parseFloat(order.totalAmount.toString()).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <AddRetailerDialog
        open={showAddRetailerDialog}
        onOpenChange={setShowAddRetailerDialog}
      />
    </Card>
  );
}
