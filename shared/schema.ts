import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const retailers = pgTable("retailers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  contactNumber: text("contact_number"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  unitsPerCase: integer("units_per_case").notNull().default(24),
  reorderThreshold: integer("reorder_threshold").notNull().default(20),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  retailerId: varchar("retailer_id").references(() => retailers.id).notNull(),
  productId: varchar("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const salesTargets = pgTable("sales_targets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull().default("25000.00"),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
});

export const insertRetailerSchema = createInsertSchema(retailers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export type InsertRetailer = z.infer<typeof insertRetailerSchema>;
export type Retailer = typeof retailers.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type SalesTarget = typeof salesTargets.$inferSelect;

export interface OrderWithDetails extends Order {
  retailer: Retailer;
  product: Product;
}

export interface InventoryWithProduct extends Inventory {
  product: Product;
}

// WhatsApp Configuration
export interface WhatsAppConfig {
  enabled: boolean;
  recipients: string[];
  sendPOAlerts: boolean;
  sendLowStockAlerts: boolean;
}

export const insertWhatsAppConfigSchema = z.object({
  enabled: z.boolean().default(false),
  recipients: z.array(z.string()).default(['+18685550199']),
  sendPOAlerts: z.boolean().default(true),
  sendLowStockAlerts: z.boolean().default(true),
});

export type InsertWhatsAppConfig = z.infer<typeof insertWhatsAppConfigSchema>;
