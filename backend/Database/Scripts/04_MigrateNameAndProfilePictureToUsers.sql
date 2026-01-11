-- AIModified:2026-01-11T11:13:42Z
-- Migration Script: Move Name and ProfilePictureUrl from InterviewerProfiles to Users
-- This script migrates existing data and updates the schema

USE InterviewSchedulingDB;
GO

-- Step 1: Add Name and ProfilePictureUrl columns to Users table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Name')
BEGIN
    ALTER TABLE Users
    ADD Name NVARCHAR(255) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ProfilePictureUrl')
BEGIN
    ALTER TABLE Users
    ADD ProfilePictureUrl NVARCHAR(500) NULL;
END
GO

-- Step 2: Copy data from InterviewerProfiles to Users
UPDATE u
SET 
    u.Name = ip.Name,
    u.ProfilePictureUrl = ip.ProfilePictureUrl
FROM Users u
INNER JOIN InterviewerProfiles ip ON u.Id = ip.UserId
WHERE ip.Name IS NOT NULL OR ip.ProfilePictureUrl IS NOT NULL;
GO

-- Step 3: Remove Name and ProfilePictureUrl columns from InterviewerProfiles
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('InterviewerProfiles') AND name = 'Name')
BEGIN
    ALTER TABLE InterviewerProfiles
    DROP COLUMN Name;
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('InterviewerProfiles') AND name = 'ProfilePictureUrl')
BEGIN
    ALTER TABLE InterviewerProfiles
    DROP COLUMN ProfilePictureUrl;
END
GO

-- Step 4: Update user with ID 8 (if exists) with Name, Experience, and Level
-- First, update the User table with Name
UPDATE Users
SET Name = 'John Doe'
WHERE Id = 8;
GO

-- Update InterviewerProfile for user ID 8 with Experience and Level
UPDATE ip
SET 
    ip.Experience = '5-10 years',
    ip.Level = 'Senior',
    ip.UpdatedAt = GETUTCDATE()
FROM InterviewerProfiles ip
INNER JOIN Users u ON ip.UserId = u.Id
WHERE u.Id = 8;
GO

PRINT 'Migration completed successfully!';
GO
