import { pgTable, text, serial, integer, boolean, timestamp, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "company"] }).default("company").notNull(),
  companyId: integer("company_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  document: text("document").notNull(), // CNPJ/CPF
  email: text("email").notNull(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const charges = pgTable("charges", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  status: text("status", { enum: ["pending", "paid", "overdue"] }).default("pending").notNull(),
  boletoFile: text("boleto_file"),
  paymentMethod: text("payment_method"),
  paymentDate: date("payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  chargeId: integer("charge_id").notNull(),
  companyId: integer("company_id").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  charges: many(charges),
  invoices: many(invoices),
}));

export const chargesRelations = relations(charges, ({ one, many }) => ({
  company: one(companies, {
    fields: [charges.companyId],
    references: [companies.id],
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  charge: one(charges, {
    fields: [invoices.chargeId],
    references: [charges.id],
  }),
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertChargeSchema = createInsertSchema(charges).omit({ id: true, createdAt: true }).extend({
  amount: z.coerce.number(),
});
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Charge = typeof charges.$inferSelect;
export type InsertCharge = z.infer<typeof insertChargeSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
