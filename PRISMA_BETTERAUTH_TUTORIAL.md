# Complete Prisma + Better Auth Tutorial

A comprehensive step-by-step guide for setting up Prisma ORM with Better Auth authentication in a Next.js 16 application with PostgreSQL.

---

## Table of Contents

1. [Overview and Architecture](#1-overview-and-architecture)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-Step Installation](#3-step-by-step-installation)
4. [Prisma Configuration](#4-prisma-configuration)
5. [Better Auth Integration](#5-better-auth-integration)
6. [Database Schema Deep Dive](#6-database-schema-deep-dive)
7. [Essential Prisma Commands](#7-essential-prisma-commands)
8. [Prisma Studio Guide](#8-prisma-studio-guide)
9. [Seeding Data](#9-seeding-data)
10. [Environment Variables](#10-environment-variables)
11. [Project File Structure](#11-project-file-structure)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Overview and Architecture

This project uses a modern authentication stack combining:

- **Next.js 16.1.1** - React framework with App Router
- **Prisma 7.2.0** - Type-safe ORM for database operations
- **Better Auth 1.4.10** - Modern authentication library
- **PostgreSQL 18** - Robust relational database

### Architecture Diagram

```mermaid
flowchart TB
    subgraph frontend [Frontend - Next.js 16]
        Pages[Pages/Components]
    end
    
    subgraph backend [Backend Layer]
        Auth[Better Auth]
        Prisma[Prisma Client]
    end
    
    subgraph database [Database]
        PG[(PostgreSQL)]
    end
    
    Pages --> Auth
    Auth --> Prisma
    Prisma --> PG
```

### How It Works

1. **User Request**: Frontend components make authentication requests
2. **Better Auth**: Handles authentication logic (login, register, sessions)
3. **Prisma Adapter**: Better Auth uses Prisma to persist auth data
4. **PostgreSQL**: Stores all user, session, and account data

---

## 2. Prerequisites

Before starting, ensure you have:

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| npm | 9+ | Package manager |
| PostgreSQL | 18 | Database server |

### PostgreSQL Setup

If PostgreSQL is not installed, follow the guide in `POSTGRES_SETUP.md` or:

1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember your `postgres` user password
4. Create a database called `myapp_db`

**Quick Database Creation:**
```sql
-- In psql or pgAdmin
CREATE DATABASE myapp_db;
```

**Verify PostgreSQL is running:**
```powershell
Get-Service postgresql-x64-18
```

---

## 3. Step-by-Step Installation

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest my-app
cd my-app
```

Choose these options:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes

### Step 2: Install Prisma Packages

```bash
# Install Prisma CLI as dev dependency
npm install prisma --save-dev

# Install Prisma Client and PostgreSQL adapter
npm install @prisma/client @prisma/adapter-pg
```

### Step 3: Install Better Auth

```bash
npm install better-auth
```

### Step 4: Install Additional Dependencies

```bash
# For running seed scripts with TypeScript
npm install tsx --save-dev
```

### Complete Dependencies

Your `package.json` should include:

```json
{
  "dependencies": {
    "@prisma/adapter-pg": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "better-auth": "^1.4.10",
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "prisma": "^7.2.0",
    "tsx": "^4.7.0",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Step 5: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema file
- `.env` - Environment variables file

---

## 4. Prisma Configuration

### 4.1 Schema File (`prisma/schema.prisma`)

The schema defines your database structure. This setup includes Better Auth models plus custom models.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ==========================================
// BETTER AUTH MODELS
// These models are required by Better Auth
// ==========================================

model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@index([userId])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId])
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([identifier])
  @@map("verification")
}

// ==========================================
// CUSTOM MODELS
// Add your own models below
// ==========================================

model BlogPost {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("blog_post")
}
```

**Key Points:**
- `@@map("table_name")` - Maps model to lowercase table names
- `@id` - Primary key
- `@@unique` - Unique constraint
- `@@index` - Database index for performance
- `onDelete: Cascade` - Deletes related records when parent is deleted

### 4.2 Prisma Config File (`prisma.config.ts`)

This file configures Prisma's behavior:

```typescript
// prisma.config.ts

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

**What each option does:**
- `schema` - Path to your schema file
- `migrations.path` - Where migration files are stored
- `migrations.seed` - Command to run when seeding
- `datasource.url` - Database connection string from environment

### 4.3 Database Client (`lib/db.ts`)

The singleton pattern prevents multiple Prisma Client instances in development:

```typescript
// lib/db.ts

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

// Create PostgreSQL adapter with connection string
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

// Singleton function to create Prisma Client
const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

// Declare global type for TypeScript
declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

// Use existing instance or create new one
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// In development, store instance globally to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
```

**Why Singleton Pattern?**
- Next.js hot-reloads in development
- Each reload would create a new database connection
- This pattern reuses the existing connection
- Prevents "too many connections" errors

---

## 5. Better Auth Integration

### 5.1 Auth Configuration (`lib/auth.ts`)

Better Auth connects to your database through the Prisma adapter:

```typescript
// lib/auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
});
```

**How It Works:**

1. **Import prismaAdapter** - Built-in adapter from Better Auth
2. **Pass your Prisma client** - The singleton instance from `db.ts`
3. **Specify provider** - Tells Better Auth which database you're using

### 5.2 Better Auth Models Explained

Better Auth requires these 4 models in your schema:

| Model | Purpose |
|-------|---------|
| **User** | Stores user profile information (email, name, image) |
| **Session** | Tracks active login sessions with tokens and expiry |
| **Account** | Links users to auth providers (email/password, OAuth) |
| **Verification** | Stores email verification and password reset tokens |

### 5.3 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as Better Auth
    participant P as Prisma
    participant DB as PostgreSQL

    U->>A: Register/Login Request
    A->>P: Create/Find User
    P->>DB: SQL Query
    DB-->>P: User Data
    P-->>A: User Object
    A->>P: Create Session
    P->>DB: INSERT session
    DB-->>P: Session Created
    A-->>U: Session Token
```

---

## 6. Database Schema Deep Dive

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Session : has
    User ||--o{ Account : has
    User {
        string id PK
        string email UK
        string name
        boolean emailVerified
        string image
        datetime createdAt
        datetime updatedAt
    }
    Session {
        string id PK
        string token UK
        string userId FK
        datetime expiresAt
        string ipAddress
        string userAgent
    }
    Account {
        string id PK
        string accountId
        string providerId
        string userId FK
        string password
        string accessToken
        string refreshToken
    }
    Verification {
        string id PK
        string identifier
        string value
        datetime expiresAt
    }
    BlogPost {
        string id PK
        string slug UK
        string title
        string content
        datetime createdAt
    }
```

### Model Details

#### User Model
```prisma
model User {
  id            String    @id           // Unique identifier
  name          String                  // Display name
  email         String                  // Login email (unique)
  emailVerified Boolean   @default(false) // Email confirmed?
  image         String?                 // Profile picture URL
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]               // User's active sessions
  accounts      Account[]               // Auth provider accounts
}
```

#### Session Model
```prisma
model Session {
  id        String   @id               // Session identifier
  expiresAt DateTime                   // When session expires
  token     String                     // Unique session token
  ipAddress String?                    // Client IP address
  userAgent String?                    // Browser/device info
  userId    String                     // Foreign key to User
  user      User     @relation(...)    // Relationship to User
}
```

#### Account Model
Stores authentication credentials and OAuth tokens:
```prisma
model Account {
  providerId  String    // "credential" for email/password, "google", etc.
  password    String?   // Hashed password (for credential auth)
  accessToken String?   // OAuth access token
  // ... other OAuth fields
}
```

#### Verification Model
Used for email verification and password resets:
```prisma
model Verification {
  identifier String    // Email or user ID
  value      String    // Verification token
  expiresAt  DateTime  // Token expiry
}
```

---

## 7. Essential Prisma Commands

### Generate Prisma Client

Generates TypeScript types and client code from your schema:

```bash
npx prisma generate
```

**When to run:**
- After changing `schema.prisma`
- After installing dependencies
- When you see type errors related to Prisma models

**Output location:** `lib/generated/prisma/`

### Push Schema to Database

Syncs your schema with the database (without migrations):

```bash
npx prisma db push
```

**Use for:**
- Development and prototyping
- Quick schema changes
- Initial database setup

**Warning:** May cause data loss if you remove fields!

### Create Migrations

Creates versioned migration files for production:

```bash
npx prisma migrate dev --name your_migration_name
```

**Examples:**
```bash
npx prisma migrate dev --name init
npx prisma migrate dev --name add_blog_posts
npx prisma migrate dev --name add_user_role
```

**Use for:**
- Production deployments
- Team collaboration
- Version control of schema changes

### Open Prisma Studio

Visual database browser:

```bash
npx prisma studio
```

Opens at: **http://localhost:5555**

### Run Seed Script

Populates database with initial data:

```bash
npx prisma db seed
```

### Format Schema

Formats your schema file:

```bash
npx prisma format
```

### Validate Schema

Checks for errors in schema:

```bash
npx prisma validate
```

### Complete Command Reference

| Command | Purpose |
|---------|---------|
| `npx prisma init` | Initialize Prisma in project |
| `npx prisma generate` | Generate client from schema |
| `npx prisma db push` | Push schema to database |
| `npx prisma migrate dev` | Create development migration |
| `npx prisma migrate deploy` | Deploy migrations (production) |
| `npx prisma studio` | Open visual database browser |
| `npx prisma db seed` | Run seed script |
| `npx prisma format` | Format schema file |
| `npx prisma validate` | Validate schema |
| `npx prisma db pull` | Pull schema from existing database |

---

## 8. Prisma Studio Guide

Prisma Studio is a visual interface to browse and edit your database.

### Launching Prisma Studio

```bash
npx prisma studio
```

Opens in browser at: **http://localhost:5555**

### Interface Overview

When you open Prisma Studio, you'll see all your database tables:

```
+------------------+
|  Tables          |
+------------------+
| > user           |
| > session        |
| > account        |
| > verification   |
| > blog_post      |
+------------------+
```

### Viewing Tables

**User Table (`user`):**
| id | name | email | emailVerified | image | createdAt |
|----|------|-------|---------------|-------|-----------|
| abc123 | John Doe | john@email.com | true | null | 2024-01-15 |

**Session Table (`session`):**
| id | token | userId | expiresAt | ipAddress |
|----|-------|--------|-----------|-----------|
| sess_1 | tok_xxx | abc123 | 2024-02-15 | 192.168.1.1 |

**Account Table (`account`):**
| id | providerId | userId | password |
|----|------------|--------|----------|
| acc_1 | credential | abc123 | [hashed] |

**Blog Post Table (`blog_post`):**
| id | slug | title | content | createdAt |
|----|------|-------|---------|-----------|
| clx... | how-to-build | How to Build... | This is... | 2024-01-15 |

### Common Operations

**Add a Record:**
1. Click on a table (e.g., `blog_post`)
2. Click "Add record" button
3. Fill in the fields
4. Click "Save 1 change"

**Edit a Record:**
1. Click on any field value
2. Modify the value
3. Click "Save changes"

**Delete a Record:**
1. Select the row(s)
2. Click "Delete" button
3. Confirm deletion

**Filter Records:**
1. Click "Add filter"
2. Select field (e.g., `email`)
3. Choose operator (e.g., `contains`)
4. Enter value
5. Records are filtered instantly

### What You'll See in Better Auth Tables

**After User Registration:**
- `user` table: New user with email, name
- `account` table: Account linked to user with `providerId: "credential"`
- Password is hashed (never stored in plain text)

**After User Login:**
- `session` table: New session with token and expiry
- `ipAddress` and `userAgent` captured automatically

**Email Verification:**
- `verification` table: Token for email confirmation
- Deleted after successful verification

---

## 9. Seeding Data

### Seed File (`prisma/seed.ts`)

Seeds populate your database with initial or test data:

```typescript
// prisma/seed.ts

import prisma from "@/lib/db";

async function main() {
    const blogPosts = [
        {
            slug: "how-to-build-a-web-application",
            title: "How to Build a Web Application",
            content: "This is a guide on how to build a web application.",
        }
    ]

    for (const post of blogPosts) {
        await prisma.blogPost.create({
            data: post,
        });
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
```

### Package.json Configuration

Add the seed command to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### Running Seeds

**Run seed command:**
```bash
npx prisma db seed
```

**Seeds run automatically with:**
```bash
npx prisma migrate reset  # Resets DB and runs seed
```

### Seed Best Practices

**1. Check for Existing Data:**
```typescript
const existingPost = await prisma.blogPost.findUnique({
  where: { slug: "my-post" }
});

if (!existingPost) {
  await prisma.blogPost.create({
    data: { slug: "my-post", title: "My Post", content: "..." }
  });
}
```

**2. Use Upsert for Idempotent Seeds:**
```typescript
await prisma.blogPost.upsert({
  where: { slug: "my-post" },
  update: { title: "Updated Title" },  // If exists
  create: { slug: "my-post", title: "My Post", content: "..." }  // If not
});
```

**3. Seed Multiple Records:**
```typescript
await prisma.blogPost.createMany({
  data: [
    { slug: "post-1", title: "Post 1", content: "..." },
    { slug: "post-2", title: "Post 2", content: "..." },
  ],
  skipDuplicates: true,
});
```

---

## 10. Environment Variables

### The `.env` File

Create a `.env` file in your project root:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/myapp_db"

# Better Auth (optional additional config)
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
```

### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

| Part | Example | Description |
|------|---------|-------------|
| USER | postgres | Database username |
| PASSWORD | mypassword | Database password |
| HOST | localhost | Database server address |
| PORT | 5432 | PostgreSQL default port |
| DATABASE | myapp_db | Your database name |

### Example Connection Strings

**Local Development:**
```env
DATABASE_URL="postgresql://postgres:password123@localhost:5432/myapp_db"
```

**Docker PostgreSQL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_db"
```

### Security Notes

- **NEVER commit `.env` to version control**
- Add `.env` to `.gitignore`:
  ```
  # .gitignore
  .env
  .env.local
  .env.*.local
  ```
- Use different credentials for production
- Consider using environment variable managers for production

---

## 11. Project File Structure

```
my-app/
├── .env                          # Environment variables (DATABASE_URL)
├── package.json                  # Dependencies and scripts
├── prisma.config.ts              # Prisma configuration
├── tsconfig.json                 # TypeScript configuration
│
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   ├── seed.ts                   # Database seeding script
│   └── migrations/               # Migration files (if using migrations)
│       └── 20240115_init/
│           └── migration.sql
│
├── lib/
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.ts                   # Better Auth configuration
│   └── generated/
│       └── prisma/               # Auto-generated Prisma client
│           ├── client.ts         # Main client export
│           ├── enums.ts          # Enum types
│           └── models/           # Model types
│               ├── User.ts
│               ├── Session.ts
│               ├── Account.ts
│               ├── Verification.ts
│               └── BlogPost.ts
│
├── app/
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles
│   └── api/                      # API routes (for auth endpoints)
│       └── auth/
│           └── [...all]/
│               └── route.ts      # Better Auth API handler
│
└── components/
    └── ui/                       # UI components
        ├── button.tsx
        └── card.tsx
```

### File Purposes

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Defines all database models and relationships |
| `prisma/seed.ts` | Contains initial data to populate database |
| `prisma.config.ts` | Configures Prisma behavior and datasource |
| `lib/db.ts` | Creates singleton Prisma client instance |
| `lib/auth.ts` | Configures Better Auth with Prisma adapter |
| `lib/generated/prisma/*` | Auto-generated type-safe client code |
| `.env` | Stores sensitive configuration like DATABASE_URL |

---

## 12. Troubleshooting

### Common Issues and Solutions

#### "Cannot find module './generated/prisma/client'"

**Solution:** Run Prisma generate
```bash
npx prisma generate
```

#### "P1001: Can't reach database server"

**Solution:** Check PostgreSQL is running
```powershell
Get-Service postgresql-x64-18
Start-Service postgresql-x64-18
```

#### "Too many database connections"

**Solution:** Ensure you're using the singleton pattern in `lib/db.ts`

#### "Unique constraint violation"

**Solution:** The data you're trying to insert already exists. Use `upsert` instead of `create`:
```typescript
await prisma.user.upsert({
  where: { email: "user@email.com" },
  update: {},
  create: { email: "user@email.com", name: "User" }
});
```

#### "Invalid `prisma.model.findMany()` invocation"

**Solution:** Regenerate client after schema changes:
```bash
npx prisma generate
```

#### Schema Changes Not Reflected

**Solution:** Push changes to database:
```bash
npx prisma db push
```

#### Prisma Studio Shows Old Data

**Solution:** Refresh the browser or restart Prisma Studio:
```bash
# Stop with Ctrl+C, then restart
npx prisma studio
```

### Development Workflow

**When you change the schema:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate`
3. Run `npx prisma db push`
4. Restart your dev server

**When starting a new environment:**
1. Clone the project
2. Run `npm install`
3. Create `.env` with `DATABASE_URL`
4. Run `npx prisma generate`
5. Run `npx prisma db push`
6. Run `npx prisma db seed`
7. Run `npm run dev`

---

## Quick Reference Card

### Installation Commands
```bash
npm install prisma --save-dev
npm install @prisma/client @prisma/adapter-pg
npm install better-auth
npm install tsx --save-dev
npx prisma init
```

### Daily Workflow Commands
```bash
npx prisma generate    # After schema changes
npx prisma db push     # Sync to database
npx prisma studio      # Visual browser
npm run dev            # Start Next.js
```

### Environment Template
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/myapp_db"
```

---

**Congratulations!** You now have a complete understanding of the Prisma + Better Auth setup in your Next.js application.

For more information:
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Next.js Documentation](https://nextjs.org/docs)





