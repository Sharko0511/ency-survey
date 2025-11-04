# Survey Backend Project Instructions

This is a Next.js project for a survey feature backend with Supabase integration.

## Project Structure

- API routes for survey management
- Supabase database integration
- Edge functions for real-time features
- TypeScript throughout the codebase

## Coding Guidelines

- Use TypeScript with strict mode
- Follow Next.js App Router conventions
- Use Supabase client for database operations
- Implement proper error handling
- Use environment variables for configuration

## Database Schema

- Surveys table with metadata
- Questions table linked to surveys
- Responses table for user submissions
- Users table for authentication

## API Endpoints

- GET/POST /api/surveys - Manage surveys
- GET/POST /api/surveys/[id]/questions - Manage questions
- POST /api/surveys/[id]/responses - Submit responses
