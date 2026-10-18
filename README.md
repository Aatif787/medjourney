# MedJourney — Medical Travel & Healthcare Coordination Platform

MedJourney is a full-stack web application designed for medical travel coordination. It connects patients with accredited international hospitals, board-certified surgeons and specialists, and coordinates medical travel estimates and logistics.

The platform includes a patient-facing portal and a secure back-office Content Management System (CMS) for patient coordinators and clinic administrators.

---

## Architecture & Technology Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React 19 application with Server-Side Rendering and hybrid routing)
- **Routing & State**: [TanStack Router](https://tanstack.com/router) (type-safe file-based routing) and [TanStack Query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with curated typographic tokens (Lora & Source Sans 3)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) primitives with [Lucide React](https://lucide.dev/) icons
- **Database & Authentication**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security, Storage Buckets, and Auth)
- **ORM & Migrations**: [Drizzle ORM](https://orm.drizzle.team/)
- **Server Deployment**: [Nitro](https://nitro.build/) engine (targeting Cloudflare Pages/Workers or Node environments)

---

## Core Features

### 1. Patient Portal

- **Treatment Catalog**: Organized by specialty (cardiology, orthopaedics, oncology, cosmetic, dental, fertility) with transparent price indications and recovery expectations.
- **Hospitals & Facilities**: Directory of accredited clinics with facility highlights, international accreditations (JCI, ISO), languages spoken, and affiliated departments.
- **Doctor Directory**: Verified specialist profiles, qualifications, board certifications, and language proficiencies.
- **Enquiry Workflow**: Multi-step patient intake modal to request treatment estimates, submit health history summaries, and coordinate with patient advisors.
- **Medical Journal / Blog**: Editorial articles and patient travel guides with Markdown rendering and SEO-optimized metadata.

### 2. Admin Back-Office (`/admin`)

- **Role-Based Access Control**: Granular access levels (`admin`, `coordinator`, `editor`) enforced by PostgreSQL RLS.
- **Enquiry Pipeline**: Track patient leads, assign coordinators, log case notes, and manage status transitions (`new`, `contacted`, `quoted`, `scheduled`, `completed`, `cancelled`).
- **Content Management**: Full CRUD interface for hospitals, physicians, procedures, medical categories, and editorial posts.
- **Media Management**: Asset manager for clinic photos and staff headshots utilizing Supabase Storage.
- **Site Settings**: Centralized configuration for brand identity, support contact emails, emergency phone lines, and operating regions.

---

## Security Model

1. **Row Level Security (RLS)**: Public routes query data through server functions (`createServerFn`) via publishable client credentials restricted exclusively to rows marked `published`.
2. **Back-office Authorization**: Admin mutations are executed through authenticated browser sessions verified by database RLS helper functions (`is_staff()`, `has_role()`).
3. **Storage Isolation**: Media assets are stored in private buckets and served through server-side proxy routes to prevent direct unauthorized access.

---

## Getting Started

### Prerequisites

- Node.js (v20+ recommended) or [Bun](https://bun.sh/) (v1.2+)
- A Supabase project with database migrations applied

### Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Client Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-publishable-key

# Supabase Server / Admin Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Database Migrations (Optional for Drizzle)
DATABASE_URL=postgresql://postgres:password@your-db-host:5432/postgres

# Cron / Automation Security (Optional)
CRON_SECRET=your-secure-cron-secret
```

### Installation

```bash
# Using Bun
bun install

# Or using npm
npm install
```

### Development

```bash
bun dev
# or
npm run dev
```

The application will start at `http://localhost:8080`.

### Running Tests

```bash
bun test
# or
npm run test
```

### Building for Production

```bash
bun run build
# or
npm run build
```

---

## Directory Structure

```
├── drizzle/              # Drizzle ORM schema and database migrations
├── public/               # Public static assets and robots.txt
├── src/
│   ├── assets/           # Application assets & photography attribution
│   ├── components/       # UI components & shared site chrome (Header, Footer, Modals)
│   ├── hooks/            # Custom React hooks
│   ├── integrations/
│   │   └── supabase/     # Supabase client, server admin instance, & middleware
│   ├── lib/              # Public data loaders, error logging, brand tokens, and utilities
│   ├── routes/           # TanStack Start file-based route definitions
│   │   ├── _authenticated/admin/ # Staff CMS and administrative dashboard
│   │   └── __root.tsx    # Root application shell and metadata
│   ├── server.ts         # Server-side entry and error handlers
│   └── styles.css        # Tailwind design tokens and custom styles
├── vite.config.ts        # Vite and TanStack Start build configuration
└── package.json
```

---

## License

Private repository. All rights reserved.
