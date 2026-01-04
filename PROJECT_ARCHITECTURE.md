# Project Architecture Documentation

This document explains how the Next.js + Prisma + Better Auth project works, including how to run it, how frontend-backend communication works, and the role of each technology.

## Table of Contents

1. [Running the Project](#running-the-project)
2. [Architecture Overview](#architecture-overview)
3. [Frontend-Backend Communication](#frontend-backend-communication)
4. [Prisma's Role](#prismas-role)
5. [Better Auth's Role](#better-auths-role)
6. [Next.js App Router Support](#nextjs-app-router-support)

---

## Running the Project

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **PostgreSQL** database server
- **npm** or **yarn** package manager

### Environment Setup

1. **Database Configuration**: Ensure you have a PostgreSQL database running and note the connection string.

2. **Environment Variables**: Create a `.env` file in the `my-app` directory with:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

3. **Install Dependencies**:
   ```bash
   cd my-app
   npm install
   ```

4. **Database Setup**:
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations to create tables
   npx prisma migrate dev
   
   # (Optional) Seed the database with initial data
   npx prisma db seed
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```

   The application will be available at **http://localhost:3200**

   > **Note**: The port is configured in `package.json` with the `-p 3200` flag in the dev script.

---

## Architecture Overview

### System Components

The project uses a modern full-stack architecture with Next.js App Router, which allows for server-side data fetching directly in React components.

### Architecture Diagram

```mermaid
graph TB
    Browser[Browser/Client] -->|HTTP Request| NextJS[Next.js App Router]
    NextJS -->|Server Components| ServerComponent[React Server Components]
    ServerComponent -->|Direct Query| Prisma[Prisma Client]
    Prisma -->|SQL Query| PostgreSQL[(PostgreSQL Database)]
    
    NextJS -->|Auth Requests| BetterAuth[Better Auth]
    BetterAuth -->|Uses| Prisma
    BetterAuth -->|Manages| AuthTables[(Auth Tables:<br/>User, Session,<br/>Account, Verification)]
    
    style ServerComponent fill:#e1f5ff
    style Prisma fill:#2d3748
    style PostgreSQL fill:#336791
    style BetterAuth fill:#ff6b6b
```

### Key Components

1. **Frontend**: React Server Components in Next.js App Router
2. **Database Layer**: Prisma ORM (Object-Relational Mapping)
3. **Database**: PostgreSQL
4. **Authentication**: Better Auth with Prisma adapter

---

## Frontend-Backend Communication

### Key Concept: Server Components

This project leverages **Next.js App Router's React Server Components**, which fundamentally changes how frontend-backend communication works compared to traditional architectures.

### Traditional Architecture vs. Next.js App Router

**Traditional Approach:**
```
Client Component → API Route → Database
```

**Next.js App Router Approach:**
```
Server Component → Direct Database Access (via Prisma)
```

### How It Works

In this project, React Server Components execute on the server and can directly access the database through Prisma. There's no need for separate API routes for data fetching.

### Code Examples

#### Example 1: Home Page Data Fetching

**File**: [`app/page.tsx`](app/page.tsx)

```typescript
import prisma from "@/lib/db";

export default async function Home() {
  // Direct database query in Server Component
  const posts = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 3, 
  });
  
  // Render UI with data
  return (
    <main>
      {/* ... JSX using posts data ... */}
    </main>
  );
}
```

**What happens:**
1. This component is a **Server Component** (default in App Router)
2. The `prisma.blogPost.findMany()` call executes on the server
3. Data is fetched from PostgreSQL before the page is rendered
4. Only the rendered HTML/React components are sent to the client
5. The client receives pre-rendered content with data already populated

#### Example 2: Blog Page Data Fetching

**File**: [`app/blog/page.tsx`](app/blog/page.tsx)

```typescript
import prisma from "@/lib/db";

export default async function Blog() {
  const posts = await prisma.blogPost.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 3, 
  });

  return (
    <main>
      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <Card key={post.id}>
              <CardTitle>{post.title}</CardTitle>
              <CardContent>{post.content}</CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No posts found</p>
      )}
    </main>
  );
}
```

### Data Flow

1. **User Request**: Browser requests `/blog` route
2. **Server Execution**: Next.js recognizes this is a Server Component
3. **Database Query**: Prisma Client executes query on PostgreSQL
4. **Data Processing**: Server Component receives data
5. **Rendering**: React renders components with data
6. **Response**: HTML/React components sent to client
7. **Hydration**: Client-side JavaScript hydrates the components (if needed)

### Benefits of This Approach

- ✅ **Reduced Boilerplate**: No need to create API routes for simple data fetching
- ✅ **Better Performance**: Data fetching happens on the server, closer to the database
- ✅ **Type Safety**: Direct TypeScript types from Prisma to components
- ✅ **SEO Friendly**: Content is pre-rendered with data
- ✅ **Security**: Database credentials never exposed to the client

---

## Prisma's Role

### What is Prisma?

Prisma is a **modern ORM (Object-Relational Mapping)** that provides:
- Type-safe database client
- Database schema management
- Migration system
- Query builder

### Configuration

#### Schema Definition

**File**: [`prisma/schema.prisma`](prisma/schema.prisma)

The schema file defines the database structure:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"  // Custom output path
}

datasource db {
  provider = "postgresql"
}

model BlogPost {
  id        String   @id @default(cuid())
  slug      String   @unique
  title     String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("blog_post")
}

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

// ... other models (Session, Account, Verification)
```

