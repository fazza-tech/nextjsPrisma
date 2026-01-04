# How to Run PostgreSQL Locally on Windows

## Option 1: Install PostgreSQL Using Official Installer (Recommended)

### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Click on "Download the installer" from EnterpriseDB
3. Download the latest version (usually 15 or 16)

### Step 2: Install PostgreSQL
1. Run the installer (.exe file)
2. Follow the installation wizard:
   - **Installation Directory**: Leave default (usually `C:\Program Files\PostgreSQL\16`)
   - **Select Components**: Check all boxes (PostgreSQL Server, pgAdmin 4, Command Line Tools, Stack Builder)
   - **Data Directory**: Leave default (usually `C:\Program Files\PostgreSQL\16\data`)
   - **Password**: Set a password for the `postgres` superuser (REMEMBER THIS PASSWORD!)
   - **Port**: Leave default (5432)
   - **Advanced Options**: Leave default locale
   - **Ready to Install**: Review and click Install

### Step 3: Verify Installation
After installation, PostgreSQL service should start automatically. To verify:

1. Open **Services** (Win + R, type `services.msc`)
2. Look for "postgresql-x64-16" (or similar) - it should be running

### Step 4: Test Connection
Open Command Prompt or PowerShell and test:
```bash
psql -U postgres
```
Enter the password you set during installation.

## Option 2: Using Docker (Alternative)

If you have Docker Desktop installed:

```bash
docker run --name postgres-local -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=myapp_db -p 5432:5432 -d postgres
```

This creates a PostgreSQL container with:
- Username: `postgres`
- Password: `postgres`
- Database: `myapp_db`
- Port: `5432`

## Configure Your .env File

Once PostgreSQL is running, update your `.env` file with:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/myapp_db"
```

Replace:
- `YOUR_PASSWORD` with the password you set during installation
- `myapp_db` with your desired database name (you'll need to create it first)

## Create a Database

After PostgreSQL is installed and running:

### Using psql (Command Line):
```bash
psql -U postgres
```
Then in psql:
```sql
CREATE DATABASE myapp_db;
\q
```

### Using pgAdmin 4 (GUI):
1. Open pgAdmin 4 (installed with PostgreSQL)
2. Connect to the server (password you set during installation)
3. Right-click "Databases" → Create → Database
4. Name it `myapp_db` (or your preferred name)
5. Click Save

## Start/Stop PostgreSQL Service

### Start PostgreSQL:
```powershell
# In PowerShell as Administrator
Start-Service postgresql-x64-16
```

Or use Services GUI:
1. Win + R → `services.msc`
2. Find PostgreSQL service
3. Right-click → Start

### Stop PostgreSQL:
```powershell
Stop-Service postgresql-x64-16
```

## Quick Connection String Template

For local development, use:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE_NAME"
```

## Next Steps

After setting up PostgreSQL and configuring `.env`:

1. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Push your schema to the database:
   ```bash
   npx prisma db push
   ```

3. (Optional) Open Prisma Studio to view your data:
   ```bash
   npx prisma studio
   ```





