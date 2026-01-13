import { db } from "./db";
import { users, companies, charges, invoices, type User, type InsertUser, type Company, type InsertCompany, type Charge, type InsertCharge, type Invoice, type InsertInvoice } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;

  // Charges
  getCharges(companyId?: number): Promise<(Charge & { company: Company })[]>;
  getCharge(id: number): Promise<Charge | undefined>;
  createCharge(charge: InsertCharge): Promise<Charge>;
  payCharge(id: number, paymentMethod: string, paymentDate: string): Promise<Charge | undefined>;

  // Invoices
  getInvoices(companyId?: number): Promise<(Invoice & { charge: Charge; company: Company })[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async getCharges(companyId?: number): Promise<(Charge & { company: Company })[]> {
    const query = db.select({
        id: charges.id,
        companyId: charges.companyId,
        title: charges.title,
        amount: charges.amount,
        dueDate: charges.dueDate,
        status: charges.status,
        boletoFile: charges.boletoFile,
        paymentMethod: charges.paymentMethod,
        paymentDate: charges.paymentDate,
        createdAt: charges.createdAt,
        company: companies
      })
      .from(charges)
      .innerJoin(companies, eq(charges.companyId, companies.id))
      .orderBy(desc(charges.createdAt));

    if (companyId) {
      query.where(eq(charges.companyId, companyId));
    }

    // @ts-ignore
    return await query; 
  }

  async getCharge(id: number): Promise<Charge | undefined> {
    const [charge] = await db.select().from(charges).where(eq(charges.id, id));
    return charge;
  }

  async createCharge(charge: InsertCharge): Promise<Charge> {
    const [newCharge] = await db.insert(charges).values(charge as any).returning();
    return newCharge;
  }

  async payCharge(id: number, paymentMethod: string, paymentDate: string): Promise<Charge | undefined> {
    const [updatedCharge] = await db
      .update(charges)
      .set({ 
        status: "paid",
        paymentMethod,
        paymentDate,
      })
      .where(eq(charges.id, id))
      .returning();
    return updatedCharge;
  }

  async getInvoices(companyId?: number): Promise<(Invoice & { charge: Charge; company: Company })[]> {
    const query = db.select({
        id: invoices.id,
        chargeId: invoices.chargeId,
        companyId: invoices.companyId,
        fileUrl: invoices.fileUrl,
        createdAt: invoices.createdAt,
        charge: charges,
        company: companies
      })
      .from(invoices)
      .innerJoin(charges, eq(invoices.chargeId, charges.id))
      .innerJoin(companies, eq(invoices.companyId, companies.id))
      .orderBy(desc(invoices.createdAt));

    if (companyId) {
      query.where(eq(invoices.companyId, companyId));
    }

    // @ts-ignore
    return await query;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice as any).returning();
    return newInvoice;
  }
}

export const storage = new DatabaseStorage();
