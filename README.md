# DemoApp - Admin Dashboard

A Next.js 16 dashboard application with Auth.js (NextAuth) authentication, role-based access control, and admin user management.

## Features

- **Google OAuth Authentication**: Sign in with Google using Auth.js
- **Role-Based Access Control**: User and Admin roles with protected routes
- **Admin User Management**: View all users, change roles, and impersonate users
- **Admin Impersonation**: Sign in as any non-admin user using ADMIN_PASS
- **Mobile-Friendly Design**: Responsive UI that works on all devices
- **SQLite Database**: Easy local development with Prisma ORM

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: Auth.js (NextAuth v5 beta)
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Copy the example environment file:

```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:

   - **AUTH_SECRET**: Generate with `openssl rand -base64 32`
   - **AUTH_GOOGLE_ID** and **AUTH_GOOGLE_SECRET**: Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - **ADMIN_PASS**: Set a secure password for admin impersonation

4. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

5. Initialize the database:

```bash
pnpm db:migrate
```

6. (Optional) Seed the database with test users:

```bash
pnpm db:seed
```

This creates:
- Admin user: admin@example.com
- Test users: user1@example.com, user2@example.com, user3@example.com

7. Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Features

### Accessing Admin Features

1. Sign in with Google
2. The first user can be made an admin via database seed or direct database update
3. Admin users will see "Manage Users" in the header dropdown menu

### User Management

Navigate to **Admin > Manage Users** to:
- View all registered users
- Change user roles (Admin/User)
- Search users by name or email

### Impersonating Users

Admins can sign in as any non-admin user:
1. Go to Admin > Manage Users
2. Click "Sign in as" next to a user
3. Enter the ADMIN_PASS from your environment variables
4. You'll be signed in as that user with an "Impersonating" badge
5. Sign out to return to your admin account

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes without migration
- `pnpm db:seed` - Seed database with test data
- `pnpm db:studio` - Open Prisma Studio

## Project Structure

```
/
|-- app/
|   |-- (dashboard)/         # Protected dashboard routes
|   |   |-- admin/users/     # Admin user management
|   |   |-- analytics/
|   |   |-- documents/
|   |   |-- projects/
|   |   |-- settings/
|   |   |-- team/
|   |   |-- layout.tsx       # Dashboard layout with auth check
|   |   |-- page.tsx         # Dashboard home
|   |-- api/
|   |   |-- admin/users/     # Admin API routes
|   |   |-- auth/            # Auth.js API routes
|   |-- auth/                # Auth pages (signin, error)
|   |-- layout.tsx           # Root layout
|   |-- globals.css          # Global styles
|-- components/
|   |-- layout/              # Layout components (header, sidebar)
|   |-- providers/           # React context providers
|   |-- ui/                  # UI components
|-- lib/
|   |-- auth.ts              # Auth.js configuration
|   |-- prisma.ts            # Prisma client
|   |-- utils.ts             # Utility functions
|-- prisma/
|   |-- schema.prisma        # Database schema
|   |-- seed.ts              # Database seed script
|-- types/
|   |-- next-auth.d.ts       # Auth.js type extensions
```

## Customization

### Branding

- Update logo in `components/layout/header.tsx`
- Update colors in `app/globals.css` CSS variables
- Update metadata in `app/layout.tsx`

### Navigation

- Update sidebar items in `components/layout/sidebar.tsx`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | SQLite database path | Yes |
| AUTH_SECRET | Auth.js secret key | Yes |
| AUTH_GOOGLE_ID | Google OAuth client ID | Yes |
| AUTH_GOOGLE_SECRET | Google OAuth client secret | Yes |
| ADMIN_PASS | Password for admin impersonation | Yes |

## Security Notes

- Never commit your `.env` file
- Use strong, unique values for AUTH_SECRET and ADMIN_PASS
- In production, consider using a more robust database (PostgreSQL, MySQL)
- Admin impersonation should be restricted and audited in production environments
