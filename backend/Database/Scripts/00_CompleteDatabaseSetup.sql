-- AIModified:2026-01-11T05:42:58Z
-- Complete Database Setup Script
-- This script runs all database setup scripts in order
-- Execute this script to set up the entire database

-- Step 1: Create Database
:r 01_CreateDatabase.sql

-- Step 2: Create Tables
:r 02_CreateTables.sql

-- Step 3: Seed Data
:r 03_SeedData.sql

-- Step 4: Migrate Name and ProfilePictureUrl to Users
:r 04_MigrateNameAndProfilePictureToUsers.sql

-- Step 5: Add Open Positions
:r 05_AddOpenPositions.sql

-- Step 6: Seed Positions
:r 06_SeedPositions.sql

-- Step 7: Update Position Titles to GHOP Format (if needed)
:r 07_UpdatePositionTitlesToGHOPFormat.sql

PRINT 'Database setup completed successfully!';
GO
