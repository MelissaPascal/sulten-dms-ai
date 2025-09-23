import { 
  type Retailer, 
  type InsertRetailer, 
  type Product, 
  type InsertProduct, 
  type Order, 
  type InsertOrder, 
  type Inventory, 
  type InsertInventory, 
  type SalesTarget, 
  type OrderWithDetails, 
  type InventoryWithProduct,
  type WhatsAppConfig,
  type InsertWhatsAppConfig,
  retailers,
  products,
  orders,
  inventory,
  salesTargets
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";
import type { IStorage } from "./storage";
import { whatsAppService } from "./whatsapp";

export class DatabaseStorage implements IStorage {
  private whatsAppConfig: WhatsAppConfig = {
    enabled: false,
    recipients: ['+18685550199'],
    sendPOAlerts: true,
    sendLowStockAlerts: true,
  };
  
  // Retailers
  async getRetailers(): Promise<Retailer[]> {
    return await db.select().from(retailers).orderBy(desc(retailers.createdAt));
  }

  async getRetailer(id: string): Promise<Retailer | undefined> {
    const [retailer] = await db.select().from(retailers).where(eq(retailers.id, id));
    return retailer || undefined;
  }

  async createRetailer(retailerData: InsertRetailer): Promise<Retailer> {
    const [retailer] = await db
      .insert(retailers)
      .values(retailerData)
      .returning();
    return retailer;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(productData)
      .returning();

    // Also create initial inventory entry
    await db
      .insert(inventory)
      .values({
        productId: product.id,
        currentStock: 0,
      });

    return product;
  }

  // Orders
  async getOrders(): Promise<OrderWithDetails[]> {
    const ordersWithDetails = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        retailerId: orders.retailerId,
        productId: orders.productId,
        quantity: orders.quantity,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        retailer: {
          id: retailers.id,
          name: retailers.name,
          location: retailers.location,
          contactNumber: retailers.contactNumber,
          email: retailers.email,
          createdAt: retailers.createdAt,
        },
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          pricePerUnit: products.pricePerUnit,
          unitsPerCase: products.unitsPerCase,
          reorderThreshold: products.reorderThreshold,
          createdAt: products.createdAt,
        }
      })
      .from(orders)
      .innerJoin(retailers, eq(orders.retailerId, retailers.id))
      .innerJoin(products, eq(orders.productId, products.id))
      .orderBy(desc(orders.createdAt));

    return ordersWithDetails;
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const [orderWithDetails] = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        retailerId: orders.retailerId,
        productId: orders.productId,
        quantity: orders.quantity,
        totalAmount: orders.totalAmount,
        status: orders.status,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        retailer: {
          id: retailers.id,
          name: retailers.name,
          location: retailers.location,
          contactNumber: retailers.contactNumber,
          email: retailers.email,
          createdAt: retailers.createdAt,
        },
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          pricePerUnit: products.pricePerUnit,
          unitsPerCase: products.unitsPerCase,
          reorderThreshold: products.reorderThreshold,
          createdAt: products.createdAt,
        }
      })
      .from(orders)
      .innerJoin(retailers, eq(orders.retailerId, retailers.id))
      .innerJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.id, id));

    return orderWithDetails || undefined;
  }

  async createOrder(orderData: InsertOrder): Promise<OrderWithDetails> {
    // Generate unique order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.random().toString().slice(2, 6).padStart(4, '0')}`;
    
    const [order] = await db
      .insert(orders)
      .values({
        ...orderData,
        orderNumber,
        updatedAt: new Date(),
      })
      .returning();

    // Update inventory
    await db
      .update(inventory)
      .set({
        currentStock: sql`current_stock - ${orderData.quantity}`,
        lastUpdated: new Date(),
      })
      .where(eq(inventory.productId, orderData.productId));

    // Return the full order with details
    const orderWithDetails = await this.getOrder(order.id);
    if (!orderWithDetails) {
      throw new Error("Failed to retrieve created order");
    }

    // Send WhatsApp notifications based on configuration
    const config = await this.getWhatsAppConfig();
    
    if (config.enabled && config.sendPOAlerts) {
      try {
        await whatsAppService.sendPOAlert({
          orderNumber: orderWithDetails.orderNumber,
          retailerName: orderWithDetails.retailer.name,
          productName: orderWithDetails.product.name,
          quantity: orderWithDetails.quantity,
          totalAmount: parseFloat(orderWithDetails.totalAmount)
        }, config.recipients);
      } catch (error) {
        console.error('Failed to send WhatsApp PO alert:', error);
      }
    }

    // Check if inventory is below reorder threshold and send low stock alert
    const inventoryItem = await this.getInventoryByProduct(orderData.productId);
    if (inventoryItem && inventoryItem.currentStock <= inventoryItem.product.reorderThreshold) {
      if (config.enabled && config.sendLowStockAlerts) {
        try {
          await whatsAppService.sendLowStockAlert({
            productName: inventoryItem.product.name,
            currentStock: inventoryItem.currentStock,
            reorderThreshold: inventoryItem.product.reorderThreshold
          }, config.recipients);
        } catch (error) {
          console.error('Failed to send WhatsApp low stock alert:', error);
        }
      }
    }

    return orderWithDetails;
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));
  }

  async updateOrderStatusByOrderNumber(orderNumber: string, status: string): Promise<boolean> {
    const result = await db
      .update(orders)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.orderNumber, orderNumber));

    return (result.rowCount || 0) > 0;
  }

  // Inventory
  async getInventory(): Promise<InventoryWithProduct[]> {
    const inventoryWithProduct = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        currentStock: inventory.currentStock,
        lastUpdated: inventory.lastUpdated,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          pricePerUnit: products.pricePerUnit,
          unitsPerCase: products.unitsPerCase,
          reorderThreshold: products.reorderThreshold,
          createdAt: products.createdAt,
        }
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .orderBy(products.name);

    return inventoryWithProduct;
  }

  async getInventoryByProduct(productId: string): Promise<InventoryWithProduct | undefined> {
    const [inventoryWithProduct] = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        currentStock: inventory.currentStock,
        lastUpdated: inventory.lastUpdated,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          pricePerUnit: products.pricePerUnit,
          unitsPerCase: products.unitsPerCase,
          reorderThreshold: products.reorderThreshold,
          createdAt: products.createdAt,
        }
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(eq(inventory.productId, productId));

    return inventoryWithProduct || undefined;
  }

  async updateInventory(productId: string, quantity: number): Promise<void> {
    await db
      .update(inventory)
      .set({
        currentStock: quantity,
        lastUpdated: new Date(),
      })
      .where(eq(inventory.productId, productId));
  }

  // Sales Targets
  async getSalesTarget(month: number, year: number): Promise<SalesTarget | undefined> {
    const [target] = await db
      .select()
      .from(salesTargets)
      .where(and(
        eq(salesTargets.month, month),
        eq(salesTargets.year, year)
      ));

    return target || undefined;
  }

  async updateSalesTarget(month: number, year: number, currentAmount: string): Promise<void> {
    const existing = await this.getSalesTarget(month, year);
    
    if (existing) {
      await db
        .update(salesTargets)
        .set({ currentAmount })
        .where(and(
          eq(salesTargets.month, month),
          eq(salesTargets.year, year)
        ));
    } else {
      await db
        .insert(salesTargets)
        .values({
          month,
          year,
          targetAmount: "25000.00",
          currentAmount,
        });
    }
  }

  // Dashboard metrics
  async getDashboardMetrics(): Promise<{
    totalOrders: number;
    itemsInStock: number;
    activeRetailers: number;
    avgOrderValue: number;
    lowStockItems: InventoryWithProduct[];
  }> {
    // Get total orders count
    const [totalOrdersResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);
    const totalOrders = totalOrdersResult?.count || 0;

    // Get total items in stock
    const [itemsInStockResult] = await db
      .select({ total: sql<number>`sum(current_stock)` })
      .from(inventory);
    const itemsInStock = itemsInStockResult?.total || 0;

    // Get active retailers count (retailers with at least one order)
    const [activeRetailersResult] = await db
      .select({ count: sql<number>`count(distinct retailer_id)` })
      .from(orders);
    const activeRetailers = activeRetailersResult?.count || 0;

    // Get average order value
    const [avgOrderValueResult] = await db
      .select({ avg: sql<number>`avg(total_amount)` })
      .from(orders);
    const avgOrderValue = Math.round(avgOrderValueResult?.avg || 0);

    // Get low stock items (items below reorder threshold)
    const lowStockItems = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        currentStock: inventory.currentStock,
        lastUpdated: inventory.lastUpdated,
        product: {
          id: products.id,
          name: products.name,
          description: products.description,
          pricePerUnit: products.pricePerUnit,
          unitsPerCase: products.unitsPerCase,
          reorderThreshold: products.reorderThreshold,
          createdAt: products.createdAt,
        }
      })
      .from(inventory)
      .innerJoin(products, eq(inventory.productId, products.id))
      .where(sql`current_stock <= reorder_threshold`)
      .orderBy(products.name);

    return {
      totalOrders,
      itemsInStock,
      activeRetailers,
      avgOrderValue,
      lowStockItems,
    };
  }

  // WhatsApp Configuration
  async getWhatsAppConfig(): Promise<WhatsAppConfig> {
    return this.whatsAppConfig;
  }

  async updateWhatsAppConfig(config: InsertWhatsAppConfig): Promise<WhatsAppConfig> {
    this.whatsAppConfig = {
      enabled: config.enabled,
      recipients: config.recipients.map(r => r.trim()).filter(r => r.length > 0),
      sendPOAlerts: config.sendPOAlerts,
      sendLowStockAlerts: config.sendLowStockAlerts,
    };
    return this.whatsAppConfig;
  }
}