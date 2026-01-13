import { z } from 'zod';
import { insertUserSchema, insertCompanySchema, insertChargeSchema, insertInvoiceSchema, users, companies, charges, invoices } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.object({ message: z.string() }),
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  companies: {
    list: {
      method: 'GET' as const,
      path: '/api/companies',
      responses: {
        200: z.array(z.custom<typeof companies.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/companies',
      input: insertCompanySchema,
      responses: {
        201: z.custom<typeof companies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/companies/:id',
      responses: {
        200: z.custom<typeof companies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  charges: {
    list: {
      method: 'GET' as const,
      path: '/api/charges',
      input: z.object({
        companyId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof charges.$inferSelect & { company: typeof companies.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/charges',
      input: insertChargeSchema,
      responses: {
        201: z.custom<typeof charges.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    pay: {
      method: 'PATCH' as const,
      path: '/api/charges/:id/pay',
      input: z.object({
        paymentMethod: z.string().min(1, "Forma de pagamento é obrigatória"),
        paymentDate: z.string().min(1, "Data de pagamento é obrigatória"),
      }),
      responses: {
        200: z.custom<typeof charges.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/upload',
      responses: {
        200: z.object({ url: z.string() }),
        400: z.object({ message: z.string() }),
      },
    },
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices',
      input: z.object({
        companyId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect & { charge: typeof charges.$inferSelect; company: typeof companies.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices',
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
