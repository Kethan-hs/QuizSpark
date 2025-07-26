# i-Quiz: Real-Time Quiz Application

## Overview

i-Quiz is a web-based real-time quiz application built to support 200+ concurrent users. The application allows hosts to create and manage interactive quizzes while enabling players to join using a PIN system. The system features real-time updates, live leaderboards, and an engaging user experience with animated transitions and responsive design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system and CSS variables
- **Forms**: React Hook Form with Zod validation

The frontend follows a page-based architecture with dedicated routes for different quiz phases:
- Dashboard (quiz management)
- Quiz creation interface
- Join quiz flow
- Lobby (waiting room)
- Active quiz gameplay
- Live leaderboard
- Final results

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Module System**: ES modules for modern JavaScript support
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Storage**: In-memory storage implementation with interface for scalability
- **API Design**: RESTful endpoints for CRUD operations

The backend uses a layered architecture with:
- Route handlers for API endpoints
- Storage abstraction layer for data persistence
- Schema validation using Zod
- Development middleware with Vite integration

## Key Components

### Database Schema
The application uses PostgreSQL with the following core entities:
- **Users**: Basic authentication and host identification
- **Quizzes**: Quiz metadata including title, description, and timing
- **Questions**: Multiple choice questions with up to 4 options
- **Quiz Sessions**: Live quiz instances with PIN-based access
- **Players**: Participants in quiz sessions
- **Player Responses**: Answer submissions with timing data

### Real-time Features
- Session-based quiz management with unique PIN generation
- Real-time player tracking and score updates
- Live question progression with automatic timing
- Instant leaderboard updates

### UI Components
- Reusable player cards with avatar generation
- Quiz timer with visual countdown
- Responsive design supporting mobile, tablet, and desktop
- Animated transitions and progress indicators
- Toast notifications for user feedback

## Data Flow

### Quiz Creation Flow
1. Host creates quiz with metadata and questions
2. System validates input using Zod schemas
3. Quiz and questions stored in database
4. Host can initiate quiz session

### Player Join Flow
1. Player enters 6-digit PIN and display name
2. System validates session exists and is in waiting state
3. Player added to session and redirected to lobby
4. Real-time updates show new players to host

### Quiz Gameplay Flow
1. Host starts session, updating status to "active"
2. Questions displayed sequentially with countdown timer
3. Players submit answers with response time tracking
4. Scores calculated based on correctness and speed
5. Leaderboard updates after each question
6. Session ends when all questions completed

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18+ with hooks and concurrent features
- **UI Libraries**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS processing
- **State Management**: TanStack Query for server synchronization
- **Form Handling**: React Hook Form with Zod resolvers
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon PostgreSQL for serverless database hosting
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin and HMR
- **Type Checking**: TypeScript with strict configuration
- **Linting**: ESNext modules with modern JavaScript features
- **Replit Integration**: Custom plugins for development environment

## Deployment Strategy

### Build Process
- Frontend built using Vite with optimized bundle output
- Backend compiled using esbuild for Node.js production
- Static assets served from dist/public directory
- Environment variables for database configuration

### Development Workflow
- Hot module replacement for rapid development
- Automatic TypeScript compilation
- Database migrations using Drizzle Kit
- Development server with API proxy

### Production Considerations
- Database connection pooling for scalability
- Environment-based configuration
- Static file serving with Express
- Process management for Node.js application

The architecture supports horizontal scaling through the storage abstraction layer, allowing future integration of Redis for session management and Socket.io for real-time features as the user base grows beyond the current implementation.