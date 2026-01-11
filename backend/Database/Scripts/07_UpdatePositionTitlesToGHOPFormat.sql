-- AIModified:2026-01-11T15:34:38Z
-- Update existing OpenPositions titles to GHOP-XXX format
-- Run this script to update existing position titles

USE InterviewSchedulingDB;
GO

-- Update existing positions to GHOP-XXX format
-- Map old titles to new GHOP format
UPDATE OpenPositions 
SET Title = 'GHOP-001'
WHERE Title = 'Senior Software Engineer' AND Title != 'GHOP-001';
GO

UPDATE OpenPositions 
SET Title = 'GHOP-002'
WHERE Title = 'Python Developer' AND Title != 'GHOP-002';
GO

UPDATE OpenPositions 
SET Title = 'GHOP-003'
WHERE Title = 'Frontend Developer' AND Title != 'GHOP-003';
GO

UPDATE OpenPositions 
SET Title = 'GHOP-004'
WHERE Title = 'Full Stack Developer' AND Title != 'GHOP-004';
GO

PRINT 'Position titles updated to GHOP-XXX format successfully!';
GO
