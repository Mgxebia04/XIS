-- AIModified:2026-01-11T05:42:58Z
-- Seed Data Script for Interview Scheduling System
-- Run this script to populate initial data

USE InterviewSchedulingDB;
GO

-- Insert Skills
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'Python')
    INSERT INTO Skills (Name) VALUES ('Python');
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'Django')
    INSERT INTO Skills (Name) VALUES ('Django');
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'React')
    INSERT INTO Skills (Name) VALUES ('React');
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'Node.js')
    INSERT INTO Skills (Name) VALUES ('Node.js');
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'SQL')
    INSERT INTO Skills (Name) VALUES ('SQL');
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'JavaScript')
    INSERT INTO Skills (Name) VALUES ('JavaScript');
GO

-- Insert Interview Types
IF NOT EXISTS (SELECT * FROM InterviewTypes WHERE Name = 'L1 - Initial Screening')
    INSERT INTO InterviewTypes (Name, Description) VALUES ('L1 - Initial Screening', 'Initial screening interview');
IF NOT EXISTS (SELECT * FROM InterviewTypes WHERE Name = 'L2 - Technical Round')
    INSERT INTO InterviewTypes (Name, Description) VALUES ('L2 - Technical Round', 'Technical assessment round');
IF NOT EXISTS (SELECT * FROM InterviewTypes WHERE Name = 'L3 - Final Round')
    INSERT INTO InterviewTypes (Name, Description) VALUES ('L3 - Final Round', 'Final interview round');
GO

-- Insert default HR Manager user (password: Admin@123 - hash should be generated in application)
-- Note: This is a placeholder. In production, use proper password hashing
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'hr@xebia.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, Role)
    VALUES ('hr@xebia.com', '$2a$11$placeholder_hash_replace_in_app', 'HR Manager');
END
GO

-- Insert sample Interviewer users
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'sofia.green@xebia.com')
BEGIN
    DECLARE @SofiaUserId INT;
    INSERT INTO Users (Email, PasswordHash, Role)
    VALUES ('sofia.green@xebia.com', '$2a$11$placeholder_hash_replace_in_app', 'Interviewer');
    SET @SofiaUserId = SCOPE_IDENTITY();
    
    INSERT INTO InterviewerProfiles (UserId, Name, Experience, Level)
    VALUES (@SofiaUserId, 'Sofia Green', '5-10 years', 'Mid-level');
    
    DECLARE @SofiaProfileId INT = SCOPE_IDENTITY();
    DECLARE @PythonId INT = (SELECT Id FROM Skills WHERE Name = 'Python');
    DECLARE @DjangoId INT = (SELECT Id FROM Skills WHERE Name = 'Django');
    DECLARE @ReactId INT = (SELECT Id FROM Skills WHERE Name = 'React');
    
    INSERT INTO InterviewerSkills (InterviewerProfileId, SkillId, IsPrimary)
    VALUES 
        (@SofiaProfileId, @PythonId, 1),
        (@SofiaProfileId, @DjangoId, 1),
        (@SofiaProfileId, @ReactId, 0);
END
GO

IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'jason.lee@xebia.com')
BEGIN
    DECLARE @JasonUserId INT;
    INSERT INTO Users (Email, PasswordHash, Role)
    VALUES ('jason.lee@xebia.com', '$2a$11$placeholder_hash_replace_in_app', 'Interviewer');
    SET @JasonUserId = SCOPE_IDENTITY();
    
    INSERT INTO InterviewerProfiles (UserId, Name, Experience, Level)
    VALUES (@JasonUserId, 'Jason Lee', '5-10 years', 'Mid-level');
    
    DECLARE @JasonProfileId INT = SCOPE_IDENTITY();
    DECLARE @PythonId2 INT = (SELECT Id FROM Skills WHERE Name = 'Python');
    DECLARE @DjangoId2 INT = (SELECT Id FROM Skills WHERE Name = 'Django');
    
    INSERT INTO InterviewerSkills (InterviewerProfileId, SkillId, IsPrimary)
    VALUES 
        (@JasonProfileId, @PythonId2, 1),
        (@JasonProfileId, @DjangoId2, 1);
END
GO

-- Insert sample Interviewees
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'james.smith@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill)
    VALUES ('James Smith', 'james.smith@example.com', 'SQL');
GO

IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'rachel.brown@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill)
    VALUES ('Rachel Brown', 'rachel.brown@example.com', 'Python');
GO

PRINT 'Seed data inserted successfully!';
GO
