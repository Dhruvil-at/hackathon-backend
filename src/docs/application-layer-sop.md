# Standard Operating Procedure (SOP): Clean Architecture Application Layer

## 1. Purpose

This document provides guidelines for implementing the application layer in clean architecture applications. The application layer serves as the orchestrator between the domain layer and external interfaces, coordinating the flow of data and implementing use cases.

## 2. Scope

This SOP applies to the development of the application layer in applications following clean architecture principles, regardless of the specific domain or external interfaces.

## 3. Directory Structure

```
application/
├── useCases/           # Business use cases organized by feature
│   ├── useCase1/       # Files related to a specific use case
│   │   ├── useCase1.ts                  # Main use case implementation
│   │   ├── useCase1RequestDto.ts        # Input data structure
│   │   ├── useCase1ResponseDto.ts       # Output data structure
│   │   ├── useCase1Factory.ts           # Factory for dependency creation
│   │   └── mappers/                     # Transformation utilities
│   └── useCase2/       # Another use case with similar structure
├── constants/          # Application-specific constants
├── interfaces/         # Shared interfaces for the application layer
└── common/             # Shared application logic (optional)
    ├── dtos/           # Common data transfer objects
    └── services/       # Application-level services
```

## 4. Component Responsibilities

### 4.1 Use Cases

Use cases implement application-specific business rules and represent the primary actions that can be performed in the system.

#### Implementation Rules:

1. Each use case should handle one specific business operation
2. Use cases should depend only on domain entities and repository interfaces (never on implementations)
3. Use constructor dependency injection for all dependencies
4. Focus on orchestration of domain objects rather than implementing business logic
5. Input and output should be plain DTOs with no behavior
6. Implement an `execute` method that takes a request DTO and returns a response DTO
7. Use private helper methods to organize complex orchestration logic
8. Respect the single responsibility principle - split complex use cases if necessary

#### Example:

```typescript
export class GetResourceUseCase {
	constructor(
		private resourceRepo: ResourceRepository,
		private relatedDataRepo: RelatedDataRepository
	) {}

	async execute(dto: GetResourceRequestDto): Promise<GetResourceResponseDto> {
		// 1. Fetch primary data
		const resource = await this.resourceRepo.getById(dto.id);
		if (!resource) {
			throw new Error('Resource not found');
		}

		// 2. Fetch related data in parallel
		const [metadata, relatedItems] = await Promise.all([
			this.resourceRepo.getMetadata(dto.id),
			this.relatedDataRepo.getRelatedItems(dto.id, dto.filter)
		]);

		// 3. Transform data using mappers
		const resourceDto = ResourceMapper.toDto(resource);
		const relatedItemsDto = RelatedItemsMapper.toDto(relatedItems);

		// 4. Return composed response
		return {
			resource: resourceDto,
			metadata,
			relatedItems: relatedItemsDto
		};
	}

	// Private helper methods for complex operations
	private async enrichResourceData(resource, dto) {
		// Implementation details
	}
}
```

### 4.2 DTOs (Data Transfer Objects)

DTOs define the input and output structures for use cases, serving as the contract between layers.

#### Implementation Rules:

1. Define separate DTOs for request (input) and response (output)
2. Use interfaces for DTO definitions
3. Keep DTOs as plain data structures with no behavior
4. Include only necessary fields for the specific use case
5. Use TypeScript for type safety and documentation
6. Nest DTOs when representing complex object hierarchies
7. Use optional properties for non-required fields

#### Example:

```typescript
// Request DTO
export interface GetResourceRequestDto {
	id: number;
	filter?: string;
	includeMetadata?: boolean;
}

// Response DTO
export interface GetResourceResponseDto {
	resource: {
		id: number;
		name: string;
		status: string;
		// Only fields needed by the presentation layer
	};
	metadata?: {
		createdAt: Date;
		updatedAt: Date;
	};
	relatedItems: Array<{
		id: number;
		name: string;
	}>;
}
```

