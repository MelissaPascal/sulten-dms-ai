import { BarChart3, ShoppingCart, Package, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard", 
      icon: BarChart3,
      testId: "tab-dashboard"
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      testId: "tab-orders"
    },
    {
      id: "inventory", 
      label: "Inventory",
      icon: Package,
      testId: "tab-inventory"
    },
    {
      id: "settings",
      label: "WhatsApp",
      icon: MessageSquare,
      testId: "tab-whatsapp"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center py-2 px-4 rounded-lg transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            )}
            data-testid={tab.testId}
          >
            <tab.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
