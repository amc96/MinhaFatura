# MinhaFatura

## Overview

MinhaFatura (FinControl) is a financial dashboard application for managing company invoices and charges. It provides a dual-view system where administrators can manage multiple companies and their charges, while company users can view their own billing information. The application is built as a full-stack TypeScript solution with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Authentication**: Passport.js with local strategy, session-based auth using express-session
- **Password Security**: Scrypt hashing with random salts
- **File Uploads**: Multer for handling file uploads (boletos and invoices)
- **API Design**: RESTful endpoints defined in shared/routes.ts with Zod schemas for type-safe validation

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location**: shared/schema.ts contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (output to ./migrations)

### Shared Code Architecture
- **Schema Sharing**: Database schemas and Zod validation schemas are shared between frontend and backend via the @shared path alias
- **Type Safety**: End-to-end type safety from database to API to frontend using drizzle-zod for automatic schema generation

### Role-Based Access Control
- **Admin Role**: Full access to dashboard, companies, charges, and users management
- **Company Role**: Limited access to view only their own charges (portal view)

### Key Data Models
- **Users**: Authentication credentials with role-based access (admin/company)
- **Companies**: Business entities with contact information (CNPJ/CPF, email, address)
- **Charges**: Financial records with amount, due date, status (pending/paid/overdue), and file attachments

## External Dependencies

### Database
- PostgreSQL database (required, connection via DATABASE_URL environment variable)
- connect-pg-simple for session storage in PostgreSQL

### Frontend Libraries
- Radix UI primitives for accessible component foundations
- Recharts for dashboard analytics charts
- date-fns for date formatting
- Embla Carousel for carousel functionality
- Lucide React for icons

### Build Tools
- Vite for frontend development and building
- esbuild for server bundling in production
- TSX for TypeScript execution in development

### Development Environment
- Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)