**Key Points:**
- `generator client`: Generates TypeScript types and client code
- `datasource db`: Specifies PostgreSQL as the database provider
- `models`: Define database tables and relationships
- `@@map`: Maps Prisma model names to actual database table names

#### Database Client Setup

**File**: [`lib/db.ts`](lib/db.ts)

```typescript
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
```

**What this does:**
- **PrismaPg Adapter**: Uses the PostgreSQL-specific adapter for optimal performance
- **Singleton Pattern**: In development, reuses the same Prisma Client instance to avoid connection issues
- **Connection String**: Reads from `DATABASE_URL` environment variable
- **Type Safety**: Exports typed Prisma Client instance

### Prisma Usage in the Project

#### Direct Queries in Server Components

As seen in the frontend-backend communication section, Prisma is used directly in Server Components:

```typescript
// Query all posts
const posts = await prisma.blogPost.findMany();

// Query with filtering and sorting
const posts = await prisma.blogPost.findMany({
  orderBy: { createdAt: "desc" },
  take: 3
});
```

#### Generated Types

When you run `npx prisma generate`, Prisma creates TypeScript types based on your schema. These types provide:
- **Autocomplete**: IDE suggestions for model names and fields
- **Type Safety**: Compile-time checks for queries
- **IntelliSense**: Helpful hints and documentation

### Database Models in This Project

1. **BlogPost**: Stores blog posts with title, content, slug
2. **User**: User accounts for authentication
3. **Session**: Active user sessions
4. **Account**: OAuth/linked accounts
5. **Verification**: Email verification tokens

### Prisma Commands

```bash
# Generate Prisma Client (required after schema changes)
npx prisma generate

# Create and apply migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio

# Seed database
npx prisma db seed
```

---

## Better Auth's Role

### What is Better Auth?

Better Auth is a modern authentication library that provides:
- User authentication (email/password, OAuth)
- Session management
- Secure token handling
- Type-safe API

### Configuration

**File**: [`lib/auth.ts`](lib/auth.ts)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./db";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
});
```

**What this does:**
- **Better Auth Setup**: Initializes the Better Auth instance
- **Prisma Adapter**: Connects Better Auth to your Prisma Client
- **Provider**: Specifies PostgreSQL as the database
- **Integration**: Uses existing Prisma connection

### Schema Integration

Better Auth requires specific database models for authentication. These are defined in the Prisma schema:

**From [`prisma/schema.prisma`](prisma/schema.prisma):**

```prisma
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
```

### How Better Auth Works

1. **Database Integration**: Uses Prisma to interact with auth tables
2. **Session Management**: Creates and manages user sessions in the `Session` table
3. **User Management**: Handles user accounts in the `User` table
4. **OAuth Support**: Stores OAuth account information in the `Account` table
5. **Verification**: Manages email verification tokens in the `Verification` table

### API Routes Setup (Future)

To enable authentication endpoints, you would typically create an API route:

```
app/api/auth/[...all]/route.ts
```

This would handle authentication requests like:
- `/api/auth/sign-in`
- `/api/auth/sign-up`
- `/api/auth/sign-out`
- `/api/auth/session`

Currently, the auth configuration is set up, but API routes may need to be added for full authentication functionality.

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant NextJS as Next.js App
    participant BetterAuth as Better Auth
    participant Prisma as Prisma Client
    participant DB as PostgreSQL

    User->>NextJS: Login Request
    NextJS->>BetterAuth: Authenticate User
    BetterAuth->>Prisma: Query User Table
    Prisma->>DB: SELECT * FROM user
    DB-->>Prisma: User Data
    Prisma-->>BetterAuth: User Object
    BetterAuth->>Prisma: Create Session
    Prisma->>DB: INSERT INTO session
    DB-->>Prisma: Session Created
    Prisma-->>BetterAuth: Session Token
    BetterAuth-->>NextJS: Auth Response
    NextJS-->>User: Set Cookie / Token
```

