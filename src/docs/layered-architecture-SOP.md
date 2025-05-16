# Clean Architecture SOP (Standard Operating Procedure)

## Overview

This document outlines the standard procedure for creating new modules using the Clean Architecture approach. The architecture separates concerns into distinct layers, making the code more maintainable, testable, and scalable.

## Core Principles

1. **Independence of Frameworks**: The architecture does not depend on the existence of libraries or frameworks. This allows you to use frameworks as tools, rather than having to adapt your system to their constraints.

2. **Testability**: The business rules can be tested without the UI, database, web server, or any external element.

3. **Independence of UI**: The UI can be changed easily, without changing the rest of the system.

4. **Independence of Database**: Your business rules are not bound to the database, which means you can swap out Oracle or SQL Server for MongoDB, BigTable, or something else.

5. **Independence of External Agencies**: Your business rules don't know anything about the outside world.

## Folder Structure

```
src/clean-architecture/
├── modules/                  # Feature modules (domain-specific)
│   ├── index.ts              # Centralized module export point
│   └── [module-name]/        # e.g., user-management
│       ├── application/      # Application business rules
│       │   └── useCases/     # Individual use cases
│       │       └── [use-case-name]/ # Specific use case
│       │           ├── [use-case-name].ts         # Main use case class
│       │           ├── [use-case-name]Factory.ts  # Factory for the use case
│       │           ├── [use-case-name]RequestDto.ts  # Input DTO
│       │           ├── [use-case-name]ResponseDto.ts # Output DTO
│       │           └── [specific-mappers].ts      # Use case specific mappers
│       ├── domain/           # Enterprise business rules
│       │   ├── entities/     # Domain model objects
│       │   ├── interfaces/   # Domain interfaces & enums
│       │   └── services/     # Domain services implementations
│       ├── infrastructure/   # External dependencies implementation
│       │   └── repositories/ # Data source implementations
│       ├── interfaces/       # Common interfaces and DTOs
│       ├── mappers/          # Object mappers between layers
│       ├── presentation/     # UI layer
│       │   ├── controllers/  # Request handlers
│       │   ├── interfaces/   # Presentation-specific interfaces
│       │   ├── routes/       # API routes
│       │   ├── middleware/   # Express middleware
│       │   └── validation/   # Input validation schemas
│       └── repositories/     # Repository interfaces
└── shared/                   # Shared utilities and services
    ├── factories/            # Cross-cutting factories
    ├── services/             # Shared services
    └── utils/                # Utility functions
```

## Layer Descriptions

### 1. Domain Layer

The innermost layer containing enterprise-wide business rules and entities. This layer has no dependencies on other layers.

- **Entities**: Core business objects with intrinsic business rules
- **Interfaces**: Contracts that domain services will implement, enums for value objects
- **Services**: Domain-specific business logic implementations

### 2. Application Layer

Contains application-specific business rules. It orchestrates the flow of data and implements use cases that define the operations available to the presentation layer.

- **Use Cases**: One class per use case, implementing specific business logic
- **DTOs**: Data Transfer Objects for input/output
- **Factories**: Classes that create and configure use cases with their dependencies
- **Use Case Mappers**: Specialized mappers for specific use case transformations

### 3. Repository Layer

Defines interfaces for data access. These interfaces are implemented by the infrastructure layer.

- **Repository Interfaces**: Contracts that repository implementations must fulfill
- **Query Specifications**: Objects that define query criteria

### 4. Infrastructure Layer

Contains adapters that convert data from external agencies (like databases, APIs) to the format expected by the inner layers.

- **Repository Implementations**: Classes that implement the repository interfaces
- **External Service Adapters**: Wrappers around external APIs
- **Database Access**: Concrete implementations of data access logic
- **Query Builders**: Classes that build complex queries for data retrieval

### 5. Presentation Layer

Handles HTTP requests, input validation, and response formatting.

- **Controllers**: Handlers for API endpoints
- **Routes**: HTTP route definitions
- **Validation**: Input validation logic
- **View Models/DTOs**: Specialized data structures for the UI
- **Interfaces**: Type definitions for request parameters

## Implementation Process

### 1. Define Domain Layer

- Start by defining the core domain entities and interfaces in the `domain` folder
- Create entity classes using a property bag pattern with private properties and public getters
- Define value objects for immutable data structures
- Create enums for representing domain concepts with a fixed set of values
- Implement domain service interfaces in the `domain/services` folder
- Use static factory methods to create and validate domain entities
- Separate properties interfaces from entity classes for better type checking
- Keep domain entities focused on their core business logic
- Ensure entities expose only the methods needed for their behavior

### 2. Create Repository Interfaces

