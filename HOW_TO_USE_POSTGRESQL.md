# How to Use PostgreSQL (Already Installed!)

## ✅ Good News: PostgreSQL is Already Running!

PostgreSQL runs as a **background service** (not a visible app). The service `postgresql-x64-18` is currently **Running**.

## Two Ways to Access PostgreSQL:

### Option 1: Using psql (Command Line) - Quick Method

**Easy way - Double-click the batch file:**
- Double-click `run-psql.bat` in this folder
- Enter your PostgreSQL password (the one you set during installation)

**Manual way - Using PowerShell/Command Prompt:**
```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

### Option 2: Using pgAdmin 4 (GUI - Visual Interface)

pgAdmin 4 should be installed with PostgreSQL. To find it:

1. **Search for it:**
   - Press `Win + S` (Windows Search)
   - Type "pgAdmin 4"
   - Click on it to open

2. **First time setup:**
   - Set a master password (remember this!)
   - Click "Add New Server"
   - Name: `localhost` (or any name you like)
   - Connection tab:
     - Host: `localhost`
     - Port: `5432`
     - Username: `postgres`
     - Password: (the password you set during PostgreSQL installation)
   - Click "Save"

## Create a Database

### Quick Method - Use the batch file:
- Double-click `create-database.bat`
- Enter your PostgreSQL password
- It will create a database called `myapp_db`

### Manual Method - Using psql:
```powershell
# 1. Connect to PostgreSQL
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres

# 2. Once connected, create database:
CREATE DATABASE myapp_db;

# 3. Exit psql:
\q
```

### Using pgAdmin:
1. Open pgAdmin 4
2. Connect to your server (localhost)
3. Right-click "Databases" → Create → Database
4. Name: `myapp_db`
5. Click "Save"

## Update Your .env File

After creating the database, update your `.env` file:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/myapp_db"
```

Replace `YOUR_PASSWORD` with the password you set during PostgreSQL installation.

## Common psql Commands

Once you're in psql:
- `\l` - List all databases
- `\c database_name` - Connect to a database
- `\dt` - List all tables in current database
- `\q` - Quit psql
- `CREATE DATABASE name;` - Create a new database
- `DROP DATABASE name;` - Delete a database

## Check PostgreSQL Status

To check if PostgreSQL is running:
```powershell
Get-Service postgresql-x64-18
```

To start it if it's stopped:
```powershell
Start-Service postgresql-x64-18
```

To stop it:
```powershell
Stop-Service postgresql-x64-18
```

## Next Steps After Creating Database

1. Update your `.env` file with the connection string
2. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
3. Push your schema to the database:
   ```bash
   npx prisma db push
   ```





