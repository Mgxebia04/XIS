# Interview Scheduling API

A .NET Core 8.0 Web API for managing interview scheduling between HR managers and interviewers.

## Features

- User authentication with role-based access (HR Manager, Interviewer)
- Interviewer profile management with skills (Primary/Secondary)
- Availability slot management for interviewers
- Interview scheduling with skill matching
- Search for available interviewers based on skills, interview type, and date

## Prerequisites

- .NET 8.0 SDK or later
- SQL Server (LocalDB, SQL Server Express, or SQL Server)
- Visual Studio 2022 or VS Code

## Database Setup

### Option 1: Using SQL Scripts

1. Open SQL Server Management Studio (SSMS) or Azure Data Studio
2. Connect to your SQL Server instance
3. Execute the scripts in the `Database/Scripts` folder in order:
   - `01_CreateDatabase.sql` - Creates the database
   - `02_CreateTables.sql` - Creates all tables
   - `03_SeedData.sql` - Inserts sample data

### Option 2: Using Entity Framework Migrations

The application will automatically create the database on first run using `EnsureCreated()`. For production, use migrations:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Configuration

Update the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=InterviewSchedulingDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

## Running the Application

1. Navigate to the project directory:
   ```bash
   cd InterviewScheduling.API
   ```

2. Restore packages:
   ```bash
   dotnet restore
   ```

3. Run the application:
   ```bash
   dotnet run
   ```

4. The API will be available at:
   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:5001`
   - Swagger UI: `https://localhost:5001/swagger`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email, password, and role

### Interviewer Profile
- `GET /api/interviewerprofile/{id}` - Get interviewer profile
- `PUT /api/interviewerprofile/{id}` - Update interviewer profile

### Availability
- `GET /api/availability/interviewer/{interviewerId}` - Get availability slots
- `POST /api/availability/interviewer/{interviewerId}` - Create availability slot
- `DELETE /api/availability/{id}` - Delete availability slot

### Schedule
- `GET /api/schedule/interviewer/{interviewerId}` - Get interviewer's schedule
- `POST /api/schedule/search` - Search for available interviewers
- `POST /api/schedule/create` - Create a new interview

### Skills
- `GET /api/skills` - Get all skills

### Interview Types
- `GET /api/interviewtypes` - Get all interview types

### Interviewees
- `GET /api/interviewees` - Get all interviewees
- `GET /api/interviewees/{id}` - Get interviewee by ID
- `POST /api/interviewees` - Create new interviewee

## Sample Data

The seed script includes:
- Skills: Python, Django, React, Node.js, SQL, JavaScript
- Interview Types: L1 - Initial Screening, L2 - Technical Round, L3 - Final Round
- Sample users: HR Manager and Interviewers
- Sample interviewees

## Project Structure

```
InterviewScheduling.API/
├── Controllers/          # API controllers
├── Data/                 # DbContext and data access
├── DTOs/                 # Data transfer objects
├── Models/               # Entity models
├── Database/             # SQL scripts (in root)
└── Program.cs            # Application entry point
```

## Notes

- Password authentication is simplified for development. Implement proper password hashing (BCrypt) in production.
- JWT token generation is simplified. Implement proper JWT authentication for production.
- CORS is configured to allow all origins for development. Restrict in production.
