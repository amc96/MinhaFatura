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
      
      await storage.createUser({
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
  app.get('/api/cnpj/:cnpj', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    const cnpj = req.params.cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) return res.status(400).json({ message: "CNPJ inválido" });
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!response.ok) throw new Error('Falha ao buscar CNPJ');
      const data = await response.json() as any;
      res.json({
        name: data.razao_social,
        email: data.email || "",
        phone: data.ddd_telefone_1 || "",
        whatsapp: data.ddd_telefone_1 || "",
        address: `${data.logradouro}, ${data.numero}${data.complemento ? ' - ' : ''}${data.complemento} - ${data.bairro}, ${data.municipio}/${data.uf}`,
        cnpj: data.cnpj,
        stateRegistration: data.inscricao_estadual || ""
      });
    } catch (err) {
      res.status(500).json({ message: "Erro ao buscar dados do CNPJ" });
    }
  });

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

  app.patch('/api/companies/:id', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const company = await storage.updateCompany(id, req.body);
      if (!company) return res.status(404).json({ message: "Empresa não encontrada" });
      res.json(company);
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar empresa" });
    }
  });

  app.delete('/api/companies/:id', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteCompany(id);
      if (!success) return res.status(404).json({ message: "Empresa não encontrada" });
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir empresa" });
    }
  });

  // === CHARGES ===
  app.patch('/api/charges/:id', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const charge = await storage.updateCharge(id, req.body);
      if (!charge) return res.status(404).json({ message: "Cobrança não encontrada" });
      res.json(charge);
    } catch (err) {
      res.status(500).json({ message: "Erro ao atualizar cobrança" });
    }
  });

  app.delete('/api/charges/:id', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteCharge(id);
      if (!success) return res.status(404).json({ message: "Cobrança não encontrada" });
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir cobrança" });
    }
  });

  // === INVOICES ===
  app.delete('/api/invoices/:id', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteInvoice(id);
      if (!success) return res.status(404).json({ message: "Nota fiscal não encontrada" });
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir nota fiscal" });
    }
  });
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
      const { recurringCount = 1, intervalDays = 30, installments, ...chargeData } = input as any;
      
      const createdCharges = [];
      const startDate = new Date(chargeData.dueDate);

      for (let i = 0; i < recurringCount; i++) {
        let dueDate: string;
        let boletoFile: string | null = chargeData.boletoFile;

        if (installments && installments[i]) {
          dueDate = installments[i].dueDate;
          boletoFile = installments[i].boletoFile || chargeData.boletoFile;
        } else {
          const d = new Date(startDate);
          d.setDate(startDate.getDate() + (i * intervalDays));
          dueDate = d.toISOString().split('T')[0];
        }
        
        const charge = await storage.createCharge({
          ...chargeData,
          dueDate,
          boletoFile,
          title: recurringCount > 1 ? `${chargeData.title} (${i + 1}/${recurringCount})` : chargeData.title,
        });
        createdCharges.push(charge);
      }

      res.status(201).json(recurringCount === 1 ? createdCharges[0] : createdCharges);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: err.errors });
      } else {
        res.status(500).json({ message: "Erro ao criar cobrança(s)" });
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
      const invoice = await storage.createInvoice(input as any);
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: "Dados inválidos", errors: err.errors });
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

  // === CONTRACTS ===
  app.get('/api/contracts', async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    let companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    if (req.user!.role === 'company') {
      companyId = req.user!.companyId!;
    }

    const contracts = await storage.getContracts(companyId);
    res.json(contracts);
  });

  app.post('/api/contracts', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const contract = await storage.createContract(req.body);
      res.status(201).json(contract);
    } catch (err) {
      res.status(500).json({ message: "Erro ao criar contrato" });
    }
  });

  app.delete('/api/contracts/:id', async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    try {
      const id = Number(req.params.id);
      const success = await storage.deleteContract(id);
      if (!success) return res.status(404).json({ message: "Contrato não encontrado" });
      res.sendStatus(204);
    } catch (err) {
      res.status(500).json({ message: "Erro ao excluir contrato" });
    }
  });

  return httpServer;
}