### 4.3 Factories

Factories handle dependency creation and wiring for use cases.

#### Implementation Rules:

1. Create a factory for each use case
2. Hide infrastructure details from consumers
3. Return fully constructed use case instances with all dependencies
4. Follow a consistent naming pattern
5. Include service dependencies like logging along with the use case
6. Centralize infrastructure initialization
7. Handle configuration and environment-specific setups

#### Example:

```typescript
export class GetResourceFactory {
	static create(req: any) {
		// Get shared infrastructure components
		const db = DatabaseFactory.create(req);

		// Create repositories
		const resourceRepo = new ResourceRepositoryImpl(db);
		const relatedDataRepo = new RelatedDataRepositoryImpl(db);

		// Create services
		const loggerService = new LoggerService(req);

		// Create and return the use case with dependencies
		const useCase = new GetResourceUseCase(resourceRepo, relatedDataRepo);

		return { useCase, loggerService };
	}
}
```

### 4.4 Mappers

Mappers handle transformation between domain objects and DTOs.

#### Implementation Rules:

1. Create mapper classes with static methods
2. Implement one-way transformation (domain → DTO or DTO → domain)
3. Keep mappers close to the use cases that use them
4. Handle complex transformations like nested object mapping
5. Preserve domain object integrity by only operating on data copies
6. Split large mappers into smaller, focused mappers
7. Compose mappers for complex transformations

#### Example:

```typescript
export class ResourceMapper {
	static toDto(entity: Resource): ResourceDto {
		return {
			id: entity.getId(),
			name: entity.getName(),
			status: entity.getStatus(),
			// Transform any complex domain concepts into simple DTO structures
			categories: entity.getCategories().map((c) => c.getName())
		};
	}

	static toDomain(dto: CreateResourceDto): Resource {
		return Resource.create({
			name: dto.name,
			status: dto.status,
			// Transform simple DTO data into domain concepts
			categories: dto.categoryIds.map((id) => CategoryId.create(id))
		});
	}
}
```

### 4.5 Constants and Configuration

Constants provide centralized configuration for use cases and help maintain consistency.

#### Implementation Rules:

1. Group related constants in named objects
2. Use uppercase for constant names
3. Place application-specific constants in the application layer
4. Place domain-specific constants in the domain layer
5. Use descriptive names that indicate purpose

#### Example:

```typescript
export const PAGINATION = {
	DEFAULT_PAGE_SIZE: 20,
	MAX_PAGE_SIZE: 100,
	MIN_PAGE: 1
};

export const RESOURCE_LIMITS = {
	MAX_ITEMS_PER_REQUEST: 50,
	MAX_SEARCH_TERMS: 10
};

export const FEATURE_FLAGS = {
	ENABLE_NEW_SEARCH: process.env.ENABLE_NEW_SEARCH === 'true'
};
```

### 4.6 Shared Interfaces

Shared interfaces define common types used across multiple use cases.

#### Implementation Rules:

1. Place in dedicated interfaces directory
2. Keep interfaces focused and cohesive
3. Use for cross-cutting concerns in the application layer
4. Don't duplicate domain interfaces
5. Document the purpose of each interface

#### Example:

```typescript
export interface PaginatedResult<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	hasNext: boolean;
}

export interface SearchFilters {
	term?: string;
	categories?: string[];
	dateFrom?: Date;
	dateTo?: Date;
}
```

## 5. Layer Interaction Rules

The application layer serves as the coordinator between the presentation layer and the domain/infrastructure layers, following specific interaction rules:

### 5.1 Application to Presentation Layer Interaction

-   Application layer exposes use cases to the presentation layer
-   Use cases accept request DTOs from presentation layer
-   Use cases return response DTOs to presentation layer
-   Application layer never depends on presentation layer components
-   Error handling is consistent and domain errors are translated to application-specific errors
-   Factory methods shield presentation layer from infrastructure implementation details