- Create interfaces for data access in the `repositories` folder
- These interfaces should be independent of any specific database implementation
- Define methods that reflect domain language, not data access specifics
- Create a base repository interface for common operations

### 3. Create Service Interfaces

- Define service interfaces in the `services` folder
- Services should represent domain operations that don't fit in entities
- Keep service interfaces focused on a single responsibility
- Define clear contracts with well-typed parameters and return values

### 4. Create Application Layer

- Implement use cases in the `application/useCases` folder
- Organize each use case in its own folder with all related components
- Each use case should represent one atomic operation the system can perform
- Create separate files for each component of the use case:
  - Main use case class
  - Factory class
  - Request/response DTOs
  - Use case specific mappers
- Keep use cases focused on orchestrating domain entities and services
- Use Promise.all for parallel operations to optimize performance
- Implement proper error handling and validation
- Create clear, well-defined input and output DTOs

### 5. Implement Infrastructure Layer

- Implement repository interfaces in the `infrastructure/repositories` folder
- Create a base repository for common data access patterns
- Implement data mappers to convert between domain and persistence models
- Create query builders for complex data access
- Implement adapter classes for external services
- Use the adapter pattern to insulate the domain from external dependencies

### 6. Implement Domain Services

- Implement service interfaces defined in the `services` folder
- Place implementations in the `domain/services` folder
- Keep service implementations focused on domain logic
- Use dependency injection for external dependencies
- Ensure services work with domain entities, not DTOs

### 7. Create Mappers

- Implement mappers to transform data between layers
- Create use case specific mappers for specialized transformations
- Use consistent naming conventions (toDomain, toDto, toPersistence)
- Keep mappers focused on a single transformation responsibility
- Create separate mapper classes for complex transformations
- Implement mappers with static methods for easier usage

### 8. Create Presentation Layer

- Define routes in `presentation/routes`
- Implement controllers with static methods in `presentation/controllers`
- Add validation schemas in `presentation/validation`
- Create middleware for error handling in `presentation/middleware`
- Use the express-joi-validation library for request validation
- Implement error handlers for validation and other errors

### 9. Configure Module Exports

- Update the main `modules/index.ts` file to import and export all module routes
- Mount routes with appropriate base paths
- Configure middleware for error handling

## Code Examples

### Domain Entity Example

```typescript
// Properties interface
export interface UserProps {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Domain entity
export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  static create(props: UserProps): User {
    // Domain validation
    if (!isValidEmail(props.email)) {
      throw new Error('Invalid email format');
    }

    if (props.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    return new User(props);
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  isActive(): boolean {
    return this.props.isActive;
  }

  getRole(): UserRole {
    return this.props.role;
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  changeRole(newRole: UserRole): void {
    if (this.props.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      throw new Error('Admin role cannot be changed');
    }

    this.props.role = newRole;
    this.props.updatedAt = new Date();
  }

  // Domain behavior
  canAccessResource(resource: Resource): boolean {
    return this.props.isActive && hasPermission(this.props.role, resource);
  }
}
```

### Domain Enum Example

```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  USER = 'user',
}

export enum ResourceType {
  DASHBOARD = 'dashboard',
  REPORTS = 'reports',
  USERS = 'users',
  SETTINGS = 'settings',
}
```

### Repository Interface Example

```typescript
export interface BaseRepository {
  executeQuery(query: QueryBuilder, index: string, queryIdentifier: string): Promise<any>;
}

export interface UserRepository extends BaseRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: UserRole): Promise<User[]>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Service Interface Example

```typescript
export interface EmailService {
  sendWelcomeEmail(recipient: string, name: string): Promise<void>;
  sendPasswordResetEmail(recipient: string, resetToken: string): Promise<void>;
}
```

### Service Implementation Example

```typescript
export class EmailServiceImpl implements EmailService {
  constructor(private emailProvider: EmailProvider) {}

  async sendWelcomeEmail(recipient: string, name: string): Promise<void> {
    const template = this.loadTemplate('welcome');
    const content = this.populateTemplate(template, { name });

    await this.emailProvider.send({
      to: recipient,
      subject: 'Welcome to our platform',
      content,
    });
  }

  async sendPasswordResetEmail(recipient: string, resetToken: string): Promise<void> {
    const template = this.loadTemplate('password-reset');
    const content = this.populateTemplate(template, { resetToken });

    await this.emailProvider.send({
      to: recipient,
      subject: 'Reset your password',
      content,
    });
  }

  private loadTemplate(name: string): string {
    // Implementation details
    return '';
  }

