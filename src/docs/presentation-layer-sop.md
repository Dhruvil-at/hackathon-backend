# Standard Operating Procedure (SOP): Clean Architecture Presentation Layer

## 1. Purpose

This document provides guidelines for implementing the presentation layer in clean architecture applications. The presentation layer serves as the entry point for external requests and adapts these requests to the application's use cases.

## 2. Scope

This SOP applies to the development of the presentation layer in web applications following clean architecture principles, regardless of the specific web framework used.

## 3. Directory Structure

```
presentation/
├── controllers/       # Request handlers that invoke use cases
├── routes/            # API endpoint definitions
├── validation/        # Request validation schemas
├── interfaces/        # Type definitions for the presentation layer
├── middlewares/       # (Optional) Custom middleware functions
└── serializers/       # (Optional) Response transformation utilities
```

## 4. Component Responsibilities

### 4.1 Controllers

Controllers are responsible for:

- Converting HTTP requests into use case inputs
- Invoking the appropriate use cases
- Handling exceptions
- Transforming use case outputs into HTTP responses

#### Implementation Rules:

1. Controllers should only depend on application layer use cases, never on infrastructure
2. Use static methods or stateless classes to handle requests
3. Extract request parameters and convert them to use case DTOs
4. Use factories to create use case instances
5. Implement consistent error handling
6. Return standardized response formats

#### Example:

```typescript
export class ExampleController {
  static async getResource(
    req: ValidatedRequest<QueryValidationRequestSchema<RequestParams>>,
    res: Response,
    next: NextFunction,
  ) {
    // 1. Extract and convert parameters to DTO
    const dto: ResourceRequestDto = {
      id: req.params.id,
      filter: req.query.filter,
    };

    // 2. Create use case instance via factory
    const { useCase, loggerService } = UseCaseFactory.create(req);

    try {
      // 3. Execute use case
      const result = await useCase.execute(dto);

      // 4. Return standardized response
      res.send({
        success: true,
        data: result,
      });
    } catch (error) {
      // 5. Log and delegate errors
      loggerService.errorLog({
        data: error,
        msg: 'Get Resource Error',
      });
      return next(error);
    }
  }
}
```

### 4.2 Routes

Routes define the API endpoints and connect them to controller methods.

#### Implementation Rules:

1. Group related endpoints in the same router
2. Apply appropriate middleware for validation
3. Use semantic HTTP methods (GET, POST, PUT, DELETE)
4. Define clear route paths following REST or RPC conventions
5. Keep route handlers minimal by delegating to controllers

#### Example:

```typescript
import { Router } from 'express';
import { ExampleController } from '../controllers/controller';
import validation from '../validation/validation';
import { createValidator } from 'express-joi-validation';

const router = Router();
const validator = createValidator({ passError: true });

router.get('/resources', validator.query(validation.getResources), ExampleController.getResources);

router.get(
  '/resources/:id',
  validator.params(validation.getResourceById),
  ExampleController.getResourceById,
);

export { router };
```

### 4.3 Validation

Validation schemas define the expected structure and constraints for request parameters.

#### Implementation Rules:

1. Define separate validation schemas for each endpoint
2. Validate path parameters, query parameters, and request bodies
3. Define clear validation rules including required fields and types
4. Use a validation library (like Joi, Zod, Yup, etc.)
5. Export schemas as a single object for ease of use

#### Example:

```typescript
import Joi from 'joi';

const schema = {
  getResources: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
    filter: Joi.string().optional(),
  }),

  getResourceById: Joi.object({
    id: Joi.number().required(),
  }),

  createResource: Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().optional(),
  }),
};

export default schema;
```

### 4.4 Interfaces

Interfaces define the types used within the presentation layer.

#### Implementation Rules:

1. Define interfaces for request parameters, responses, and validation schemas
2. Extend framework-specific types as needed
3. Keep interfaces focused on the presentation layer concerns
4. Reference domain types when appropriate rather than redefining them

#### Example:

```typescript
import { ContainerTypes, ValidatedRequestSchema } from 'express-joi-validation';

export interface QueryValidationRequestSchema<T> extends ValidatedRequestSchema {
  [ContainerTypes.Query]: T;
}

export interface ResourceRequestParams {
  id: number;
  filter?: string;
}

export interface ResourceResponseDto {
  id: number;
  name: string;
  createdAt: Date;
}
```

## 5. Layer Interaction Rules

The presentation layer forms the outermost layer of clean architecture and interacts with other layers according to strict rules to maintain proper separation of concerns:

### 5.1 Presentation to Application Layer Interaction

- Presentation layer depends on application layer, never vice versa
- Controllers only communicate with application layer through use case interfaces
- Controllers convert HTTP/UI request data into application DTOs
- Controllers receive DTOs from application layer and convert them to HTTP responses
- Use case instances are created via factory methods that handle dependency injection
- Factory methods shield controllers from knowing about infrastructure implementations

