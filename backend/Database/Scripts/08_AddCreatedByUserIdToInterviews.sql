-- AIModified:2026-01-11T16:22:15Z
-- Add CreatedByUserId column to Interviews table
-- This tracks which HR user scheduled the interview

USE InterviewSchedulingDB;
GO

-- Add CreatedByUserId column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Interviews') AND name = 'CreatedByUserId')
BEGIN
    ALTER TABLE Interviews
    ADD CreatedByUserId INT NULL;
    
    ALTER TABLE Interviews
    ADD CONSTRAINT FK_Interviews_CreatedByUser 
    FOREIGN KEY (CreatedByUserId) REFERENCES Users(Id) ON DELETE SET NULL;
    
    CREATE INDEX IX_Interviews_CreatedByUserId ON Interviews(CreatedByUserId);
END
GO

PRINT 'CreatedByUserId column added to Interviews table successfully!';
GO
