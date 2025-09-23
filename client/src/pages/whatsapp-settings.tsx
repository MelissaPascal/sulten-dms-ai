import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Phone, AlertTriangle, Package, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WhatsAppConfig, InsertWhatsAppConfig } from "@shared/schema";

export function WhatsAppSettings() {
  const { toast } = useToast();
  const [newRecipient, setNewRecipient] = useState('');

  // Fetch WhatsApp configuration from backend
  const { data: settings, isLoading, error } = useQuery<WhatsAppConfig>({
    queryKey: ['/api/whatsapp/config'],
  });

  // Local state for form editing
  const [localSettings, setLocalSettings] = useState<WhatsAppConfig | null>(null);

  // Update local settings when data is loaded
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings(settings);
    }
  }, [settings, localSettings]);

  // Mutation for saving settings
  const saveMutation = useMutation({
    mutationFn: (config: InsertWhatsAppConfig) => 
      apiRequest('PUT', '/api/whatsapp/config', config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/whatsapp/config'] });
      toast({
        title: "Settings Saved",
        description: "WhatsApp notification settings have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save WhatsApp notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddRecipient = () => {
    if (!localSettings || !newRecipient.trim()) return;
    
    if (!newRecipient.match(/^\+1868\d{7}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Trinidad & Tobago number (+1868XXXXXXX)",
        variant: "destructive",
      });
      return;
    }
    
    if (!localSettings.recipients.includes(newRecipient)) {
      setLocalSettings(prev => prev ? ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }) : null);
      setNewRecipient('');
      toast({
        title: "Recipient Added",
        description: `Added ${newRecipient} to notification list`,
      });
    } else {
      toast({
        title: "Duplicate Number",
        description: "This number is already in the recipients list",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRecipient = (phone: string) => {
    if (!localSettings) return;
    
    setLocalSettings(prev => prev ? ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== phone)
    }) : null);
    toast({
      title: "Recipient Removed",
      description: `Removed ${phone} from notification list`,
    });
  };

  const handleSave = () => {
    if (!localSettings) return;
    
    saveMutation.mutate(localSettings);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading WhatsApp settings...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-red-600 dark:text-red-400">
          Failed to load WhatsApp settings. Please refresh the page.
        </div>
      </div>
    );
  }

  if (!localSettings) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          WhatsApp Notifications
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Configure WhatsApp alerts for purchase orders and low stock notifications
        </p>
      </div>

      <div className="grid gap-6">
        {/* Service Status */}
        <Card data-testid="card-whatsapp-status">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Service Status
            </CardTitle>
            <CardDescription>
              WhatsApp integration status and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable WhatsApp Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Turn on/off all WhatsApp notifications
                  </p>
                </div>
                <Switch
                  data-testid="switch-whatsapp-enabled"
                  checked={localSettings.enabled}
                  onCheckedChange={(enabled) => setLocalSettings(prev => prev ? ({ ...prev, enabled }) : null)}
                />
              </div>
              
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm font-medium">Configuration Required</p>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  To enable WhatsApp notifications, configure your Twilio credentials in the environment variables:
                  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card data-testid="card-notification-settings">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Notification Types
            </CardTitle>
            <CardDescription>
              Configure which types of notifications to send
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Purchase Order Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send notifications when new orders are created
                  </p>
                </div>
                <Switch
                  data-testid="switch-po-alerts"
                  checked={localSettings.sendPOAlerts}
                  onCheckedChange={(enabled) => setLocalSettings(prev => prev ? ({ ...prev, sendPOAlerts: enabled }) : null)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Low Stock Alerts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send notifications when inventory falls below reorder threshold
                  </p>
                </div>
                <Switch
                  data-testid="switch-low-stock-alerts"
                  checked={localSettings.sendLowStockAlerts}
                  onCheckedChange={(enabled) => setLocalSettings(prev => prev ? ({ ...prev, sendLowStockAlerts: enabled }) : null)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card data-testid="card-recipients">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Recipients
            </CardTitle>
            <CardDescription>
              Manage phone numbers that will receive WhatsApp notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add New Recipient */}
              <div className="flex gap-2">
                <Input
                  data-testid="input-new-recipient"
                  placeholder="+18685550199"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  data-testid="button-add-recipient"
                  onClick={handleAddRecipient}
                  disabled={!newRecipient.trim()}
                >
                  Add
                </Button>
              </div>

              {/* Current Recipients */}
              <div className="space-y-2">
                <Label>Current Recipients ({localSettings.recipients.length})</Label>
                {localSettings.recipients.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No recipients configured</p>
                ) : (
                  <div className="grid gap-2">
                    {localSettings.recipients.map((phone, index) => (
                      <div 
                        key={phone} 
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        data-testid={`recipient-${index}`}
                      >
                        <span className="font-mono text-sm">{phone}</span>
                        <Button
                          data-testid={`button-remove-recipient-${index}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRecipient(phone)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            data-testid="button-save-settings"
            onClick={handleSave}
            className="min-w-32"
          >
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}