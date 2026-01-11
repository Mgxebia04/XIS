# Database Setup Scripts

This folder contains SQL Server scripts to set up the Interview Scheduling database.

## Scripts Overview

1. **01_CreateDatabase.sql** - Creates the `InterviewSchedulingDB` database
2. **02_CreateTables.sql** - Creates all required tables with relationships
3. **03_SeedData.sql** - Inserts sample data for testing
4. **00_CompleteDatabaseSetup.sql** - Master script that runs all scripts in order

## Execution Order

Execute the scripts in this order:
1. `01_CreateDatabase.sql`
2. `02_CreateTables.sql`
3. `03_SeedData.sql`

Or simply run `00_CompleteDatabaseSetup.sql` which executes all scripts.

## Database Schema

### Core Tables
- **Users** - User accounts with email, password hash, and role
- **InterviewerProfiles** - Interviewer profile information
- **Interviewees** - Candidate information
- **Skills** - Available skills
- **InterviewTypes** - Types of interviews (L1, L2, L3)

### Relationship Tables
- **InterviewerSkills** - Links interviewers to their skills (Primary/Secondary)
- **AvailabilitySlots** - Interviewer availability time slots
- **Interviews** - Scheduled interviews
- **InterviewRequirements** - Skills required for each interview

## Sample Data

The seed script includes:
- 6 skills (Python, Django, React, Node.js, SQL, JavaScript)
- 3 interview types (L1, L2, L3)
- Sample HR Manager user
- Sample Interviewer users with profiles and skills
- Sample interviewees

## Connection String

Update the connection string in `appsettings.json` to match your SQL Server instance:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=InterviewSchedulingDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

For LocalDB:
```
Server=(localdb)\\mssqllocaldb;Database=InterviewSchedulingDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```