---

## Next.js App Router Support

### What is the App Router?

Next.js App Router (introduced in Next.js 13+) is a new routing system that:
- Uses a file-system based router
- Supports React Server Components by default
- Provides built-in layouts and loading states
- Enables streaming and Suspense

### File Structure

```
my-app/
├── app/
│   ├── layout.tsx          # Root layout (Server Component)
│   ├── page.tsx            # Home page (Server Component)
│   ├── blog/
│   │   └── page.tsx        # Blog page (Server Component)
│   └── globals.css         # Global styles
├── lib/
│   ├── db.ts              # Prisma client
│   └── auth.ts            # Better Auth setup
└── prisma/
    └── schema.prisma      # Database schema
```

### Server Components by Default

In the App Router, **all components are Server Components by default**. This means:
- They run on the server
- Can directly access databases, APIs, and file systems
- No JavaScript is sent to the client (unless you use client components)
- Better performance and SEO

### How Next.js Supports This Architecture

#### 1. Server-Side Execution

Server Components execute on the server, allowing direct database access:

```typescript
// This runs on the SERVER
export default async function Page() {
  const data = await prisma.model.findMany();
  return <div>{/* render data */}</div>;
}
```

#### 2. Type Safety

Next.js + TypeScript + Prisma provides end-to-end type safety:

```typescript
// Prisma generates types
import { PrismaClient } from './generated/prisma/client';

// TypeScript knows the shape of BlogPost
const posts: BlogPost[] = await prisma.blogPost.findMany();

// TypeScript knows available fields
posts[0].title  // ✅ Type-safe
posts[0].invalidField  // ❌ TypeScript error
```

#### 3. Automatic Code Splitting

Next.js automatically:
- Splits code by route
- Optimizes bundle size
- Only sends necessary JavaScript to the client

#### 4. Built-in Optimizations

- **Static Generation**: Pages can be pre-rendered at build time
- **Dynamic Rendering**: Server-side rendering when needed
- **Streaming**: Progressive HTML streaming for faster perceived performance

### Client Components (When Needed)

If you need client-side interactivity, you can create Client Components:

```typescript
'use client';  // This directive makes it a Client Component

import { useState } from 'react';

export default function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Use Client Components for:**
- User interactions (clicks, inputs)
- Browser APIs (localStorage, window)
- State management (useState, useEffect)
- Event listeners

### Routing

The App Router uses file-system based routing:

- `app/page.tsx` → `/`
- `app/blog/page.tsx` → `/blog`
- `app/api/auth/route.ts` → `/api/auth`

### Layouts

**File**: [`app/layout.tsx`](app/layout.tsx)

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

This layout wraps all pages, providing consistent structure.

### Benefits of This Stack

1. **Unified Codebase**: Frontend and backend in one repository
2. **Type Safety**: End-to-end TypeScript from database to UI
3. **Performance**: Server Components reduce client-side JavaScript
4. **Developer Experience**: Less boilerplate, better tooling
5. **SEO**: Server-side rendering by default
6. **Security**: Database credentials stay on the server

---

## Summary

This project demonstrates a modern full-stack architecture where:

1. **Next.js App Router** provides the framework for server-side rendering and routing
2. **React Server Components** enable direct database access without API routes
3. **Prisma ORM** handles all database interactions with type safety
4. **Better Auth** manages authentication using Prisma's database models
5. **PostgreSQL** stores all application data

The combination of these technologies creates a powerful, type-safe, and performant web application with reduced complexity compared to traditional architectures.

---

## Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)


