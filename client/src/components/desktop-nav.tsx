import { BarChart3, ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DesktopNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function DesktopNav({ activeTab, onTabChange }: DesktopNavProps) {
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      testId: "tab-dashboard-desktop"
    },
    {
      id: "orders", 
      label: "Orders",
      icon: ShoppingCart,
      testId: "tab-orders-desktop"
    },
    {
      id: "inventory",
      label: "Inventory", 
      icon: Package,
      testId: "tab-inventory-desktop"
    }
  ];

  return (
    <nav className="hidden md:block fixed top-20 left-4 bg-card border border-border rounded-lg p-2 z-40">
      <div className="flex flex-col space-y-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={cn(
              "justify-start",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => onTabChange(tab.id)}
            data-testid={tab.testId}
          >
            <tab.icon className="w-5 h-5 mr-3" />
            <span className="font-medium">{tab.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
