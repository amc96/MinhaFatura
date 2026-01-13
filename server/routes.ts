import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import express from "express";
import fs from "fs";

// Setup upload directory
const uploadDir = path.join(process.cwd(), "client/public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  })
});

import { hashPassword } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // SEED DATA
  if (app.get("env") === "development") {
    const existingAdmin = await storage.getUserByUsername("admin");
    if (!existingAdmin) {
      console.log("Semeando banco de dados...");
      const adminPassword = await hashPassword("admin123");
      await storage.createUser({
        username: "admin",
        password: adminPassword,
        role: "admin"
      });

      const companyPassword = await hashPassword("tech123");
      const company = await storage.createCompany({
        name: "Tech Solutions Ltda",
        document: "12.345.678/0001-90",
        email: "contato@techsolutions.com",
        address: "Av. Paulista, 1000 - SP"
      });
      
      const user = await storage.createUser({
        username: "tech",
        password: companyPassword,
        role: "company",
        companyId: company.id
      });

      await storage.createCharge({
        companyId: company.id,
        title: "Taxa de Serviço - Jan 2026",
        amount: 1500.00,
        dueDate: "2026-01-30",
        status: "pending",
      });
      
      await storage.createCharge({
        companyId: company.id,
        title: "Licença de Software - Q1",
        amount: 5000.00,
        dueDate: "2026-02-15",
        status: "pending",
      });
      
      console.log("Semeadura completa: admin/admin123, tech/tech123");
    }
  }

  // === COMPANIES ===
  app.get(api.companies.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const companies = await storage.getCompanies();
    res.json(companies);
  });

  app.post(api.companies.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const input = api.companies.create.input.parse(req.body);
      const company = await storage.createCompany(input);
      res.status(201).json(company);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: err.errors });
      }
    }
  });

  // === CHARGES ===
  app.get(api.charges.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    let companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    if (req.user!.role === 'company') {
      companyId = req.user!.companyId!;
    }

    const charges = await storage.getCharges(companyId);
    res.json(charges);
  });

  app.post(api.charges.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const input = api.charges.create.input.parse(req.body);
      const charge = await storage.createCharge(input);
      res.status(201).json(charge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: err.errors });
      }
    }
  });

  // === INVOICES ===
  app.get(api.invoices.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    let companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    if (req.user!.role === 'company') {
      companyId = req.user!.companyId!;
    }

    const invoices = await storage.getInvoices(companyId);
    res.json(invoices);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const input = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice(input);
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: err.errors });
      }
    }
  });

  app.patch(api.charges.pay.path.replace(':id', ':id'), async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const input = api.charges.pay.input.parse(req.body);
      const charge = await storage.payCharge(id, input.paymentMethod, input.paymentDate);
      
      if (!charge) {
        return res.status(404).json({ message: "Cobrança não encontrada" });
      }
      
      res.json(charge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: err.errors });
      } else {
        res.status(500).json({ message: "Erro ao processar pagamento" });
      }
    }
  });

  // === UPLOAD ===
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.file) return res.status(400).json({ message: "Nenhum arquivo enviado" });
    
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  return httpServer;
}
