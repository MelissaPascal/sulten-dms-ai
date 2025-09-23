import { type Retailer, type InsertRetailer, type Product, type InsertProduct, type Order, type InsertOrder, type Inventory, type InsertInventory, type SalesTarget, type OrderWithDetails, type InventoryWithProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Retailers
  getRetailers(): Promise<Retailer[]>;
  getRetailer(id: string): Promise<Retailer | undefined>;
  createRetailer(retailer: InsertRetailer): Promise<Retailer>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Orders
  getOrders(): Promise<OrderWithDetails[]>;
  getOrder(id: string): Promise<OrderWithDetails | undefined>;
  createOrder(order: InsertOrder): Promise<OrderWithDetails>;
  updateOrderStatus(id: string, status: string): Promise<void>;
  updateOrderStatusByOrderNumber(orderNumber: string, status: string): Promise<boolean>;
  
  // Inventory
  getInventory(): Promise<InventoryWithProduct[]>;
  getInventoryByProduct(productId: string): Promise<InventoryWithProduct | undefined>;
  updateInventory(productId: string, quantity: number): Promise<void>;
  
  // Sales Targets
  getSalesTarget(month: number, year: number): Promise<SalesTarget | undefined>;
  updateSalesTarget(month: number, year: number, currentAmount: string): Promise<void>;
  
  // Dashboard metrics
  getDashboardMetrics(): Promise<{
    totalOrders: number;
    itemsInStock: number;
    activeRetailers: number;
    avgOrderValue: number;
    lowStockItems: InventoryWithProduct[];
  }>;
}

export class MemStorage implements IStorage {
  private retailers: Map<string, Retailer> = new Map();
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private inventory: Map<string, Inventory> = new Map();
  private salesTargets: Map<string, SalesTarget> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample retailers
    const retailer1: Retailer = {
      id: "ret-1",
      name: "Supreme Grocers",
      location: "Port of Spain",
      contactNumber: "+1868-555-0101",
      email: "orders@supremegrocers.tt",
      createdAt: new Date(),
    };
    
    const retailer2: Retailer = {
      id: "ret-2", 
      name: "City Market Express",
      location: "San Fernando",
      contactNumber: "+1868-555-0102",
      email: "procurement@citymarket.tt",
      createdAt: new Date(),
    };

    const retailer3: Retailer = {
      id: "ret-3",
      name: "Fresh Mart Ltd",
      location: "Chaguanas", 
      contactNumber: "+1868-555-0103",
      email: "orders@freshmart.tt",
      createdAt: new Date(),
    };

    this.retailers.set(retailer1.id, retailer1);
    this.retailers.set(retailer2.id, retailer2);
    this.retailers.set(retailer3.id, retailer3);

    // Initialize with sample products
    const product1: Product = {
      id: "prod-1",
      name: "Rice Cakes - Original",
      description: "Original flavor rice cakes, 24 units per case",
      pricePerUnit: "14.00",
      unitsPerCase: 24,
      reorderThreshold: 20,
      createdAt: new Date(),
    };

    const product2: Product = {
      id: "prod-2",
      name: "Rice Cakes - Sesame", 
      description: "Sesame flavor rice cakes, 24 units per case",
      pricePerUnit: "16.00",
      unitsPerCase: 24,
      reorderThreshold: 20,
      createdAt: new Date(),
    };

    const product3: Product = {
      id: "prod-3",
      name: "Rice Cakes - Multigrain",
      description: "Multigrain rice cakes, 12 units per case",
      pricePerUnit: "21.00",
      unitsPerCase: 12,
      reorderThreshold: 20,
      createdAt: new Date(),
    };

    this.products.set(product1.id, product1);
    this.products.set(product2.id, product2);
    this.products.set(product3.id, product3);

    // Initialize inventory
    const inv1: Inventory = {
      id: "inv-1",
      productId: "prod-1",
      currentStock: 15,
      lastUpdated: new Date(),
    };

