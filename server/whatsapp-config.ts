export interface WhatsAppConfig {
  enabled: boolean;
  recipients: string[];
  sendPOAlerts: boolean;
  sendLowStockAlerts: boolean;
}

export const defaultWhatsAppConfig: WhatsAppConfig = {
  enabled: true, // Enable by default for testing
  recipients: ['+18685550199'], // Default Trinidad & Tobago number format
  sendPOAlerts: true,
  sendLowStockAlerts: true,
};

// In a real application, this would be stored in database
// For now, using environment variables and defaults
export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    enabled: process.env.WHATSAPP_ENABLED === 'true' || defaultWhatsAppConfig.enabled,
    recipients: process.env.WHATSAPP_RECIPIENTS?.split(',') || defaultWhatsAppConfig.recipients,
    sendPOAlerts: process.env.WHATSAPP_PO_ALERTS !== 'false',
    sendLowStockAlerts: process.env.WHATSAPP_LOW_STOCK_ALERTS !== 'false',
  };
}