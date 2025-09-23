import { useState } from "react";
import { Package } from "lucide-react";
import { RoleToggle } from "@/components/role-toggle";
import { SalesProgress } from "@/components/sales-progress";
import { MetricsGrid } from "@/components/metrics-grid";
import { RecentActivity } from "@/components/recent-activity";
import { OrdersForm } from "@/components/orders-form";
import { OrdersTable } from "@/components/orders-table";
import { InventoryAlerts } from "@/components/inventory-alerts";
import { InventoryGrid } from "@/components/inventory-grid";
import { MobileNav } from "@/components/mobile-nav";
import { DesktopNav } from "@/components/desktop-nav";
import { WhatsAppSettings } from "@/pages/whatsapp-settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="py-6">
            <SalesProgress />
            <MetricsGrid />
            <RecentActivity />
          </div>
        );
      case "orders":
        return (
          <div className="py-6">
            <OrdersForm />
            <OrdersTable />
          </div>
        );
      case "inventory":
        return (
          <div className="py-6">
            <InventoryAlerts />
            <InventoryGrid />
          </div>
        );
      case "settings":
        return <WhatsAppSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold" data-testid="text-app-title">DMS.ai</h1>
                <p className="text-xs text-muted-foreground" data-testid="text-app-subtitle">
                  Distribution Management
                </p>
              </div>
            </div>
            <RoleToggle />
          </div>
        </div>
      </header>

      {/* Desktop Navigation */}
      <DesktopNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20 md:pb-8 md:ml-56">
        {renderTabContent()}
      </main>

      {/* Mobile Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
