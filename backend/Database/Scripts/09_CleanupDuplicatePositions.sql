-- AIModified:2026-01-12T01:41:48Z
-- Cleanup Duplicate OpenPositions with Descriptions in Title
-- This script removes positions with titles like "GHOP-XXX - Description"
-- and keeps only the simple "GHOP-XXX" format entries
-- It also updates any Interviewees that reference the duplicate positions

USE InterviewSchedulingDB;
GO

-- First, update any Interviewees that reference positions with descriptions in title
-- to point to the simple GHOP-XXX format positions

-- Update Interviewees referencing "GHOP-001 - Full Stack Developer" to "GHOP-001"
DECLARE @OldGHOP001Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-001 - Full Stack Developer');
DECLARE @NewGHOP001Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-001');
IF @OldGHOP001Id IS NOT NULL AND @NewGHOP001Id IS NOT NULL
BEGIN
    UPDATE Interviewees 
    SET PositionId = @NewGHOP001Id
    WHERE PositionId = @OldGHOP001Id;
END
GO

-- Update Interviewees referencing "GHOP-002 - Backend Developer" to "GHOP-002"
DECLARE @OldGHOP002Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-002 - Backend Developer');
DECLARE @NewGHOP002Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-002');
IF @OldGHOP002Id IS NOT NULL AND @NewGHOP002Id IS NOT NULL
BEGIN
    UPDATE Interviewees 
    SET PositionId = @NewGHOP002Id
    WHERE PositionId = @OldGHOP002Id;
END
GO

-- Update Interviewees referencing "GHOP-003 - Frontend Developer" to "GHOP-003"
DECLARE @OldGHOP003Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-003 - Frontend Developer');
DECLARE @NewGHOP003Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-003');
IF @OldGHOP003Id IS NOT NULL AND @NewGHOP003Id IS NOT NULL
BEGIN
    UPDATE Interviewees 
    SET PositionId = @NewGHOP003Id
    WHERE PositionId = @OldGHOP003Id;
END
GO

-- Update Interviewees referencing "GHOP-004 - Full Stack Engineer" to "GHOP-004"
DECLARE @OldGHOP004Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-004 - Full Stack Engineer');
DECLARE @NewGHOP004Id INT = (SELECT Id FROM OpenPositions WHERE Title = 'GHOP-004');
IF @OldGHOP004Id IS NOT NULL AND @NewGHOP004Id IS NOT NULL
BEGIN
    UPDATE Interviewees 
    SET PositionId = @NewGHOP004Id
    WHERE PositionId = @OldGHOP004Id;
END
GO

-- Delete positions with descriptions in title (keep only simple GHOP-XXX format)
DELETE FROM OpenPositions 
WHERE Title LIKE 'GHOP-% - %';
GO

PRINT 'Duplicate positions with descriptions removed successfully!';
GO
