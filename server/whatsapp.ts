import twilio from 'twilio';

export interface WhatsAppMessage {
  to: string;
  message: string;
}

export interface LowStockAlert {
  productName: string;
  currentStock: number;
  reorderThreshold: number;
  retailerName?: string;
}

export class WhatsAppService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | null = null;

  constructor() {
    // Initialize Twilio client if credentials are available
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM || null;

    if (accountSid && authToken && this.fromNumber) {
      try {
        this.client = twilio(accountSid, authToken);
        console.log('WhatsApp service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Twilio client:', error);
      }
    } else {
      console.warn('WhatsApp service not configured - missing Twilio credentials');
    }
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.client || !this.fromNumber) {
      console.log('WhatsApp not configured, would send:', { to, message });
      return false;
    }

    try {
      const result = await this.client.messages.create({
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${to}`,
        body: message
      });
      
      console.log(`WhatsApp message sent: ${result.sid}`);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  async sendLowStockAlert(alert: LowStockAlert, recipients: string[]): Promise<void> {
    const message = this.formatLowStockMessage(alert);
    
    const sendPromises = recipients.map(phone => 
      this.sendMessage(phone, message)
    );

    await Promise.all(sendPromises);
  }

  private formatLowStockMessage(alert: LowStockAlert): string {
    return `🚨 LOW STOCK ALERT 🚨

Product: ${alert.productName}
Current Stock: ${alert.currentStock} cases
Reorder Level: ${alert.reorderThreshold} cases

⚠️ Immediate reorder required!

Please arrange stock replenishment ASAP.

- DMS.ai Sulten Rice Cakes`;
  }

  async sendPOAlert(orderDetails: {
    orderNumber: string;
    retailerName: string;
    productName: string;
    quantity: number;
    totalAmount: number;
  }, recipients: string[]): Promise<void> {
    const message = this.formatPOMessage(orderDetails);
    
    const sendPromises = recipients.map(phone => 
      this.sendMessage(phone, message)
    );

    await Promise.all(sendPromises);
  }

  private formatPOMessage(orderDetails: {
    orderNumber: string;
    retailerName: string;
    productName: string;
    quantity: number;
    totalAmount: number;
  }): string {
    return `📋 NEW PURCHASE ORDER

Order #: ${orderDetails.orderNumber}
Retailer: ${orderDetails.retailerName}
Product: ${orderDetails.productName}
Quantity: ${orderDetails.quantity} cases
Total: $${orderDetails.totalAmount} TTD

✅ Order received and processing.

- DMS.ai Sulten Rice Cakes`;
  }

  isConfigured(): boolean {
    return this.client !== null && this.fromNumber !== null;
  }
}

// Singleton instance
export const whatsAppService = new WhatsAppService();