    const inv2: Inventory = {
      id: "inv-2", 
      productId: "prod-2",
      currentStock: 8,
      lastUpdated: new Date(),
    };

    const inv3: Inventory = {
      id: "inv-3",
      productId: "prod-3",
      currentStock: 156,
      lastUpdated: new Date(),
    };

    this.inventory.set(inv1.productId, inv1);
    this.inventory.set(inv2.productId, inv2);
    this.inventory.set(inv3.productId, inv3);

    // Initialize sales target for current month
    const currentDate = new Date();
    const salesTarget: SalesTarget = {
      id: "target-1",
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
      targetAmount: "25000.00",
      currentAmount: "18750.00",
    };

    this.salesTargets.set(`${salesTarget.month}-${salesTarget.year}`, salesTarget);

    // Initialize sample orders
    const order1: Order = {
      id: "ord-1",
      orderNumber: "ORD-2024-0156",
      retailerId: "ret-1",
      productId: "prod-1",
      quantity: 48,
      totalAmount: "672.00",
      status: "completed",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    };

    const order2: Order = {
      id: "ord-2",
      orderNumber: "ORD-2024-0155", 
      retailerId: "ret-2",
      productId: "prod-2",
      quantity: 24,
      totalAmount: "384.00",
      status: "processing",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    };

    const order3: Order = {
      id: "ord-3",
      orderNumber: "ORD-2024-0154",
      retailerId: "ret-3", 
      productId: "prod-3",
      quantity: 36,
      totalAmount: "756.00",
      status: "pending",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    };

