# Overview

This is a full-stack distributor management system built with React, Express, and TypeScript. The application provides a comprehensive dashboard for managing retailers, products, orders, and inventory with role-based views for both distributors and manufacturers. It features real-time data visualization, export capabilities, and a responsive design that works across desktop and mobile devices.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend uses React with TypeScript and follows a component-based architecture:

- **UI Framework**: Built with shadcn/ui components using Radix UI primitives and Tailwind CSS for consistent design
- **State Management**: React Query (TanStack Query) for server state management with optimistic updates
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Responsive Design**: Mobile-first approach with separate navigation components for desktop and mobile views
- **Role Management**: Context-based role switching between distributor and manufacturer views

## Backend Architecture

The backend is built with Express.js and follows RESTful API principles:

- **Server Framework**: Express.js with TypeScript for type safety
- **Data Access**: In-memory storage implementation with interface-based architecture for easy database swapping
- **API Structure**: RESTful endpoints organized by resource (retailers, products, orders, inventory)
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Development Tools**: Hot module reloading with Vite integration in development

## Data Storage Solutions

Currently uses an in-memory storage system with plans for PostgreSQL integration:

- **Current**: MemStorage class implementing IStorage interface with Map-based data structures
- **Schema**: Drizzle ORM schema definitions ready for PostgreSQL migration
- **Database Config**: Drizzle configuration set up for PostgreSQL with Neon Database serverless
- **Data Models**: Type-safe schemas for retailers, products, orders, inventory, and sales targets

## Core Features

- **Dashboard**: Real-time metrics, sales progress tracking, and recent activity feed
- **Order Management**: Create, view, and track orders with status updates
- **Inventory Management**: Stock level monitoring with low-stock alerts and reorder thresholds
- **Export Functionality**: CSV export capabilities for orders and inventory data
- **Role-Based Views**: Different interfaces for distributor and manufacturer roles
- **Responsive Design**: Optimized for both desktop and mobile experiences

# External Dependencies

## Frontend Dependencies
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema definition
- **Wouter**: Lightweight client-side routing
- **Lucide React**: Icon library

## Backend Dependencies
- **Express.js**: Web application framework
- **Drizzle ORM**: Type-safe SQL toolkit for database operations
- **Neon Database**: Serverless PostgreSQL database (configured but not yet implemented)
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Zod**: Schema validation for API endpoints

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS integration

## Build and Deployment
The application is configured for both development and production environments with separate build processes for client and server code. The development setup includes hot module reloading and error overlays for improved developer experience.