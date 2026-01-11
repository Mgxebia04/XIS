-- AIModified:2026-01-11T05:42:58Z
-- Create Database Script for Interview Scheduling System
-- Run this script to create the database

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'InterviewSchedulingDB')
BEGIN
    CREATE DATABASE InterviewSchedulingDB;
END
GO

USE InterviewSchedulingDB;
GO