    this.orders.set(order1.id, order1);
    this.orders.set(order2.id, order2);
    this.orders.set(order3.id, order3);
  }

  async getRetailers(): Promise<Retailer[]> {
    return Array.from(this.retailers.values());
  }

  async getRetailer(id: string): Promise<Retailer | undefined> {
    return this.retailers.get(id);
  }

  async createRetailer(insertRetailer: InsertRetailer): Promise<Retailer> {
    const id = randomUUID();
    const retailer: Retailer = {
      name: insertRetailer.name,
      location: insertRetailer.location,
      contactNumber: insertRetailer.contactNumber ?? null,
      email: insertRetailer.email ?? null,
      id,
      createdAt: new Date(),
    };
    this.retailers.set(id, retailer);
    return retailer;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      name: insertProduct.name,
      description: insertProduct.description ?? null,
      pricePerUnit: insertProduct.pricePerUnit,
      unitsPerCase: insertProduct.unitsPerCase ?? 24,
      reorderThreshold: insertProduct.reorderThreshold ?? 20,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    
    // Initialize inventory for new product
    const inventory: Inventory = {
      id: randomUUID(),
      productId: id,
      currentStock: 0,
      lastUpdated: new Date(),
    };
    this.inventory.set(id, inventory);
    
    return product;
  }

  async getOrders(): Promise<OrderWithDetails[]> {
    const orders = Array.from(this.orders.values());
    const ordersWithDetails: OrderWithDetails[] = [];

    for (const order of orders) {
      const retailer = await this.getRetailer(order.retailerId);
      const product = await this.getProduct(order.productId);
      
      if (retailer && product) {
        ordersWithDetails.push({
          ...order,
          retailer,
          product,
        });
      }
    }

    return ordersWithDetails.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getOrder(id: string): Promise<OrderWithDetails | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const retailer = await this.getRetailer(order.retailerId);
    const product = await this.getProduct(order.productId);

    if (retailer && product) {
      return {
        ...order,
        retailer,
        product,
      };
    }

    return undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<OrderWithDetails> {
    // Validate foreign keys exist
    const retailer = await this.getRetailer(insertOrder.retailerId);
    const product = await this.getProduct(insertOrder.productId);
    
    if (!retailer) {
      throw new Error(`Retailer with id ${insertOrder.retailerId} not found`);
    }
    
    if (!product) {
      throw new Error(`Product with id ${insertOrder.productId} not found`);
    }

    const id = randomUUID();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(this.orders.size + 1).padStart(4, '0')}`;
    
    const order: Order = {
      retailerId: insertOrder.retailerId,
      productId: insertOrder.productId,
      quantity: insertOrder.quantity,
      totalAmount: insertOrder.totalAmount,
      status: insertOrder.status ?? "pending",
      id,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(id, order);

    // Update inventory
    const inventory = this.inventory.get(insertOrder.productId);
    if (inventory) {
      inventory.currentStock = Math.max(0, inventory.currentStock - insertOrder.quantity);
      inventory.lastUpdated = new Date();
    }

    // Update sales target
    const currentDate = new Date();
    const targetKey = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const salesTarget = this.salesTargets.get(targetKey);
    if (salesTarget) {
      salesTarget.currentAmount = (parseFloat(salesTarget.currentAmount) + parseFloat(insertOrder.totalAmount)).toFixed(2);
    }

    // Return OrderWithDetails directly using already fetched retailer and product
    return {
      ...order,
      retailer,
      product,
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<void> {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
    }
  }

  async updateOrderStatusByOrderNumber(orderNumber: string, status: string): Promise<boolean> {
    // Find order by order number
    const orders = Array.from(this.orders.values());
    for (const order of orders) {
      if (order.orderNumber === orderNumber) {
        order.status = status;
        order.updatedAt = new Date();
        return true;
      }
    }
    return false; // Order not found
  }

  async getInventory(): Promise<InventoryWithProduct[]> {
    const inventory = Array.from(this.inventory.values());
    const inventoryWithProducts: InventoryWithProduct[] = [];

    for (const inv of inventory) {
      const product = await this.getProduct(inv.productId);
      if (product) {
        inventoryWithProducts.push({
          ...inv,
          product,
        });
      }
    }

    return inventoryWithProducts;
  }

  async getInventoryByProduct(productId: string): Promise<InventoryWithProduct | undefined> {
    const inventory = this.inventory.get(productId);
    if (!inventory) return undefined;

    const product = await this.getProduct(productId);
    if (product) {
      return {
        ...inventory,
        product,
      };
    }

    return undefined;
  }

  async updateInventory(productId: string, quantity: number): Promise<void> {
    const inventory = this.inventory.get(productId);
    if (inventory) {
      inventory.currentStock = quantity;
      inventory.lastUpdated = new Date();
    }
  }

  async getSalesTarget(month: number, year: number): Promise<SalesTarget | undefined> {
    return this.salesTargets.get(`${month}-${year}`);
  }

  async updateSalesTarget(month: number, year: number, currentAmount: string): Promise<void> {
    const targetKey = `${month}-${year}`;
    const existing = this.salesTargets.get(targetKey);
    if (existing) {
      existing.currentAmount = currentAmount;
    } else {
      const newTarget: SalesTarget = {
        id: randomUUID(),
        month,
        year,
        targetAmount: "25000.00",
        currentAmount,
      };
      this.salesTargets.set(targetKey, newTarget);
    }
  }

  async getDashboardMetrics(): Promise<{
    totalOrders: number;
    itemsInStock: number;
    activeRetailers: number;
    avgOrderValue: number;
    lowStockItems: InventoryWithProduct[];
  }> {
    const orders = await this.getOrders();
    const inventory = await this.getInventory();
    const retailers = await this.getRetailers();

    const totalOrders = orders.length;
    const itemsInStock = inventory.reduce((sum, inv) => sum + inv.currentStock, 0);
    const activeRetailers = retailers.length;
    
    const totalOrderValue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalOrderValue / totalOrders) : 0;
    
    const lowStockItems = inventory.filter(inv => inv.currentStock <= inv.product.reorderThreshold);

    return {
      totalOrders,
      itemsInStock,
      activeRetailers,
      avgOrderValue,
      lowStockItems,
    };
  }
}

export const storage = new MemStorage();
