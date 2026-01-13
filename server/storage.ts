import { db } from "./db";
import { users, companies, charges, type User, type InsertUser, type Company, type InsertCompany, type Charge, type InsertCharge } from "@shared/schema";
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
  createCharge(charge: InsertCharge): Promise<Charge>;
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
        invoiceFile: charges.invoiceFile,
        createdAt: charges.createdAt,
        company: companies
      })
      .from(charges)
      .innerJoin(companies, eq(charges.companyId, companies.id))
      .orderBy(desc(charges.createdAt));

    if (companyId) {
      query.where(eq(charges.companyId, companyId));
    }

    // @ts-ignore - Drizzle join type inference can be tricky but structure matches
    return await query; 
  }

  async createCharge(charge: InsertCharge): Promise<Charge> {
    const [newCharge] = await db.insert(charges).values(charge).returning();
    return newCharge;
  }
}

export const storage = new DatabaseStorage();
