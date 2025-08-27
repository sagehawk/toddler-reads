# Overview

This is "ToddlerReads" - a toddler-friendly phonics learning web application built for children aged 18-36 months. The app follows a "Drill & Play" model with two distinct modes - a parent-controlled drill mode for interactive learning sessions, and an automated play mode for independent practice. The application focuses on teaching phonemic awareness through letter sounds with a clean, iOS-inspired design that prioritizes child safety and distraction-free learning.

## Recent Strategic Upgrades (January 2025)
- **V2.0 Learning Library Platform** - evolved from single feature to comprehensive multi-module learning platform
- **Nunito Typography** - upgraded to Nunito font family for enhanced readability and premium feel
- **Centralized Module Navigation** - replaced Magic Letter Tray with sophisticated dropdown navigation system
- **CVC Words Module** - implemented first upsell feature with -at, -et, and -it word families for blended learning
- **Immersive Content Display** - significantly enlarged central learning card for maximum visual impact
- **Keyboard Navigation** - added left/right arrow key functionality for seamless navigation through content
- **Dynamic Color Matching** - letters and words display in coordinated colors matching their selection buttons
- **Premium Platform Architecture** - structured foundation for future modules (Sight Words, Numbers, Sentences)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS with a custom iOS-inspired theme featuring rounded corners, subtle shadows, and high-contrast colors optimized for toddlers
- **State Management**: Custom React hooks (usePhonicsSettings, useSpeechSynthesis) with local state management using useState and useEffect
- **Storage**: Browser localStorage for persisting user settings (deck selection, speed, loops) across sessions

## Backend Architecture
- **Server**: Express.js with TypeScript serving as a minimal API server
- **Development**: Vite development server with middleware integration for seamless full-stack development
- **Build Process**: Vite for frontend bundling and esbuild for server compilation
- **Database Schema**: Drizzle ORM with PostgreSQL dialect configured, though currently using in-memory storage for user data

## Core Features Architecture
- **Drill Mode**: Parent-controlled interactive mode with manual navigation and tap-to-play audio
- **Play Mode**: Automated full-screen mode with customizable speed and loop settings
- **Settings Persistence**: localStorage-based configuration management with automatic restoration on app load
- **Speech Synthesis**: Web Speech API integration with child-friendly voice selection and optimized speech parameters

## Data Structure
- **Phonics Decks**: Static letter collections (A-E, F-J, Full Alphabet) with letter-to-sound mappings
- **Settings Schema**: TypeScript interfaces for speed options (slow/medium/fast), loop counts (1x, 3x, 5x, infinite), and mode selection
- **Audio Management**: Custom hook managing speech synthesis with automatic voice selection and playback controls

# External Dependencies

## UI and Styling
- **Radix UI**: Comprehensive set of accessible React components for dialogs, buttons, and interactive elements
- **Tailwind CSS**: Utility-first CSS framework with custom configuration for iOS-inspired design
- **Class Variance Authority**: Type-safe component variants for consistent styling patterns
- **Lucide React**: Icon library providing child-friendly iconography

## Development and Build Tools
- **Vite**: Frontend build tool with development server and hot module replacement
- **TypeScript**: Type safety across the entire application stack
- **PostCSS**: CSS processing with Tailwind integration and autoprefixer

## Database and ORM
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database service (configured but not actively used)
- **Drizzle Kit**: Database migration and schema management tools

## Speech and Audio
- **Web Speech API**: Native browser speech synthesis for letter sound playback
- **Custom Speech Hook**: Abstraction layer for managing speech synthesis with child-optimized settings

## State and Data Management
- **React Query (TanStack)**: Data fetching and caching library for potential future API integration
- **Zod**: Schema validation for settings and data structures
- **Date-fns**: Date manipulation utilities for potential future features