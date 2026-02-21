# ACIK Management System - Next.js 15

Modern management system rebuilt with Next.js 15, Supabase, and Prisma.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (Postgres)
- **ORM**: Prisma
- **Auth**: Supabase Auth
- **Realtime**: Supabase Realtime
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Getting Started

### 1. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API and copy:
   - Project URL
   - Anon Key
3. Go to Settings > Database and copy the connection string

### 2. Configure Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=your-connection-string
DIRECT_URL=your-direct-connection-string
```

### 3. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) View database
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Data Migration

To migrate data from the old MongoDB database:

```bash
# Install migration dependencies
npm install mongoose

# Set MongoDB connection string
export MONGODB_URI=mongodb://...

# Run migration
npx ts-node scripts/migrate-data.ts
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API Route Handlers
├── components/
│   ├── auth/              # AuthProvider
│   ├── layout/            # Sidebar, Header
│   └── ui/                # Reusable components
├── hooks/                 # Custom hooks
├── lib/
│   ├── supabase/         # Supabase clients
│   └── prisma/           # Prisma client
└── types/                # TypeScript types
```

## Features

- Dashboard with statistics
- Project management (CRUD, Kanban view)
- Task management (CRUD, Kanban board)
- Member management
- Admin panel with user management
- Real-time updates with Supabase
- Role-based access control

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

```bash
vercel deploy --prod
```

## Demo Accounts

After seeding:
- Admin: admin@acik.com / password123
- President: president@acik.com / password123
- CFO: cfo@acik.com / password123
- PM: pm@acik.com / password123

## License

MIT
