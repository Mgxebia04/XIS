-- AIModified:2026-01-11T05:42:58Z
-- Create Tables Script for Interview Scheduling System
-- Run this script after creating the database

USE InterviewSchedulingDB;
GO

-- Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Email NVARCHAR(255) NOT NULL UNIQUE,
        PasswordHash NVARCHAR(500) NOT NULL,
        Role NVARCHAR(50) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
    
    CREATE INDEX IX_Users_Email ON Users(Email);
END
GO

-- Skills Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Skills')
BEGIN
    CREATE TABLE Skills (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) NOT NULL UNIQUE,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
    
    CREATE UNIQUE INDEX IX_Skills_Name ON Skills(Name);
END
GO

-- Interview Types Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewTypes')
BEGIN
    CREATE TABLE InterviewTypes (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );
END
GO

-- Interviewer Profiles Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewerProfiles')
BEGIN
    CREATE TABLE InterviewerProfiles (
        Id INT PRIMARY KEY IDENTITY(1,1),
        UserId INT NOT NULL UNIQUE,
        Name NVARCHAR(255) NULL,
        ProfilePictureUrl NVARCHAR(500) NULL,
        Experience NVARCHAR(50) NULL,
        Level NVARCHAR(50) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_InterviewerProfiles_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_InterviewerProfiles_UserId ON InterviewerProfiles(UserId);
END
GO

-- Interviewer Skills Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewerSkills')
BEGIN
    CREATE TABLE InterviewerSkills (
        Id INT PRIMARY KEY IDENTITY(1,1),
        InterviewerProfileId INT NOT NULL,
        SkillId INT NOT NULL,
        IsPrimary BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_InterviewerSkills_InterviewerProfiles FOREIGN KEY (InterviewerProfileId) REFERENCES InterviewerProfiles(Id) ON DELETE CASCADE,
        CONSTRAINT FK_InterviewerSkills_Skills FOREIGN KEY (SkillId) REFERENCES Skills(Id) ON DELETE NO ACTION
    );
    
    CREATE INDEX IX_InterviewerSkills_InterviewerProfileId ON InterviewerSkills(InterviewerProfileId);
    CREATE INDEX IX_InterviewerSkills_SkillId ON InterviewerSkills(SkillId);
END
GO

-- Availability Slots Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AvailabilitySlots')
BEGIN
    CREATE TABLE AvailabilitySlots (
        Id INT PRIMARY KEY IDENTITY(1,1),
        InterviewerProfileId INT NOT NULL,
        Date DATE NOT NULL,
        StartTime TIME NOT NULL,
        EndTime TIME NOT NULL,
        IsAvailable BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_AvailabilitySlots_InterviewerProfiles FOREIGN KEY (InterviewerProfileId) REFERENCES InterviewerProfiles(Id) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_AvailabilitySlots_InterviewerProfileId ON AvailabilitySlots(InterviewerProfileId);
    CREATE INDEX IX_AvailabilitySlots_Date ON AvailabilitySlots(Date);
END
GO

-- Interviewees Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Interviewees')
BEGIN
    CREATE TABLE Interviewees (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Name NVARCHAR(255) NOT NULL,
        Email NVARCHAR(255) NOT NULL,
        ProfilePictureUrl NVARCHAR(500) NULL,
        PrimarySkill NVARCHAR(100) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
    
    CREATE INDEX IX_Interviewees_Email ON Interviewees(Email);
END
GO

-- Interviews Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Interviews')
BEGIN
    CREATE TABLE Interviews (
        Id INT PRIMARY KEY IDENTITY(1,1),
        InterviewerProfileId INT NOT NULL,
        IntervieweeId INT NOT NULL,
        InterviewTypeId INT NOT NULL,
        ScheduledDate DATE NOT NULL,
        StartTime TIME NOT NULL,
        EndTime TIME NOT NULL,
        Status NVARCHAR(50) NOT NULL DEFAULT 'Scheduled',
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL,
        CONSTRAINT FK_Interviews_InterviewerProfiles FOREIGN KEY (InterviewerProfileId) REFERENCES InterviewerProfiles(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Interviews_Interviewees FOREIGN KEY (IntervieweeId) REFERENCES Interviewees(Id) ON DELETE NO ACTION,
        CONSTRAINT FK_Interviews_InterviewTypes FOREIGN KEY (InterviewTypeId) REFERENCES InterviewTypes(Id) ON DELETE NO ACTION
    );
    
    CREATE INDEX IX_Interviews_InterviewerProfileId ON Interviews(InterviewerProfileId);
    CREATE INDEX IX_Interviews_IntervieweeId ON Interviews(IntervieweeId);
    CREATE INDEX IX_Interviews_InterviewTypeId ON Interviews(InterviewTypeId);
    CREATE INDEX IX_Interviews_ScheduledDate ON Interviews(ScheduledDate);
END
GO

-- Interview Requirements Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewRequirements')
BEGIN
    CREATE TABLE InterviewRequirements (
        Id INT PRIMARY KEY IDENTITY(1,1),
        InterviewId INT NOT NULL,
        SkillId INT NOT NULL,
        IsPrimary BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_InterviewRequirements_Interviews FOREIGN KEY (InterviewId) REFERENCES Interviews(Id) ON DELETE CASCADE,
        CONSTRAINT FK_InterviewRequirements_Skills FOREIGN KEY (SkillId) REFERENCES Skills(Id) ON DELETE NO ACTION
    );
    
    CREATE INDEX IX_InterviewRequirements_InterviewId ON InterviewRequirements(InterviewId);
    CREATE INDEX IX_InterviewRequirements_SkillId ON InterviewRequirements(SkillId);
END
GO