### 5.2 Application to Domain Layer Interaction

-   Application layer depends on domain entities and interfaces
-   Domain objects are used as-is within use cases
-   Business rules are delegated to domain entities and services
-   Use cases orchestrate domain objects but don't implement core business logic
-   Domain entities maintain their invariants and encapsulation
-   Domain interfaces define contracts that application layer depends on

### 5.3 Application to Infrastructure Layer Interaction

-   Application layer uses repository interfaces defined in the domain layer
-   Infrastructure implementations are injected via factories
-   Repository interfaces shield use cases from database/external service details
-   Use cases never directly depend on infrastructure implementations
-   Mappers translate between infrastructure data models and domain entities
-   Application layer delegates cross-cutting concerns (logging, caching) to infrastructure services

### 5.4 Data Transformation Between Layers

-   Domain entities are transformed to DTOs before being sent to presentation layer
-   Presentation input is transformed to domain objects before business rules are applied
-   Mappers handle all transformations and ensure domain integrity
-   Each layer operates on data structures appropriate to its concerns
-   Infrastructure data models are never exposed directly to use cases

## 6. Best Practices

### 6.1 Dependency Injection

-   Use constructor injection for all dependencies
-   Depend on interfaces, not implementations
-   Use factory pattern for complex dependency creation
-   Keep dependencies explicit and visible
-   Group related dependencies with similar lifecycle

### 6.2 Error Handling

-   Use domain-specific errors when possible
-   Throw meaningful errors with context
-   Don't leak infrastructure exceptions to the presentation layer
-   Consider implementing a Result/Either pattern for complex error cases
-   Document expected errors in method signatures or comments

### 6.3 Asynchronous Operations

-   Use Promise-based APIs consistently
-   Leverage Promise.all for parallel operations
-   Maintain clean async/await patterns (avoid callback patterns)
-   Handle failures appropriately
-   Consider using throttling for multiple parallel requests

### 6.4 Domain Integrity

-   Keep domain objects pure within use cases
-   Don't modify domain objects directly in use cases
-   Use domain services for complex operations
-   Respect domain invariants and business rules
-   Call domain object methods rather than manipulating properties

### 6.5 Composition

-   Compose complex operations from smaller, focused operations
-   Consider composing use cases for complex workflows
-   Use private methods to encapsulate implementation details
-   Keep the public interface minimal and focused

## 7. Testing

### 7.1 Unit Testing

-   Test use cases in isolation with mocked repositories
-   Verify correct orchestration of dependencies
-   Test both success and failure scenarios
-   Ensure correct transformation of data between layers
-   Mock external dependencies using interfaces

### 7.2 Integration Testing

-   Test use cases with real repository implementations
-   Verify end-to-end flow with database interactions
-   Test complex queries and data transformations
-   Focus on business requirements and use cases
-   Test use case composition when relevant

## 8. Cross-Cutting Concerns

### 8.1 Logging

-   Log key business events within use cases
-   Use structured logging with context
-   Don't expose logging infrastructure directly to use cases
-   Inject logging services through the factory
-   Log at appropriate levels (info for business events, error for exceptions)

### 8.2 Validation

-   Validate inputs at the use case boundary
-   Implement domain-specific validation rules
-   Return clear validation errors
-   Consider using validation libraries for complex rules
-   Centralize validation logic for reuse

### 8.3 Transactions

-   Handle transactions at the use case level
-   Ensure ACID properties for multi-repository operations
-   Consider using Unit of Work pattern for transaction management
-   Properly handle rollbacks in error scenarios
-   Document transactional boundaries

### 8.4 Caching

-   Implement caching at the repository level when possible
-   Use application-level caching for complex computed results
-   Consider cache invalidation strategy
-   Document cache behavior in use case implementations
-   Don't leak caching concerns to domain layer

## 9. Examples from Real Implementation

### Use Case Implementation:

