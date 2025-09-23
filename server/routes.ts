import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRetailerSchema, insertProductSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Retailers routes
  app.get("/api/retailers", async (req, res) => {
    try {
      const retailers = await storage.getRetailers();
      res.json(retailers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retailers" });
    }
  });

  app.post("/api/retailers", async (req, res) => {
    try {
      const retailerData = insertRetailerSchema.parse(req.body);
      const retailer = await storage.createRetailer(retailerData);
      res.status(201).json(retailer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid retailer data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create retailer" });
      }
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid order data", details: error.errors });
      } else if (error instanceof Error && error.message.includes("not found")) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create order" });
      }
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: "Status is required" });
      }

      // Try to update by ID first (UUID), then by order number
      await storage.updateOrderStatus(id, status);
      const updatedByOrderNumber = await storage.updateOrderStatusByOrderNumber(id, status);
      
      if (!updatedByOrderNumber) {
        // Check if we actually updated by ID by looking for the order
        const order = await storage.getOrder(id);
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.patch("/api/inventory/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ error: "Valid quantity is required" });
      }

      await storage.updateInventory(productId, quantity);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update inventory" });
    }
  });

  // Sales target routes
  app.get("/api/sales-target/:month/:year", async (req, res) => {
    try {
      const month = parseInt(req.params.month);
      const year = parseInt(req.params.year);
      
      const salesTarget = await storage.getSalesTarget(month, year);
      if (!salesTarget) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      
      res.json(salesTarget);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales target" });
    }
  });

  // Dashboard metrics route
  app.get("/api/dashboard/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard metrics" });
    }
  });

  // Export routes
  app.get("/api/export/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const csvData = [
        ['Order Number', 'Retailer', 'Product', 'Quantity', 'Total Amount', 'Status', 'Created At'].join(','),
        ...orders.map(order => [
          order.orderNumber,
          order.retailer.name,
          order.product.name,
          order.quantity,
          `$${order.totalAmount}`,
          order.status,
          new Date(order.createdAt!).toLocaleDateString()
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders-export.csv');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export orders" });
    }
  });

  app.get("/api/export/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      const csvData = [
        ['Product', 'Current Stock', 'Reorder Threshold', 'Price Per Unit', 'Status'].join(','),
        ...inventory.map(inv => [
          inv.product.name,
          inv.currentStock,
          inv.product.reorderThreshold,
          `$${inv.product.pricePerUnit}`,
          inv.currentStock <= inv.product.reorderThreshold ? 'Low Stock' : 'In Stock'
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-export.csv');
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ error: "Failed to export inventory" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
