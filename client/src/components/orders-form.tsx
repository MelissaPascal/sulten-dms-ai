import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Retailer, Product } from "@shared/schema";

export function OrdersForm() {
  const [selectedRetailer, setSelectedRetailer] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: retailers } = useQuery<Retailer[]>({
    queryKey: ["/api/retailers"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      
      // Reset form
      setSelectedRetailer("");
      setSelectedProduct("");
      setQuantity("");
      
      toast({
        title: "Order created successfully",
        description: "The order has been added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create order",
        description: error.message || "An error occurred while creating the order.",
        variant: "destructive",
      });
    },
  });

  const handleCreateOrder = () => {
    if (!selectedRetailer || !selectedProduct || !quantity) {
      toast({
        title: "Missing information",
        description: "Please select a retailer, product, and enter quantity.",
        variant: "destructive",
      });
      return;
    }

    const product = products?.find(p => p.id === selectedProduct);
    if (!product) return;

    const quantityNum = parseInt(quantity);
    const totalAmount = (parseFloat(product.pricePerUnit) * quantityNum).toFixed(2);

    createOrderMutation.mutate({
      retailerId: selectedRetailer,
      productId: selectedProduct,
      quantity: quantityNum,
      totalAmount,
      status: "pending",
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create New Order</CardTitle>
          <Button 
            onClick={handleCreateOrder}
            disabled={createOrderMutation.isPending}
            data-testid="button-create-order"
          >
            <Plus className="w-4 h-4 mr-2" />
            {createOrderMutation.isPending ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="retailer-select">Select Retailer</Label>
            <Select value={selectedRetailer} onValueChange={setSelectedRetailer}>
              <SelectTrigger data-testid="select-retailer">
                <SelectValue placeholder="Choose retailer..." />
              </SelectTrigger>
              <SelectContent>
                {retailers?.map((retailer) => (
                  <SelectItem key={retailer.id} value={retailer.id} data-testid={`retailer-option-${retailer.id}`}>
                    {retailer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="product-select">Select Product</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger data-testid="select-product">
                <SelectValue placeholder="Choose product..." />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product) => (
                  <SelectItem key={product.id} value={product.id} data-testid={`product-option-${product.id}`}>
                    {product.name} (${product.pricePerUnit}/unit)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              placeholder="Enter quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              data-testid="input-quantity"
            />
          </div>

          {selectedProduct && quantity && (
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <div className="p-3 bg-muted rounded-lg font-medium" data-testid="text-total-amount">
                ${((parseFloat(products?.find(p => p.id === selectedProduct)?.pricePerUnit || "0")) * parseInt(quantity || "0")).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
