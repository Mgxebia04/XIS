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

PRINT 'Database setup completed successfully!';
GO
