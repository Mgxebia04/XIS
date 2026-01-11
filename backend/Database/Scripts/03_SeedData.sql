-- AIModified:2026-01-11T16:13:16Z
-- Seed Data Script for Interview Scheduling System
-- Run this script to populate initial data

USE InterviewSchedulingDB;
GO

-- Insert Skills
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'Python')
    INSERT INTO Skills (Name, CreatedAt) VALUES ('Python', GETUTCDATE());
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'Django')
    INSERT INTO Skills (Name, CreatedAt) VALUES ('Django', GETUTCDATE());
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'React')
    INSERT INTO Skills (Name, CreatedAt) VALUES ('React', GETUTCDATE());
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'Node.js')
    INSERT INTO Skills (Name, CreatedAt) VALUES ('Node.js', GETUTCDATE());
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'SQL')
    INSERT INTO Skills (Name, CreatedAt) VALUES ('SQL', GETUTCDATE());
IF NOT EXISTS (SELECT * FROM Skills WHERE Name = 'JavaScript')
    INSERT INTO Skills (Name, CreatedAt) VALUES ('JavaScript', GETUTCDATE());
GO

-- Insert Interview Types
IF NOT EXISTS (SELECT * FROM InterviewTypes WHERE Name = 'L1 - Initial Screening')
    INSERT INTO InterviewTypes (Name, Description, CreatedAt) VALUES ('L1 - Initial Screening', 'Initial screening interview', GETUTCDATE());
IF NOT EXISTS (SELECT * FROM InterviewTypes WHERE Name = 'L2 - Technical Round')
    INSERT INTO InterviewTypes (Name, Description, CreatedAt) VALUES ('L2 - Technical Round', 'Technical assessment round', GETUTCDATE());
IF NOT EXISTS (SELECT * FROM InterviewTypes WHERE Name = 'L3 - Cultural Round')
    INSERT INTO InterviewTypes (Name, Description, CreatedAt) VALUES ('L3 - Cultural Round', 'Cultural fit assessment round', GETUTCDATE());
GO

-- Update existing L3 - Final Round to L3 - Cultural Round (if exists)
IF EXISTS (SELECT * FROM InterviewTypes WHERE Name = 'L3 - Final Round')
BEGIN
    UPDATE InterviewTypes 
    SET Name = 'L3 - Cultural Round', Description = 'Cultural fit assessment round'
    WHERE Name = 'L3 - Final Round';
END
GO

-- Update existing HR Manager user password to 123456 (if exists)
-- BCrypt hash for password "123456" (cost factor 11)
UPDATE Users 
SET PasswordHash = '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE Email = 'hr@xebia.com' AND Role = 'HR Manager';
GO

-- Insert Admin users (password: 123456)
-- BCrypt hash for password "123456" (cost factor 11)
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'admin@xebia.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, Role, Name, CreatedAt)
    VALUES ('admin@xebia.com', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'Admin User', GETUTCDATE());
END
GO

IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'admin2@xebia.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, Role, Name, CreatedAt)
    VALUES ('admin2@xebia.com', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin', 'Admin User 2', GETUTCDATE());
END
GO

-- Insert HR Manager user if not exists (password: 123456)
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'hr@xebia.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES ('hr@xebia.com', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'HR Manager', GETUTCDATE());
END
GO

-- Insert new HR Manager user (password: 123456)
-- Email: hr.manager@xebia.com
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'hr.manager@xebia.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES ('hr.manager@xebia.com', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'HR Manager', GETUTCDATE());
END
GO

-- Insert sample Interviewer users (password: 123456 for new users)
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'sofia.green@xebia.com')
BEGIN
    DECLARE @SofiaUserId INT;
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES ('sofia.green@xebia.com', '$2a$11$placeholder_hash_replace_in_app', 'Interviewer', GETUTCDATE());
    SET @SofiaUserId = SCOPE_IDENTITY();
    
    UPDATE Users SET Name = 'Sofia Green' WHERE Id = @SofiaUserId;
    
    INSERT INTO InterviewerProfiles (UserId, Experience, Level, CreatedAt)
    VALUES (@SofiaUserId, '5-10 years', 'Mid-level', GETUTCDATE());
    
    DECLARE @SofiaProfileId INT = SCOPE_IDENTITY();
    DECLARE @PythonId INT = (SELECT Id FROM Skills WHERE Name = 'Python');
    DECLARE @DjangoId INT = (SELECT Id FROM Skills WHERE Name = 'Django');
    DECLARE @ReactId INT = (SELECT Id FROM Skills WHERE Name = 'React');
    
    INSERT INTO InterviewerSkills (InterviewerProfileId, SkillId, IsPrimary, CreatedAt)
    VALUES 
        (@SofiaProfileId, @PythonId, 1, GETUTCDATE()),
        (@SofiaProfileId, @DjangoId, 1, GETUTCDATE()),
        (@SofiaProfileId, @ReactId, 0, GETUTCDATE());
END
GO

IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'jason.lee@xebia.com')
BEGIN
    DECLARE @JasonUserId INT;
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES ('jason.lee@xebia.com', '$2a$11$placeholder_hash_replace_in_app', 'Interviewer', GETUTCDATE());
    SET @JasonUserId = SCOPE_IDENTITY();
    
    UPDATE Users SET Name = 'Jason Lee' WHERE Id = @JasonUserId;
    
    INSERT INTO InterviewerProfiles (UserId, Experience, Level, CreatedAt)
    VALUES (@JasonUserId, '5-10 years', 'Mid-level', GETUTCDATE());
    
    DECLARE @JasonProfileId INT = SCOPE_IDENTITY();
    DECLARE @PythonId2 INT = (SELECT Id FROM Skills WHERE Name = 'Python');
    DECLARE @DjangoId2 INT = (SELECT Id FROM Skills WHERE Name = 'Django');
    
    INSERT INTO InterviewerSkills (InterviewerProfileId, SkillId, IsPrimary, CreatedAt)
    VALUES 
        (@JasonProfileId, @PythonId2, 1, GETUTCDATE()),
        (@JasonProfileId, @DjangoId2, 1, GETUTCDATE());
END
GO

-- Insert new Interviewer user (password: 123456)
-- Email: interviewer@xebia.com
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'interviewer@xebia.com')
BEGIN
    DECLARE @NewInterviewerUserId INT;
    INSERT INTO Users (Email, PasswordHash, Role, CreatedAt)
    VALUES ('interviewer@xebia.com', '$2a$11$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Interviewer', GETUTCDATE());
    SET @NewInterviewerUserId = SCOPE_IDENTITY();
    
    UPDATE Users SET Name = 'John Interviewer' WHERE Id = @NewInterviewerUserId;
    
    INSERT INTO InterviewerProfiles (UserId, Experience, Level, CreatedAt)
    VALUES (@NewInterviewerUserId, '3-5 years', 'Mid-level', GETUTCDATE());
    
    DECLARE @NewInterviewerProfileId INT = SCOPE_IDENTITY();
    DECLARE @ReactId2 INT = (SELECT Id FROM Skills WHERE Name = 'React');
    DECLARE @NodeJsId INT = (SELECT Id FROM Skills WHERE Name = 'Node.js');
    DECLARE @JavaScriptId INT = (SELECT Id FROM Skills WHERE Name = 'JavaScript');
    
    INSERT INTO InterviewerSkills (InterviewerProfileId, SkillId, IsPrimary, CreatedAt)
    VALUES 
        (@NewInterviewerProfileId, @ReactId2, 1, GETUTCDATE()),
        (@NewInterviewerProfileId, @NodeJsId, 1, GETUTCDATE()),
        (@NewInterviewerProfileId, @JavaScriptId, 0, GETUTCDATE());
END
GO

-- Insert Open Positions
IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-001 - Full Stack Developer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-001 - Full Stack Developer', 'Full-stack developer position requiring React and Node.js skills', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-002 - Backend Developer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-002 - Backend Developer', 'Backend developer position requiring Django and Python skills', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-003 - Frontend Developer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-003 - Frontend Developer', 'Frontend developer position requiring React and JavaScript skills', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-004 - Full Stack Engineer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-004 - Full Stack Engineer', 'Full-stack engineer position requiring both frontend and backend skills', 'Engineering', 1, GETUTCDATE());
GO

-- Insert sample Interviewees
-- GHOP-001 candidates (Full-stack: React and Node.js)
DECLARE @Position1Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-001 - Full Stack Developer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'james.smith@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('James Smith', 'james.smith@example.com', 'React', @Position1Id, GETUTCDATE());
GO

DECLARE @Position1Id2 INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-001 - Full Stack Developer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'emma.wilson@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('Emma Wilson', 'emma.wilson@example.com', 'Node.js', @Position1Id2, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'emma.wilson@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, CreatedAt)
    VALUES ('Emma Wilson', 'emma.wilson@example.com', 'Node.js', GETUTCDATE());
GO

-- GHOP-002 candidates (Backend: Django)
DECLARE @Position2Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-002 - Backend Developer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'rachel.brown@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('Rachel Brown', 'rachel.brown@example.com', 'Python', @Position2Id, GETUTCDATE());
GO

DECLARE @Position2Id2 INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-002 - Backend Developer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'michael.chen@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('Michael Chen', 'michael.chen@example.com', 'Django', @Position2Id2, GETUTCDATE());
GO

-- GHOP-003 candidates (Frontend: React and JavaScript)
DECLARE @Position3Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-003 - Frontend Developer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'sarah.johnson@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('Sarah Johnson', 'sarah.johnson@example.com', 'React', @Position3Id, GETUTCDATE());
GO

DECLARE @Position3Id2 INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-003 - Frontend Developer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'david.martinez@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('David Martinez', 'david.martinez@example.com', 'JavaScript', @Position3Id2, GETUTCDATE());
GO

-- GHOP-004 candidates (Full-stack: Frontend and Backend)
DECLARE @Position4Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-004 - Full Stack Engineer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'lisa.anderson@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('Lisa Anderson', 'lisa.anderson@example.com', 'React', @Position4Id, GETUTCDATE());
GO

DECLARE @Position4Id2 INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-004 - Full Stack Engineer');
IF NOT EXISTS (SELECT * FROM Interviewees WHERE Email = 'robert.taylor@example.com')
    INSERT INTO Interviewees (Name, Email, PrimarySkill, PositionId, CreatedAt)
    VALUES ('Robert Taylor', 'robert.taylor@example.com', 'Node.js', @Position4Id2, GETUTCDATE());
GO

PRINT 'Seed data inserted successfully!';
GO
