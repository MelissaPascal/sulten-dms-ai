import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertProduct } from "@shared/schema";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProductDialog({ open, onOpenChange }: AddProductDialogProps) {
  const [formData, setFormData] = useState<InsertProduct>({
    name: "",
    description: "",
    pricePerUnit: "0.00",
    unitsPerCase: 24,
    reorderThreshold: 20,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const response = await apiRequest("POST", "/api/products", productData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        pricePerUnit: "0.00",
        unitsPerCase: 24,
        reorderThreshold: 20,
      });
      
      onOpenChange(false);
      
      toast({
        title: "Product added successfully",
        description: "The new product has been added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add product",
        description: error.message || "An error occurred while adding the product.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.pricePerUnit || (formData.unitsPerCase || 0) <= 0 || (formData.reorderThreshold || 0) <= 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields with valid values.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertProduct, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-product">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Rice Cakes - Chocolate"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              data-testid="input-product-name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Product description..."
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              data-testid="input-product-description"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerUnit">Price per Unit (TTD) *</Label>
              <Input
                id="pricePerUnit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.pricePerUnit}
                onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                data-testid="input-product-price"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitsPerCase">Units per Case *</Label>
              <Input
                id="unitsPerCase"
                type="number"
                min="1"
                value={formData.unitsPerCase}
                onChange={(e) => handleInputChange("unitsPerCase", parseInt(e.target.value) || 0)}
                data-testid="input-product-units-per-case"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reorderThreshold">Reorder Threshold *</Label>
            <Input
              id="reorderThreshold"
              type="number"
              min="1"
              placeholder="20"
              value={formData.reorderThreshold}
              onChange={(e) => handleInputChange("reorderThreshold", parseInt(e.target.value) || 0)}
              data-testid="input-product-reorder-threshold"
              required
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-product"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createProductMutation.isPending}
              data-testid="button-save-product"
            >
              {createProductMutation.isPending ? "Adding..." : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}