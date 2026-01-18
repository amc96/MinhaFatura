import { db } from "./db";
import { users, companies, charges, invoices, contracts, equipment, type User, type InsertUser, type Company, type InsertCompany, type Charge, type InsertCharge, type Invoice, type InsertInvoice, type Contract, type InsertContract, type Equipment, type InsertEquipment } from "@shared/schema";
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
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // Contracts
  getContracts(companyId?: number): Promise<(Contract & { company: Company })[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  deleteContract(id: number): Promise<boolean>;

  // Equipment
  getEquipment(companyId?: number): Promise<(Equipment & { company: Company })[]>;
  createEquipment(eq: InsertEquipment): Promise<Equipment>;
  updateEquipment(id: number, eq: Partial<InsertEquipment>): Promise<Equipment | undefined>;
  deleteEquipment(id: number): Promise<boolean>;

  // Charges
  getCharges(companyId?: number): Promise<(Charge & { company: Company })[]>;
  getCharge(id: number): Promise<Charge | undefined>;
  createCharge(charge: InsertCharge): Promise<Charge>;
  updateCharge(id: number, charge: Partial<InsertCharge>): Promise<Charge | undefined>;
  deleteCharge(id: number): Promise<boolean>;
  payCharge(id: number, paymentMethod: string, paymentDate: string): Promise<Charge | undefined>;

  // Invoices
  getInvoices(companyId?: number): Promise<(Invoice & { charge: Charge; company: Company })[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  deleteInvoice(id: number): Promise<boolean>;
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
    const [newUser] = await db.insert(users).values({
      ...user,
      forcePasswordChange: user.forcePasswordChange ?? true
    }).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
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

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(company)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const [deleted] = await db.delete(companies).where(eq(companies.id, id)).returning();
    return !!deleted;
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

  async updateCharge(id: number, charge: Partial<InsertCharge>): Promise<Charge | undefined> {
    const [updatedCharge] = await db
      .update(charges)
      .set(charge as any)
      .where(eq(charges.id, id))
      .returning();
    return updatedCharge;
  }

  async deleteCharge(id: number): Promise<boolean> {
    const [deleted] = await db.delete(charges).where(eq(charges.id, id)).returning();
    return !!deleted;
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

  async deleteInvoice(id: number): Promise<boolean> {
    const [deleted] = await db.delete(invoices).where(eq(invoices.id, id)).returning();
    return !!deleted;
  }

  async getContracts(companyId?: number): Promise<(Contract & { company: Company })[]> {
    const query = db.select({
        id: contracts.id,
        companyId: contracts.companyId,
        type: contracts.type,
        duration: contracts.duration,
        fileUrl: contracts.fileUrl,
        createdAt: contracts.createdAt,
        company: companies
      })
      .from(contracts)
      .innerJoin(companies, eq(contracts.companyId, companies.id))
      .orderBy(desc(contracts.createdAt));

    if (companyId) {
      query.where(eq(contracts.companyId, companyId));
    }

    // @ts-ignore
    return await query;
  }

  async createContract(contract: InsertContract): Promise<Contract> {
    const [newContract] = await db.insert(contracts).values(contract as any).returning();
    return newContract;
  }

  async deleteContract(id: number): Promise<boolean> {
    const [deleted] = await db.delete(contracts).where(eq(contracts.id, id)).returning();
    return !!deleted;
  }

  async getEquipment(companyId?: number): Promise<(Equipment & { company: Company })[]> {
    const query = db.select({
        id: equipment.id,
        companyId: equipment.companyId,
        name: equipment.name,
        model: equipment.model,
        serialNumber: equipment.serialNumber,
        status: equipment.status,
        lastMaintenance: equipment.lastMaintenance,
        nextMaintenance: equipment.nextMaintenance,
        createdAt: equipment.createdAt,
        company: companies
      })
      .from(equipment)
      .innerJoin(companies, eq(equipment.companyId, companies.id))
      .orderBy(desc(equipment.createdAt));

    if (companyId) {
      query.where(eq(equipment.companyId, companyId));
    }

    // @ts-ignore
    return await query;
  }

  async createEquipment(item: InsertEquipment): Promise<Equipment> {
    const [newItem] = await db.insert(equipment).values(item as any).returning();
    return newItem;
  }

  async updateEquipment(id: number, item: Partial<InsertEquipment>): Promise<Equipment | undefined> {
    const [updated] = await db
      .update(equipment)
      .set(item as any)
      .where(eq(equipment.id, id))
      .returning();
    return updated;
  }

  async deleteEquipment(id: number): Promise<boolean> {
    const [deleted] = await db.delete(equipment).where(eq(equipment.id, id)).returning();
    return !!deleted;
  }
}

export const storage = new DatabaseStorage();
