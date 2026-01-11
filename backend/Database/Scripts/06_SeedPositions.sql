-- AIModified:2026-01-11T14:58:01Z
-- Seed Open Positions Data
-- Run this script after creating the OpenPositions table

USE InterviewSchedulingDB;
GO

-- Insert Open Positions
IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'Senior Software Engineer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('Senior Software Engineer', 'Full-stack development role requiring React and Node.js expertise', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'Python Developer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('Python Developer', 'Backend development role with Django framework experience', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'Frontend Developer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('Frontend Developer', 'React and JavaScript focused frontend development role', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'Full Stack Developer')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('Full Stack Developer', 'Full-stack development with both frontend and backend skills', 'Engineering', 1, GETUTCDATE());
GO

-- Update existing Interviewees with Position assignments
DECLARE @SeniorSEId INT = (SELECT Id FROM OpenPositions WHERE Title = 'Senior Software Engineer');
DECLARE @PythonDevId INT = (SELECT Id FROM OpenPositions WHERE Title = 'Python Developer');
DECLARE @FrontendDevId INT = (SELECT Id FROM OpenPositions WHERE Title = 'Frontend Developer');
DECLARE @FullStackDevId INT = (SELECT Id FROM OpenPositions WHERE Title = 'Full Stack Developer');

-- Assign positions to existing interviewees
UPDATE Interviewees 
SET PositionId = @PythonDevId
WHERE Email = 'rachel.brown@example.com' AND PositionId IS NULL;

UPDATE Interviewees 
SET PositionId = @FullStackDevId
WHERE Email = 'james.smith@example.com' AND PositionId IS NULL;
GO

PRINT 'Open positions seeded successfully!';
GO
