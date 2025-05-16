# Clean Architecture Implementation Overview

## Project Structure

The project implements Clean Architecture principles with a modular approach:

### Modules

- **track-properties**
- **affordability-search**
- **find-agent**
- **enquiries**

### Typical Module Structure

Each module follows the clean architecture layered approach:

- **presentation**: UI components and controllers
- **application**: Use cases and application logic
- **domain**: Business entities and rules
- **infrastructure**: External interfaces implementation
- **interfaces**: Interface definitions
- **mapper**: Object transformation logic
- **repositories**: Data access abstractions
- **services**: Domain services

### Shared Resources

Common components shared across modules:

- **utils**: Utility functions
- **factories**: Factory patterns for object creation
- **services**: Shared services

## Affordability Search Module - Deep Dive

The affordability-search module demonstrates a robust implementation of Clean Architecture principles:

### Domain Layer

The core of the application with business rules and entities.

- **entities/**

  - Pure business objects (e.g., `ListingDetails`, `SuburbDetails`)
  - No dependencies on external frameworks
  - Encapsulates business rules

- **interfaces/**

  - Defines core domain interfaces

- **services/**
  - Contains domain-specific business logic

### Application Layer

Coordinates the flow of data and orchestrates use cases.

- **useCases/**
  - Implemented as separate directories for each use case:
    - `getSuburbTrendsAndListings`
    - `getSuburbsWithListingCount`
    - `getTourismRegions`
  - Each use case typically includes:
    - Main use case class that implements the business logic
    - Request/Response DTOs
    - Mappers for transforming data
    - Factory for dependency creation

For example, the `GetSuburbTrendsAndListingsUseCase` performs:

- Fetching listings based on filters
- Getting counts for various listing types
- Retrieving suburb trends and details
- Orchestrating multiple repository calls

### Infrastructure Layer

Implements interfaces defined by the domain layer.

- **repositories/**
  - Implementation of repository interfaces (`ListingRepoImpl`, `LocationRepoImpl`)
  - Contains query builders for external services (Elasticsearch)
  - Handles communication with databases and external systems
  - Implements data transformation from external sources to domain entities

### Presentation Layer - Detailed Analysis

The presentation layer serves as the entry point for external requests and implements the adapter pattern to bridge the application's core functionality with the web framework (Express.js in this case).

- **controllers/**

  - Maps HTTP requests to application use cases
  - Uses factories to create use case instances
  - Handles error cases and response formatting
  - Follows a consistent pattern:
    1. Extracts and validates request parameters
    2. Converts web request data to application DTOs
    3. Creates use case instances via factories
    4. Executes use cases and transforms responses
    5. Handles errors with appropriate logging
  - Uses static methods to eliminate need for controller instance management

- **routes/**

  - Defines API endpoints using Express Router
  - Connects routes to controller methods
  - Applies validation middleware to each route
  - Provides clean, declarative API structure:
    - GET `/tourism-regions`
    - GET `/suburbs-with-listing-count`
    - GET `/suburb-trends-and-listings`

- **validation/**

  - Implements request validation using Joi schema
  - Defines validation rules for all API endpoints
  - Enforces type safety and required fields
  - Creates clear contract for API consumers
  - Prevents invalid data from reaching application layer

- **interfaces/**
  - Defines TypeScript interfaces for request parameters
  - Provides type safety throughout the presentation layer
  - Creates a clear contract between the HTTP layer and controllers
  - Extends framework types (ValidatedRequestSchema) with domain-specific types

#### Key Presentation Layer Patterns

1. **Adapter Pattern**: The controllers act as adapters between the HTTP interface and the application use cases
2. **Validation Middleware**: Leverages express-joi-validation to enforce input validation
3. **Factory Method Pattern**: Uses factories to create properly configured use case instances
4. **Static Controller Methods**: Avoids unnecessary instance creation for request handling
5. **Consistent Response Format**: All responses follow the same structure: `{ success: boolean, data: any }`
6. **Error Delegation**: Errors are logged and passed to Express error handling middleware

This presentation layer design effectively decouples the web framework (Express) from the application's core logic, allowing the business rules to remain isolated from delivery mechanism details.

## Clean Architecture Flow in Affordability Search

1. **HTTP Request** → Routes → Controller
2. Controller creates **Use Case** instance via Factory
3. Use Case coordinates **Repository** interactions
4. Repositories implement interfaces defined in the domain
5. Domain Entities remain pure and framework-independent
6. Results flow back up through the layers with appropriate transformations

## Benefits of the Implementation

1. **Separation of Concerns**: Each layer has specific responsibilities
2. **Dependency Rule**: Dependencies point inward toward the domain
   - Domain has no external dependencies
   - Application depends only on domain
   - Infrastructure implements interfaces defined in domain
   - Presentation depends on application
3. **Testability**: Business logic can be tested without external dependencies
4. **Flexibility**: Infrastructure implementations can be swapped with minimal impact

## Implementation Notes

The implementation creates clear boundaries between modules, allowing each to evolve independently while sharing common infrastructure through the shared directory.

This architecture supports the principles of:

- Independence from frameworks
- Testability without external elements
- Independence from UI
- Independence from database
- Independence from external agencies

Each module can be reasoned about, developed, and tested in isolation while still functioning as part of the larger system.
