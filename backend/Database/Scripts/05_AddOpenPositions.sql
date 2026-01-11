-- AIModified:2026-01-11T14:58:01Z
-- Add Open Positions Table and Link to Interviewees
-- Run this script after the base tables are created

USE InterviewSchedulingDB;
GO

-- Open Positions Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'OpenPositions')
BEGIN
    CREATE TABLE OpenPositions (
        Id INT PRIMARY KEY IDENTITY(1,1),
        Title NVARCHAR(255) NOT NULL,
        Description NVARCHAR(1000) NULL,
        Department NVARCHAR(100) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NULL
    );
    
    CREATE INDEX IX_OpenPositions_IsActive ON OpenPositions(IsActive);
END
GO

-- Add PositionId to Interviewees Table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Interviewees') AND name = 'PositionId')
BEGIN
    ALTER TABLE Interviewees
    ADD PositionId INT NULL;
    
    ALTER TABLE Interviewees
    ADD CONSTRAINT FK_Interviewees_OpenPositions 
    FOREIGN KEY (PositionId) REFERENCES OpenPositions(Id) ON DELETE SET NULL;
    
    CREATE INDEX IX_Interviewees_PositionId ON Interviewees(PositionId);
END
GO