  private populateTemplate(template: string, data: any): string {
    // Implementation details
    return '';
  }
}
```

### Use Case Example

```typescript
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository, private emailService: EmailService) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user entity
    const user = User.create({
      id: generateId(),
      email: dto.email,
      name: dto.name,
      role: UserRole.USER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save user
    await this.userRepository.save(user);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(dto.email, dto.name);

    // Return response
    return {
      id: user.getId(),
      name: user.getName(),
      email: dto.email,
      role: user.getRole(),
    };
  }
}
```

### Request DTO Example

```typescript
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}
```

### Response DTO Example

```typescript
export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
```

### Factory Example

```typescript
export class CreateUserFactory {
  static create() {
    const logger = new LoggerService();
    const userRepository = new UserRepositoryImpl();
    const emailService = new EmailServiceImpl(new EmailProviderImpl());
    const useCase = new CreateUserUseCase(userRepository, emailService);
    return { useCase, logger };
  }
}
```

### Query Builder Example

```typescript
export class UserQueryBuilder extends BaseQueryBuilder {
  withEmail(email: string): UserQueryBuilder {
    this.mustClauses.push({
      term: { email: email },
    });
    return this;
  }

  withActiveStatus(isActive: boolean): UserQueryBuilder {
    this.mustClauses.push({
      term: { isActive: isActive },
    });
    return this;
  }

  withNameContaining(name: string): UserQueryBuilder {
    this.mustClauses.push({
      match: { name: name },
    });
    return this;
  }
}
```

### Controller Example

```typescript
static async createUser(req: Request, res: Response, next: NextFunction) {
	try {
		const { useCase, logger } = CreateUserFactory.create();
		const dto = {
			name: req.body.name,
			email: req.body.email,
			password: req.body.password
		};

		const result = await useCase.execute(dto);

		res.status(201).json({
			success: true,
			data: result
		});
	} catch (error) {
		logger.error('Error creating user', error);
		next(error);
	}
}
```

### Validation Example

```typescript
const userValidation = {
  createUser: Joi.object({
    name: Joi.string().required().min(2).max(100),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
  }),
};

export default userValidation;
```

### Route Example

```typescript
import { Router } from 'express';
import { createValidator } from 'express-joi-validation';
import userValidation from '../validation/user.validation';
import { UserController } from '../controllers/user.controller';

const router = Router();
const validator = createValidator({ passError: true });

router.post(
  '/users',
  validator.body(userValidation.createUser),
  UserController.createUser.bind(UserController),
);

export { router };
```

### Modules Index Example

```typescript
import { Router } from 'express';
import { router as userRouter } from './user/presentation/routes/user.routes';
import { router as productRouter } from './product/presentation/routes/product.routes';
import { errorHandler } from './shared/middleware/error-handler.middleware';

const router = Router({ mergeParams: true });

// Mount module routes
router.use('/users', userRouter);
router.use('/products', productRouter);

// Add error handler middleware
router.use(errorHandler);

export default router;
```

### Mapper Example

```typescript
export class UserMapper {
  static toDomain(raw: any): User {
    return User.create({
      id: raw.id,
      email: raw.email,
      name: raw.name,
      isActive: raw.is_active,
      role: raw.role,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    });
  }

  static toPersistence(user: User): any {
    return {
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
      is_active: user.isActive(),
      role: user.getRole(),
      created_at: user.getCreatedAt().toISOString(),
      updated_at: user.getUpdatedAt().toISOString(),
    };
  }