### 5.2 Presentation to Domain Layer Interaction

- Presentation layer never directly accesses domain entities or services
- All domain interactions are mediated through the application layer
- Domain entities are never directly exposed to clients
- Domain-specific rules are not enforced in the presentation layer

### 5.3 Presentation to Infrastructure Layer Interaction

- Presentation layer never directly depends on infrastructure implementations
- Infrastructure concerns (logging, metrics) are accessed through interfaces
- Database or external service access is always through the application layer
- HTTP/framework-specific code is isolated within the presentation layer

### 5.4 Exception Handling Between Layers

- Presentation layer catches application exceptions and transforms them to appropriate responses
- Domain exceptions are wrapped by application layer before reaching presentation
- Technical infrastructure exceptions are never exposed directly to clients
- A consistent error response format is used for all error types

## 6. Best Practices

### 6.1 Dependency Injection

- Use factory patterns to create use case instances
- Inject dependencies rather than creating them inside controllers
- Keep controllers stateless when possible

### 6.2 Error Handling

- Implement a consistent error handling strategy
- Log errors with appropriate context
- Delegate error handling to framework middleware
- Return standardized error responses

### 6.3 Response Format

- Adopt a consistent response format across all endpoints
- Include success indicator and data wrapper
- Consider standardizing pagination metadata, if applicable
- Example format:
  ```json
  {
    "success": true,
    "data": {},
    "meta": {
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100
      }
    }
  }
  ```

### 6.4 Framework Independence

- Isolate framework-specific code to adapters or wrappers
- Avoid passing framework objects (like request) to use cases
- Extract only the needed data from requests before passing to use cases

## 7. Testing

### 7.1 Controller Testing

- Test controllers in isolation with mocked use cases
- Verify correct parameter extraction and response formatting
- Simulate error conditions and verify error handling

### 7.2 Integration Testing

- Test routes with HTTP requests
- Verify validation rules are correctly applied
- Test entire request flow from route to controller to use case (with mocked repositories)

## 8. Cross-Cutting Concerns

### 8.1 Authentication and Authorization

- Implement as middleware at the routes level
- Provide authentication context to controllers and use cases as needed
- Keep authorization logic in use cases, not controllers

### 8.2 Validation

- Prefer validation before controller execution
- Use middleware for input validation
- Provide clear validation error messages
- Avoid redundant validation of required fields in controllers and use cases
- Use validation middleware as the single source of truth for required field validation
- Validate optional fields where they become contextually required for operations

### 8.3 Logging

- Log incoming requests and responses (potentially as middleware)
- Log errors with context at the controller level
- Consider request IDs for tracing across components

## 9. Examples from Real Implementation

### Controller with Factory Pattern:

```typescript
// Controller using a factory to create use case instance
static async getSuburbTrendsAndListings(
  req: ValidatedRequest<
    QueryValidationRequestSchema<GetSuburbTrendsAndListingsRequestParams>
  >,
  res: Response,
  next: NextFunction
) {
  const dto: GetSuburbTrendsAndListingsRequestDto = {
    priceTo: req.query.priceTo,
    suburbId: req.query.suburbId,
    propertyType: req.query.propertyType,
    bedrooms: req.query.bedrooms,
    bathrooms: req.query.bathrooms
  };

  const { useCase, loggerService } = GetSuburbTrendsAndListingsFactory.create(req);
  try {
    const result = await useCase.execute(dto);

    res.send({
      success: true,
      data: result
    });
  } catch (error) {
    loggerService.errorLog({
      data: error,
      msg: 'Get Suburb Trends and Listings Error'
    });
    return next(error);
  }
}
```

### Routes with Validation:

```typescript
// Routes with validation middleware
router.get(
  '/suburb-trends-and-listings',
  validator.query(validation.getSuburbTrendsAndListings),
  Controller.getSuburbTrendsAndListings,
);
```

### Validation Schema:

```typescript
// Validation schema using Joi
const schema = {
  getSuburbTrendsAndListings: Joi.object({
    priceTo: Joi.number().required(),
    suburbId: Joi.number().required(),
    propertyType: Joi.string().valid('house', 'unit').required(),
    bedrooms: Joi.number(),
    bathrooms: Joi.number(),
  }),
};
```

## 10. Implementation Checklist

- [ ] Create directory structure (controllers, routes, validation, interfaces)
- [ ] Define interfaces for requests and responses
- [ ] Implement validation schemas
- [ ] Create controller methods for each use case
- [ ] Implement routes connecting to controllers
- [ ] Add appropriate middleware (validation, authentication, etc.)
- [ ] Test endpoints with real or mock use cases
- [ ] Ensure error handling is consistent
- [ ] Document API endpoints (e.g., using OpenAPI/Swagger)

## 11. Conclusion

The presentation layer serves as the adapter between external requests and the application's core use cases. By following this SOP, you can create a clean, maintainable presentation layer that adheres to clean architecture principles while providing a robust API for your application.
