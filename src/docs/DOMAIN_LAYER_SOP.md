# Domain Layer Standard Operating Procedure (SOP)

## Overview

The Domain Layer is the core of the clean architecture, representing the business entities, business rules, and domain services. This layer is completely independent of other layers and frameworks, containing pure business logic that is technology-agnostic.

## File Structure

The Domain Layer should follow a consistent and organized file structure:

```
/domain
  /entities       # Core business objects and value objects
  /interfaces     # Repository and service interfaces
  /services       # Domain service implementations
```

### Entities Directory

Contains the core business objects:

-   Each entity in its own file, named after the entity (e.g., `userDetails.ts`)
-   Interfaces defining entity properties (e.g., `userDetailsProps.ts`)
-   Value objects related to entities
-   Enums for domain-specific values

### Interfaces Directory

Contains contracts for repositories and services:

-   Repository interfaces for data access (e.g., `userRepository.ts`)
-   Service interfaces (e.g., `authenticationService.ts`)
-   Shared domain interfaces (e.g., `interface.ts`)

### Services Directory

Contains domain service implementations:

-   Domain-specific business logic that spans multiple entities
-   Named after the service function (e.g., `validationService.ts`)
-   Implementation of interfaces defined in the interfaces directory

## Components of the Domain Layer

### 1. Entities

Entities are the core business objects of the application, containing critical business rules and data:

-   **Entity Classes**: Represent domain objects with their properties and behaviors
-   **Value Objects**: Immutable objects representing concepts with no identity
-   **Enums**: Define specific sets of values for domain concepts

### 2. Domain Interfaces

-   **Repository Interfaces**: Define contracts for data access without implementation details
-   **Service Interfaces**: Define contracts for domain operations and business rules

### 3. Domain Services

-   Implement complex business logic that doesn't naturally fit within an entity
-   Coordinate operations between multiple entities
-   Implement domain-specific rules and policies

## Implementation Patterns

### Entity Implementation

1. **Property-based Structure**:
    - Define a props interface containing all entity properties
    - Implement entity class with private props field
    - Use static factory method for creation
    - Provide getter methods for all properties

```typescript
export interface EntityProps {
	id: string;
	// Other properties
}

export class Entity {
	private props: EntityProps;

	static create(props: EntityProps): Entity {
		const entity = new Entity();
		entity.props = props;
		return entity;
	}

	// Getter methods
	getId(): string {
		return this.props.id;
	}

	// Other getter methods
}
```

2. **Encapsulation**:

    - Make props private to protect state
    - Expose functionality through methods rather than direct property access
    - Validate data in factory methods or setters

3. **Business Rules**:
    - Implement business rules as methods on entities
    - Ensure entities maintain their invariants

### Domain Service Implementation

1. **Interface Definition**:
    - Define domain service interfaces with clear method signatures
    - Document business rules and expected behavior

```typescript
export interface DomainService {
	performBusinessOperation(param1: Type1, param2: Type2): Promise<ResultType>;
}
```

2. **Implementation**:
    - Implement domain services following interface contracts
    - Focus on business rules, not technical concerns
    - Avoid dependencies on infrastructure or external systems

### Domain Events

1. **Definition**:

    - Define domain events as immutable objects
    - Include all relevant information about what happened

2. **Publishing**:
    - Entities can publish domain events when state changes
    - Services can publish domain events when operations complete

## Best Practices

### 1. Dependency Rule

-   The Domain Layer should have no dependencies on other layers
-   All dependencies point inward toward the Domain Layer
-   Use dependency inversion for external requirements

### 2. Pure Business Logic

-   Keep the Domain Layer free from:
    -   Framework dependencies
    -   UI concerns
    -   Database-specific code
    -   External service integrations

### 3. Rich Domain Model

-   Prefer behavior-rich entities over anemic data models
-   Implement business rules inside entities where they belong
-   Use domain services for logic spanning multiple entities

### 4. Immutability

-   Make domain objects immutable where possible
-   Use builders or factory methods for object creation
-   Avoid setters that can lead to invalid state

### 5. Naming Conventions

-   Use ubiquitous language from the business domain
-   Be consistent with naming patterns across all modules
-   Name entities and services based on domain concepts, not technical concerns

### 6. Testing

-   Domain Layer should be the most thoroughly tested
-   Unit test business rules and entity behavior
-   Mock external dependencies using interfaces

## Common Anti-patterns to Avoid

1. **Anemic Domain Model**: Entities with getters/setters but no behavior
2. **Infrastructure Leakage**: Domain layer with infrastructure dependencies
3. **Service Overuse**: Using services for logic that belongs in entities
4. **Inconsistent Validation**: Validating the same rules in multiple places
5. **Direct Property Access**: Exposing internal state rather than behaviors

## Module-Specific Conventions

### Real Estate Modules

-   Entities like PropertyDetail, AgentDetails, and ListingDetails follow a consistent pattern
-   Use specific getters to access complex properties
-   Implement domain-specific validation rules within entities
-   Use domain services for complex operations like search, calculation, and formatting

## Relationship with Other Layers

-   **Application Layer**: Uses domain entities and services to execute use cases
-   **Infrastructure Layer**: Implements domain interfaces with technical details
-   **Presentation Layer**: Transforms domain objects to presentation models

## Conclusion

The Domain Layer is the heart of the clean architecture, containing the core business logic and rules. By maintaining a clean domain layer, the application becomes more maintainable, testable, and adaptable to changing business requirements.
