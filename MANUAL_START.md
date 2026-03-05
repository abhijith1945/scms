# SCMS - Manual Startup Instructions

## Option 1: Automatic Startup (Recommended)

Just run this command in PowerShell:
```powershell
cd c:\Users\abhij\scms
.\start-all.ps1
```

This will automatically:
- Start Docker containers
- Create and seed the database
- Start the backend in a new window
- Start the frontend in a new window

Then open: http://localhost:5173

## Option 2: Manual Step-by-Step

### Step 1: Start Docker
```powershell
cd c:\Users\abhij\scms
docker-compose up -d
```

### Step 2: Create Database (First time only)
```powershell
# Create database
docker exec -i scms-postgres-1 psql -U postgres -c "CREATE DATABASE scms_users;"

# Run migrations
Get-Content "database\migrations\V1__init.sql" | docker exec -i scms-postgres-1 psql -U postgres -d scms_users

# Insert sample data
Get-Content "database\seeds\data.sql" | docker exec -i scms-postgres-1 psql -U postgres -d scms_users
```

### Step 3: Start Backend (In Terminal 1)
```powershell
cd c:\Users\abhij\scms\backend\user-service
mvn spring-boot:run
```

Wait until you see: `Started UserServiceApplication`

### Step 4: Start Frontend (In Terminal 2)
```powershell
cd c:\Users\abhij\scms\frontend

# First time only - install dependencies
npm install

# Start the dev server
npm run dev
```

### Step 5: Open Browser
Go to: http://localhost:5173

## Test Credentials

**Student Login:**
- Email: student1@scms.edu
- Password: password123

**Faculty Login:**
- Email: faculty1@scms.edu
- Password: password123

## What to Test

### As Student (student1@scms.edu):
1. Login
2. View dashboard - see 3 enrolled courses
3. Click "View Attendance" on any course - see attendance records
4. Click "Assignments" - see pending assignments
5. Click "Submit" on any assignment - upload a file

### As Faculty (faculty1@scms.edu):
1. Login
2. View courses on Courses tab
3. Switch to Attendance tab - click "Mark Attendance"
4. Mark attendance for students
5. Switch to Assignments tab - view assignments

## Troubleshooting

### Backend Error: "Connection refused"
- Docker is not running. Start Docker Desktop.
- Database doesn't exist. Run Step 2 again.

### Frontend Error: "Network Error"
- Backend is not running. Check Terminal 1.
- Backend is still starting. Wait 1-2 minutes.

### Login fails with "Invalid credentials"
- Database was not seeded. Run Step 2 again.
- Check backend logs in Terminal 1 for errors.

### Port already in use
- Backend (8081): `netstat -ano | findstr :8081` then kill the process
- Frontend (5173): `netstat -ano | findstr :5173` then kill the process
- PostgreSQL (5432): Stop other PostgreSQL instances

## Stop Everything

```powershell
# Stop frontend: Ctrl+C in Terminal 2
# Stop backend: Ctrl+C in Terminal 1
# Stop Docker:
docker-compose down
```

## Next Time You Start

You only need to run:
```powershell
# Start Docker
docker-compose up -d

# Start backend (Terminal 1)
cd backend\user-service
mvn spring-boot:run

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

Database will persist, so you don't need to recreate it.