```typescript
// Use case with clean organization pattern
export class GetProfileUseCase {
	constructor(
		private userRepo: UserRepository,
		private preferencesRepo: PreferencesRepository,
		private activityRepo: ActivityRepository
	) {}

	async execute(dto: GetProfileRequestDto): Promise<GetProfileResponseDto> {
		// Primary data
		const user = await this.userRepo.getById(dto.userId);
		if (!user) {
			throw new ResourceNotFoundError('User not found');
		}

		// Parallel data fetching
		const [preferences, recentActivity, stats] = await Promise.all([
			this.preferencesRepo.getByUserId(dto.userId),
			this.getRecentActivity(dto.userId, dto.activityLimit),
			this.getUserStats(dto.userId)
		]);

		// Transformation
		const userDto = UserMapper.toDto(user);
		const activityDto = ActivityMapper.toDto(recentActivity);

		// Return composed result
		return {
			user: userDto,
			preferences,
			recentActivity: activityDto,
			stats
		};
	}

	// Private helper methods
	private async getRecentActivity(userId: string, limit: number = 5) {
		return this.activityRepo.getRecentByUserId(userId, limit);
	}

	private async getUserStats(userId: string) {
		const [loginCount, contributionCount] = await Promise.all([
			this.activityRepo.getLoginCount(userId),
			this.activityRepo.getContributionCount(userId)
		]);

		return {
			loginCount,
			contributionCount,
			memberSince: this.calculateMemberDuration(userId)
		};
	}

	private calculateMemberDuration(userId: string): string {
		// Implementation details
		return '2 years';
	}
}
```

### Factory Pattern:

```typescript
// Factory creating and wiring dependencies
export class GetProfileFactory {
	static create(req: any) {
		// Create shared infrastructure
		const db = DatabaseFactory.create(req);

		// Create repositories
		const userRepo = new UserRepositoryImpl(db);
		const preferencesRepo = new PreferencesRepositoryImpl(db);
		const activityRepo = new ActivityRepositoryImpl(db);

		// Create use case with dependencies
		const useCase = new GetProfileUseCase(userRepo, preferencesRepo, activityRepo);

		// Create supporting services
		const loggerService = new LoggerService(req);

		return { useCase, loggerService };
	}
}
```

### Mapper with Complex Transformation:

```typescript
// Mapper with complex transformation
export class ProfileMapper {
	static toDto(user: User, preferences: UserPreferences): ProfileDto {
		// Basic mapping
		const profile = {
			id: user.getId(),
			name: user.getFullName(),
			email: user.getEmail(),
			avatar: user.getAvatarUrl(),
			role: user.getRole()
		};

		// Privacy handling
		if (preferences.isPrivate) {
			delete profile.email;
		}

		// Add computed properties
		return {
			...profile,
			isVerified: user.isVerified(),
			memberSince: this.formatDate(user.getCreatedAt()),
			displayName: preferences.useNickname ? preferences.nickname : profile.name
		};
	}

	private static formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}
}
```

## 10. Implementation Checklist

-   [ ] Define clear use case requirements and boundaries
-   [ ] Create appropriate directory structure
-   [ ] Define request and response DTOs
-   [ ] Implement repository interfaces in the domain layer
-   [ ] Create use case class with appropriate dependencies
-   [ ] Implement the execute method with orchestration logic
-   [ ] Create mappers for data transformation
-   [ ] Implement factory for dependency creation
-   [ ] Define constants and configuration
-   [ ] Create shared interfaces if needed
-   [ ] Write unit tests for the use case
-   [ ] Ensure error handling is consistent
-   [ ] Document public interfaces and key decisions

## 11. Conclusion

The application layer serves as the conductor of your clean architecture, orchestrating the flow of data between the domain layer and external interfaces. By following this SOP, you can create a clean, maintainable application layer that effectively implements business use cases while maintaining the separation of concerns that makes clean architecture powerful.
