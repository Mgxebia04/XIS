-- AIModified:2026-01-11T15:52:57Z
-- Seed Open Positions Data
-- Run this script after creating the OpenPositions table

USE InterviewSchedulingDB;
GO

-- Insert Open Positions with GHOP-XXX format
IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-001')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-001', 'Full-stack development role requiring React and Node.js expertise', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-002')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-002', 'Backend development role with Django framework experience', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-003')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-003', 'React and JavaScript focused frontend development role', 'Engineering', 1, GETUTCDATE());
GO

IF NOT EXISTS (SELECT * FROM OpenPositions WHERE Title = 'GHOP-004')
    INSERT INTO OpenPositions (Title, Description, Department, IsActive, CreatedAt)
    VALUES ('GHOP-004', 'Full-stack development with both frontend and backend skills', 'Engineering', 1, GETUTCDATE());
GO

-- Update existing Interviewees with Position assignments
DECLARE @GHOP001Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-001');
DECLARE @GHOP002Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-002');
DECLARE @GHOP003Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-003');
DECLARE @GHOP004Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-004');

-- Assign positions to interviewees - GHOP-001 (Full-stack: React and Node.js)
UPDATE Interviewees 
SET PositionId = @GHOP001Id
WHERE Email = 'james.smith@example.com';

UPDATE Interviewees 
SET PositionId = @GHOP001Id
WHERE Email = 'emma.wilson@example.com';

-- Assign positions to interviewees - GHOP-002 (Backend: Django)
UPDATE Interviewees 
SET PositionId = @GHOP002Id
WHERE Email = 'rachel.brown@example.com';

UPDATE Interviewees 
SET PositionId = @GHOP002Id
WHERE Email = 'michael.chen@example.com';

-- Assign positions to interviewees - GHOP-003 (Frontend: React and JavaScript)
UPDATE Interviewees 
SET PositionId = @GHOP003Id
WHERE Email = 'sarah.johnson@example.com';

UPDATE Interviewees 
SET PositionId = @GHOP003Id
WHERE Email = 'david.martinez@example.com';

-- Assign positions to interviewees - GHOP-004 (Full-stack: Frontend and Backend)
UPDATE Interviewees 
SET PositionId = @GHOP004Id
WHERE Email = 'lisa.anderson@example.com';

UPDATE Interviewees 
SET PositionId = @GHOP004Id
WHERE Email = 'robert.taylor@example.com';
GO

PRINT 'Open positions seeded successfully!';
GO
