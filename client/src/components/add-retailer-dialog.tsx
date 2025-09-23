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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertRetailer } from "@shared/schema";

interface AddRetailerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRetailerDialog({ open, onOpenChange }: AddRetailerDialogProps) {
  const [formData, setFormData] = useState<InsertRetailer>({
    name: "",
    location: "",
    contactNumber: "",
    email: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRetailerMutation = useMutation({
    mutationFn: async (retailerData: InsertRetailer) => {
      const response = await apiRequest("POST", "/api/retailers", retailerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/retailers"] });
      
      // Reset form
      setFormData({
        name: "",
        location: "",
        contactNumber: "",
        email: "",
      });
      
      onOpenChange(false);
      
      toast({
        title: "Retailer added successfully",
        description: "The new retailer has been added to the system.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add retailer",
        description: error.message || "An error occurred while adding the retailer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      toast({
        title: "Missing information",
        description: "Please enter retailer name and location.",
        variant: "destructive",
      });
      return;
    }

    createRetailerMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertRetailer, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-add-retailer">
        <DialogHeader>
          <DialogTitle>Add New Retailer</DialogTitle>
          <DialogDescription>
            Enter the details for the new retailer below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter retailer name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              data-testid="input-retailer-name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Region *</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => handleInputChange("location", value)}
            >
              <SelectTrigger data-testid="select-retailer-region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="West">West</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Phone</Label>
            <Input
              id="contactNumber"
              placeholder="e.g., +1868-555-0123"
              value={formData.contactNumber || ""}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
              data-testid="input-retailer-phone"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="orders@example.com"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              data-testid="input-retailer-email"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-retailer"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createRetailerMutation.isPending}
              data-testid="button-save-retailer"
            >
              {createRetailerMutation.isPending ? "Adding..." : "Add Retailer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}