  static toDTO(user: User): UserDto {
    return {
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
      role: user.getRole(),
    };
  }
}
```

### Use Case Specific Mapper Example

```typescript
export class UserDetailsMapper {
  static toDto(users: User[], roles: Role[]): UserDetailsDto[] {
    return users.map((user) => {
      const userRoles = roles.filter((role) => role.getUserId() === user.getId());

      return {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        roles: userRoles.map((role) => role.getName()),
      };
    });
  }
}
```

## Best Practices

1. **Dependency Injection**: Use constructor injection for dependencies

   - Makes testing easier
   - Makes dependencies explicit
   - Avoids hidden coupling

2. **Factory Pattern**: Use factories to create use cases with their dependencies

   - Centralizes creation logic
   - Simplifies client code
   - Makes dependency network explicit

3. **Single Responsibility**: Each class should have a single responsibility

   - Enhances maintainability
   - Reduces complexity
   - Makes testing easier

4. **Dependency Rule**: Dependencies should only point inward (domain → application → infrastructure/presentation)

   - Makes the system more flexible
   - Protects business rules from external changes
   - Facilitates testing

5. **DTOs**: Use Data Transfer Objects to pass data between layers

   - Decouples layers
   - Controls what data is exposed
   - Adapts data to client needs

6. **Validation**: Validate input at the presentation layer

   - Ensures data integrity
   - Fails fast
   - Reduces domain layer complexity

7. **Error Handling**: Use try/catch blocks in controllers and log errors appropriately

   - Improves user experience
   - Facilitates debugging
   - Maintains system stability

8. **Immutability**: Prefer immutable objects, especially in the domain layer

   - Reduces bugs from unexpected state changes
   - Simplifies concurrency
   - Makes code reasoning easier

9. **Base Classes**: Use base classes for common functionality

   - Reduces duplication
   - Standardizes patterns
   - Simplifies implementation

10. **Mappers**: Use dedicated mapper classes for transformations between layers

    - Centralizes transformation logic
    - Keeps layers decoupled
    - Makes changes easier to manage

11. **Query Builders**: Use builder pattern for complex query construction

    - Enhances readability
    - Provides type safety
    - Enables composition of query fragments

12. **Static Factory Methods**: Use static factory methods to create domain entities

    - Centralizes validation logic
    - Provides meaningful names for different creation scenarios
    - Enables caching or object pooling

13. **Interface Segregation**: Create specific interfaces rather than general-purpose ones

    - Reduces coupling
    - Makes interfaces more cohesive
    - Simplifies testing and implementation

14. **Organize Use Cases in Dedicated Folders**: Keep all related files for a use case together

    - Improves discoverability
    - Maintains cohesion
    - Simplifies navigation through the codebase

15. **Use Case Specific Mappers**: Create dedicated mappers for complex use case transformations

    - Keeps mapping logic close to where it's used
    - Simplifies complex transformations
    - Avoids polluting general mappers with specific transformation logic

16. **Parallel Processing**: Use Promise.all for concurrent operations

    - Improves performance
    - Reduces response time
    - Better utilizes resources

17. **Property Bag Pattern**: Use a private props object in domain entities

    - Makes refactoring easier
    - Centralizes property management
    - Facilitates implementation of immutable entities

18. **Domain Enums**: Use enums to represent domain concepts with a fixed set of values

    - Improves type safety
    - Makes code more expressive
    - Prevents invalid values

19. **Domain Validation**: Implement validation rules within entity constructors or factory methods

    - Ensures entities are always in a valid state
    - Centralizes validation logic
    - Makes validation rules explicit

## Unit Testing Guidelines

1. **Focus on Domain and Application Layers**: These layers contain the business logic and should be thoroughly tested
2. **Mock Dependencies**: Use interfaces to create mock implementations for testing
3. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
4. **Use Factory Methods**: Create factory methods for test objects to reduce test setup code
5. **Test Edge Cases**: Ensure that error handling and boundary conditions are tested
6. **Isolated Tests**: Each test should be independent of others
7. **Test Doubles**: Use stubs, mocks, and fakes appropriately for different scenarios
8. **Arrange-Act-Assert**: Structure tests with a clear setup, action, and verification
9. **Test Each Use Case Independently**: Create dedicated test suites for each use case
10. **Test Mappers Thoroughly**: Ensure all transformation logic is correctly tested
11. **Test Domain Entity Validation**: Test that entity validation rules work correctly
12. **Test Domain Entity Behavior**: Test that entity methods perform the expected actions

## Extending The Architecture

When adding a new feature:

1. Identify the module it belongs to or create a new one
2. Define domain entities, interfaces, and enums first
3. Create repository interfaces
4. Define service interfaces
5. Implement use cases for the new functionality
6. Implement domain services
7. Create mappers for data transformations
8. Implement repositories and infrastructure components
9. Add presentation layer components (controllers, routes, validation)

## Common Pitfalls to Avoid

1. **Anemic Domain Model**: Don't create entities that are just data holders without behavior
2. **Leaky Abstractions**: Don't let implementation details leak into higher layers
3. **Direct Database Access**: Don't access persistence mechanisms directly from the domain or application layers
4. **Business Logic in Controllers**: Keep controllers thin and move business logic to use cases
5. **Skipping Validation**: Always validate input at the presentation layer
6. **Tight Coupling**: Avoid direct dependencies between components; use dependency injection
7. **Inconsistent Naming**: Follow consistent naming conventions for clarity
8. **Premature Optimization**: Focus on clear boundaries and responsibilities before optimizing
9. **Large Use Cases**: Keep use cases focused on a single responsibility
10. **Ignoring Domain Experts**: Collaborate with domain experts to model the domain correctly
11. **Mixing Concerns Across Layers**: Keep each layer's responsibilities separate
12. **Complex Use Case Classes**: Break down complex use cases into smaller, more manageable ones
13. **Business Logic in Mappers**: Keep mappers focused only on data transformation
14. **Exposing Internal State**: Don't expose entity properties directly; use getters and methods
