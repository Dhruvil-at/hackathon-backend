# Standard Operating Procedure (SOP): Clean Architecture Infrastructure Layer

## 1. Purpose

This document provides guidelines for implementing the infrastructure layer in clean architecture applications. The infrastructure layer implements the interfaces defined by the domain layer and contains all external-facing components such as databases, API clients, file systems, and other external services.

## 2. Scope

This SOP applies to the development of the infrastructure layer in applications following clean architecture principles, regardless of the specific technologies used.

## 3. Directory Structure

```
infrastructure/
├── repositories/         # Repository implementations
│   ├── baseRepoImpl.ts   # Base repository implementation
│   ├── entityRepoImpl.ts # Entity-specific repository
│   └── queryBuilders/    # Query construction utilities
├── services/             # External service adapters
├── persistence/          # Database and ORM related code
├── api/                  # External API clients
├── dataAccess/           # Database access implementations
│   ├── sql/              # SQL-specific implementations
│   └── nosql/            # NoSQL-specific implementations
└── config/               # Infrastructure configuration
```

## 4. Component Responsibilities

### 4.1 Repository Implementations

Repository implementations provide concrete implementations of the repository interfaces defined in the domain layer, handling data access and persistence details.

#### Implementation Rules:

1. Implement repository interfaces defined in the domain layer
2. Use dependency injection for external dependencies
3. Map infrastructure-specific data models to domain entities
4. Encapsulate query construction in separate builder classes
5. Handle infrastructure-specific errors and translate to domain errors
6. Implement caching strategies where appropriate
7. Follow consistent naming patterns (e.g., `EntityRepoImpl`)
8. Support different data sources (SQL, NoSQL, APIs) with the same interface

#### Example:

```typescript
export class UserRepositoryImpl implements UserRepository {
	constructor(private dataSource: DataSource, private cacheManager: CacheManager) {}

	async findById(id: string): Promise<User | null> {
		// Check cache first
		const cacheKey = `user:${id}`;
		const cachedUser = await this.cacheManager.get<UserDto>(cacheKey);

		if (cachedUser) {
			return UserMapper.toDomain(cachedUser);
		}

		// Query database
		try {
			const userDto = await this.dataSource.users.findUnique({
				where: { id }
			});

			if (!userDto) {
				return null;
			}

			// Cache result
			await this.cacheManager.set(cacheKey, userDto, 3600);

			// Map to domain entity
			return UserMapper.toDomain(userDto);
		} catch (error) {
			throw new RepositoryError('Failed to fetch user', { cause: error });
		}
	}

	// Additional repository methods...
}
```

### 4.2 Query Builders

Query builders encapsulate the construction of complex queries for data access, providing a fluent interface for building queries in a type-safe manner.

#### Implementation Rules:

1. Use the builder pattern for constructing complex queries
2. Provide type safety through method chaining
3. Separate query construction from query execution
4. Make query builders reusable and composable
5. Implement specific builder classes for different entity types
6. Support both simple and complex query scenarios
7. Implement conditional clauses that only apply if conditions are met
8. Support query aggregations and analytics

#### Example:

```typescript
export class UserQueryBuilder {
	private conditions: any[] = [];
	private sortOptions: any[] = [];
	private limitValue: number | undefined;
	private offsetValue: number | undefined;
	private aggregations: Record<string, any> = {};

	withEmail(email: string): UserQueryBuilder {
		this.conditions.push({ email: { equals: email } });
		return this;
	}

	withRole(role: UserRole): UserQueryBuilder {
		this.conditions.push({ role: { equals: role } });
		return this;
	}

	withActiveStatus(isActive: boolean): UserQueryBuilder {
		this.conditions.push({ isActive: { equals: isActive } });
		return this;
	}

	// Conditional clause that only applies if the value is provided
	withOptionalSearchTerm(term?: string): UserQueryBuilder {
		if (term) {
			this.conditions.push({
				OR: [{ name: { contains: term } }, { email: { contains: term } }]
			});
		}
		return this;
	}

	// Aggregation support
	withCountByRole(): UserQueryBuilder {
		this.aggregations.roleCount = {
			groupBy: ['role'],
			count: true
		};
		return this;
	}

	sortByCreatedAt(direction: 'asc' | 'desc'): UserQueryBuilder {
		this.sortOptions.push({ createdAt: direction });
		return this;
	}

	limit(limit: number): UserQueryBuilder {
		this.limitValue = limit;
		return this;
	}

	offset(offset: number): UserQueryBuilder {
		this.offsetValue = offset;
		return this;
	}

	build(): QueryDefinition {
		return {
			where: { AND: this.conditions },
			orderBy: this.sortOptions,
			take: this.limitValue,
			skip: this.offsetValue,
			aggregations: this.aggregations
		};
	}
}
```

### 4.3 Base Repository

Base repositories provide common functionality for all repository implementations, reducing code duplication and ensuring consistent handling of infrastructure concerns.

#### Implementation Rules:

1. Implement common data access methods
2. Provide error handling and logging
3. Handle connection management
4. Implement pagination utilities
5. Support transactions
6. Abstract away infrastructure-specific details
7. Implement query execution metrics
8. Support different query formats for various data sources

#### Example:

```typescript
export abstract class BaseRepository<T> {
	constructor(protected dataSource: DataSource, protected logger: Logger) {}

	protected async executeQuery<R>(queryName: string, queryFn: () => Promise<R>): Promise<R> {
		try {
			this.logger.debug(`Executing query: ${queryName}`);
			const startTime = performance.now();
			const result = await queryFn();
			const duration = performance.now() - startTime;

			this.logger.debug(`Query ${queryName} completed in ${duration}ms`);

			// Record metrics
			this.recordQueryMetrics(queryName, duration);

			return result;
		} catch (error) {
			this.logger.error(`Query ${queryName} failed: ${error.message}`);
			throw new RepositoryError(`Failed to execute query: ${queryName}`, { cause: error });
		}
	}

	protected async executeRawSql<R>(
		queryName: string,
		sql: string,
		params: any[] = []
	): Promise<R> {
		return this.executeQuery(queryName, () => this.dataSource.rawQuery(sql, params));
	}

	protected calculateOffset(page: number, limit: number): number {
		return (Math.max(1, page) - 1) * limit;
	}

	protected async withTransaction<R>(fn: (tx: Transaction) => Promise<R>): Promise<R> {
		const tx = await this.dataSource.startTransaction();
		try {
			const result = await fn(tx);
			await tx.commit();
			return result;
		} catch (error) {
			await tx.rollback();
			throw error;
		}
	}

	private recordQueryMetrics(queryName: string, durationMs: number): void {
		// Implementation of metrics recording
	}
}
```

### 4.4 SQL-specific Repository Implementations

SQL-specific repository implementations handle the details of working with SQL databases, providing optimized implementations for SQL-specific features.

#### Implementation Rules:

1. Extend the base repository with SQL-specific methods
2. Use parameterized queries to prevent SQL injection
3. Handle SQL-specific error codes
4. Implement database-specific query optimizations
5. Support different SQL dialects as needed
6. Map SQL result sets to domain entities

#### Example:

```typescript
export class SqlUserRepository extends BaseRepository<User> implements UserRepository {
	constructor(protected sqlClient: SqlClient, protected logger: Logger) {
		super(sqlClient, logger);
	}

	async findById(id: string): Promise<User | null> {
		const query = `
			SELECT id, email, name, role, is_active as isActive, created_at as createdAt
			FROM users
			WHERE id = ? AND deleted_at IS NULL
		`;

		try {
			const result = await this.executeRawSql<UserRow[]>('user-find-by-id', query, [id]);

			if (!result || result.length === 0) {
				return null;
			}

			return UserMapper.toDomain(result[0]);
		} catch (error) {
			// Handle specific SQL error codes
			if (this.isForeignKeyError(error)) {
				throw new ReferenceError('Referenced entity does not exist');
			}
			throw error;
		}
	}

	private isForeignKeyError(error: any): boolean {
		// Database-specific error code checking
		return error.code === 'ER_NO_REFERENCED_ROW';
	}
}
```

### 4.5 NoSQL-specific Repository Implementations

NoSQL-specific repository implementations handle the details of working with NoSQL databases, providing optimized implementations for NoSQL-specific features.

#### Implementation Rules:

1. Extend the base repository with NoSQL-specific methods
2. Handle document structure efficiently
3. Implement NoSQL-specific query patterns
4. Support indexing strategies appropriate for NoSQL
5. Handle eventual consistency concerns
6. Map NoSQL documents to domain entities

#### Example:

```typescript
export class MongoUserRepository extends BaseRepository<User> implements UserRepository {
	constructor(protected mongoClient: MongoClient, protected logger: Logger) {
		super(mongoClient, logger);
	}

	async findById(id: string): Promise<User | null> {
		try {
			const collection = this.mongoClient.collection('users');

			const document = await collection.findOne({
				_id: new ObjectId(id),
				deletedAt: { $exists: false }
			});

			if (!document) {
				return null;
			}

			return UserMapper.toDomain(document);
		} catch (error) {
			if (error instanceof MongoError) {
				// Handle MongoDB-specific errors
				throw new RepositoryError(`MongoDB error: ${error.message}`, { cause: error });
			}
			throw error;
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		// Implement using MongoDB-specific features
		const collection = this.mongoClient.collection('users');

		// Use MongoDB-specific text search if indexed
		const document = await collection.findOne({
			email: email,
			deletedAt: { $exists: false }
		});

		if (!document) {
			return null;
		}

		return UserMapper.toDomain(document);
	}
}
```

### 4.6 External Service Adapters

External service adapters encapsulate interactions with external services, providing a clean interface for the application to use these services.

#### Implementation Rules:

1. Implement interfaces defined in the domain layer
2. Encapsulate external API details
3. Handle authentication and authorization
4. Implement retry logic and circuit breaking
5. Map external data models to domain entities
6. Handle API errors and timeouts appropriately
7. Implement resilience patterns (retry, circuit breaker, fallback)
8. Support request batching and rate limiting

#### Example:

```typescript
export class PaymentServiceImpl implements PaymentService {
	constructor(
		private httpClient: HttpClient,
		private config: PaymentServiceConfig,
		private tokenProvider: TokenProvider,
		private circuitBreaker: CircuitBreaker
	) {}

	async processPayment(payment: Payment): Promise<PaymentResult> {
		const token = await this.tokenProvider.getToken();

		return this.circuitBreaker.execute(
			async () => {
				try {
					const response = await this.httpClient.post(
						`${this.config.baseUrl}/payments`,
						{
							amount: payment.getAmount(),
							currency: payment.getCurrency(),
							method: payment.getMethod(),
							customerId: payment.getCustomerId(),
							description: payment.getDescription()
						},
						{
							headers: {
								Authorization: `Bearer ${token}`,
								'Content-Type': 'application/json'
							},
							timeout: this.config.timeout
						}
					);

					return PaymentResultMapper.toDomain(response.data);
				} catch (error) {
					if (this.isNetworkError(error)) {
						throw new PaymentServiceUnavailableError(
							'Payment service is currently unavailable'
						);
					}

					if (this.isAuthError(error)) {
						throw new PaymentServiceAuthError(
							'Authentication failed with payment service'
						);
					}

					if (this.isRateLimitError(error)) {
						// Implement rate limiting handling
						await this.delayForRateLimit(error);
						return this.processPayment(payment);
					}

					throw new PaymentProcessingError('Failed to process payment', { cause: error });
				}
			},
			{
				fallback: () => this.processPaymentFallback(payment)
			}
		);
	}

	private async processPaymentFallback(payment: Payment): Promise<PaymentResult> {
		// Implement fallback strategy
		return {
			status: 'pending',
			id: `fallback-${Date.now()}`,
			message: 'Payment processing delayed due to service unavailability'
		};
	}

	private isNetworkError(error: any): boolean {
		return error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED';
	}

	private isAuthError(error: any): boolean {
		return error.response?.status === 401 || error.response?.status === 403;
	}

	private isRateLimitError(error: any): boolean {
		return error.response?.status === 429;
	}

	private async delayForRateLimit(error: any): Promise<void> {
		const retryAfter = error.response?.headers?.['retry-after'] || 1;
		await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
	}
}
```

### 4.7 Index Resolvers

Index resolvers provide a way to abstract the mapping between logical entity types and physical storage locations, particularly useful for search engines or sharded databases.

#### Implementation Rules:

1. Define clear interfaces for index resolution
2. Support dynamic index selection based on context
3. Handle time-based or status-based index routing
4. Centralize index naming conventions
5. Support environment-specific index prefixes
6. Handle fallback strategies for missing indices

#### Example:

```typescript
export class IndexResolverImpl implements IndexResolver {
	constructor(private config: IndexConfig, private logger: Logger) {}

	getEntityIndex(entityType: EntityType, status?: EntityStatus): string {
		// Base index name
		let indexName = `${this.config.indexPrefix}${entityType}`;

		// Add status-specific suffix if applicable
		if (status) {
			indexName += `-${status.toLowerCase()}`;
		}

		// Add environment suffix
		indexName += `-${this.config.environment}`;

		this.logger.debug(`Resolved index name: ${indexName} for entity: ${entityType}`);

		return indexName;
	}

	getTimeBasedIndex(entityType: EntityType, date: Date): string {
		// Create time-based index (e.g., logs-2023-06)
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');

		const indexName = `${this.config.indexPrefix}${entityType}-${year}-${month}`;

		return indexName;
	}

	getReadIndices(entityType: EntityType, timeRange?: { start: Date; end: Date }): string[] {
		// For time-based indices, we might need to read from multiple indices
		if (!timeRange) {
			return [this.getEntityIndex(entityType)];
		}

		const indices = [];
		let currentDate = new Date(timeRange.start);

		while (currentDate <= timeRange.end) {
			indices.push(this.getTimeBasedIndex(entityType, currentDate));

			// Move to next month
			currentDate.setMonth(currentDate.getMonth() + 1);
		}

		return indices;
	}
}
```

## 5. Layer Interaction Rules

The infrastructure layer is the outermost layer of the clean architecture, implementing interfaces defined by the domain layer and handling all technical details. The following rules govern how it interacts with other layers:

### 5.1 Infrastructure to Domain Layer Interaction

-   Infrastructure implements interfaces defined in the domain layer
-   Domain entities are created through mappers from infrastructure data
-   Domain interfaces are the contract that binds infrastructure implementations
-   Infrastructure code must never modify domain entity behavior
-   Domain layer dictates the contract, infrastructure fulfills it
-   Technical details are abstracted away from domain concerns

### 5.2 Infrastructure to Application Layer Interaction

-   Application layer uses infrastructure through domain interfaces
-   Infrastructure components are injected into use cases via factories
-   Application layer orchestrates infrastructure components but remains unaware of their implementations
-   Technical exceptions are converted to domain-specific exceptions before reaching application layer
-   Infrastructure provides cross-cutting concerns (logging, caching, etc.) to application layer

### 5.3 Infrastructure to Presentation Layer Interaction

-   No direct interaction should exist between infrastructure and presentation
-   All communication is mediated through the application layer
-   Presentation layer should never directly instantiate infrastructure components
-   Infrastructure exceptions should never directly reach the presentation layer

### 5.4 Inter-Infrastructure Component Interaction

-   Infrastructure components can directly use other infrastructure components
-   Common infrastructure concerns are abstracted into base classes
-   Shared infrastructure behavior is encapsulated in utility classes
-   Different infrastructure implementations can be combined when needed (e.g., caching + database)
-   Each infrastructure component should have a single responsibility

## 6. Best Practices

### 6.1 Error Handling

-   Catch infrastructure-specific errors and translate to domain errors
-   Provide detailed error context for debugging
-   Implement consistent error handling patterns
-   Log errors with appropriate context
-   Don't expose infrastructure details in error messages to callers
-   Implement typed error hierarchies for different error categories
-   Include original error as cause in thrown errors
-   Use custom error classes that extend base Error

### 6.2 Performance Optimization

-   Implement appropriate caching strategies
-   Use connection pooling for database connections
-   Optimize queries for specific database engines
-   Implement paging for large result sets
-   Monitor and log performance metrics
-   Use query optimization techniques specific to data store
-   Implement batching for multiple operations
-   Consider read/write splitting for high-load systems

### 6.3 Security

-   Sanitize inputs to prevent injection attacks
-   Use parameterized queries
-   Implement proper authentication and authorization
-   Secure sensitive configuration values
-   Follow principle of least privilege for external service accounts
-   Implement rate limiting for external APIs
-   Use secure connection protocols (HTTPS, TLS)
-   Audit sensitive operations

### 6.4 Testability

-   Design components for testability
-   Use dependency injection for external dependencies
-   Implement test doubles (mocks, stubs) for external services
-   Use in-memory databases for repository tests
-   Isolate external dependencies for unit testing
-   Create repository test base classes to share test logic
-   Use data builders for test data creation
-   Support transaction rollback in tests

### 6.5 Observability

-   Implement structured logging
-   Add appropriate metrics for monitoring
-   Include tracing for distributed systems
-   Log important infrastructure operations
-   Include context in logs (correlation IDs, request IDs)
-   Implement custom health checks for each dependency
-   Expose infrastructure metrics for monitoring systems
-   Create dashboards for key performance indicators

## 7. Testing

### 7.1 Unit Testing

-   Test repository implementations in isolation
-   Mock external dependencies (database, APIs)
-   Verify correct mapping between domain and infrastructure models
-   Test error handling and edge cases
-   Use in-memory implementations for databases when possible
-   Test query builders independently of repositories
-   Verify error translation logic
-   Test pagination and sorting behavior

### 7.2 Integration Testing

-   Test repositories against actual databases
-   Verify query performance and correctness
-   Test transaction handling and concurrency
-   Use test containers for database dependencies
-   Clean up test data after tests
-   Test database migrations
-   Verify connection pooling behavior
-   Test repository implementations against different data states

### 7.3 Contract Testing

-   Verify that implementations satisfy repository interfaces
-   Test against provided specifications
-   Ensure compatibility with consumer expectations
-   Document breaking changes
-   Test versioning strategy if applicable
-   Create contract test suites for each repository interface
-   Verify behavior across different implementations
-   Test edge cases defined in contracts

## 8. Cross-Cutting Concerns

### 8.1 Logging

-   Log repository operations with appropriate context
-   Include performance metrics in logs
-   Log external service calls and responses
-   Use structured logging format
-   Implement different log levels for various environments
-   Include correlation IDs in all logs
-   Log sensitive operations (without sensitive data)
-   Centralize logging configuration

### 8.2 Transactions

-   Implement transaction support in repositories
-   Support distributed transactions if needed
-   Ensure proper rollback on errors
-   Document transactional boundaries
-   Handle nested transactions appropriately
-   Support transaction isolation levels
-   Test transactional behavior
-   Implement compensating transactions for distributed systems

### 8.3 Caching

-   Implement multi-level caching where appropriate
-   Define cache invalidation strategies
-   Document cache behavior
-   Handle cache failures gracefully
-   Consider distributed caching for multi-instance deployments
-   Implement cache warming for critical data
-   Use TTL (time-to-live) for all cached items
-   Monitor cache hit rates and adjust strategy accordingly

### 8.4 Circuit Breaking

-   Implement circuit breakers for external service calls
-   Define failure thresholds and recovery strategies
-   Log circuit state changes
-   Provide fallback mechanisms when services are unavailable
-   Implement health checks for external dependencies
-   Support configurable circuit breaker settings
-   Implement half-open state for recovery testing
-   Monitor circuit breaker metrics

### 8.5 Resilience Patterns

-   Implement retry policies with exponential backoff
-   Use bulkhead pattern to isolate failures
-   Implement timeout handling for all external calls
-   Create fallback strategies for critical operations
-   Use rate limiting to protect external services
-   Implement graceful degradation
-   Monitor system resilience metrics
-   Test failure scenarios regularly

## 9. Examples from Real Implementation

### Repository Implementation with Query Builder:

```typescript
export class ProductRepositoryImpl extends BaseRepository implements ProductRepository {
	constructor(
		dataSource: DataSource,
		private indexResolver: IndexResolver,
		private logger: Logger
	) {
		super(dataSource, logger);
	}

	async findProductsByCategory(
		categoryId: string,
		options: ProductSearchOptions
	): Promise<{ data: Product[]; total: number }> {
		// Resolve the appropriate index based on context
		const index = this.indexResolver.getProductIndex();
		const queryIdentifier = 'find-products-by-category';

		// Use builder pattern to construct query
		const query = new ProductQueryBuilder()
			.withCategory(categoryId)
			.withPriceRange(options.minPrice, options.maxPrice)
			.withAvailabilityFilter(options.inStockOnly)
			.withBrandFilter(options.brands)
			.withAttributeFilters(options.attributes)
			.sortBy(options.sortField, options.sortDirection)
			.withPagination(options.page, options.pageSize)
			.build();

		// Execute query through base repository method
		const response = await this.executeQueryWithPagination(query, index, queryIdentifier);

		// Map results to domain entities
		return {
			data: response.items.map((item) => ProductMapper.toDomain(item)),
			total: response.total
		};
	}

	// Additional repository methods...
}
```

### SQL Repository Implementation:

```typescript
export class OrderRepositoryImpl implements OrderRepository {
	constructor(private sqlClient: SqlClient, private logger: Logger) {}

	async findOrdersByCustomerId(customerId: string, options: OrderQueryOptions): Promise<Order[]> {
		const params = [customerId];
		let query = `
			SELECT o.id, o.created_at, o.status, o.total_amount, o.shipping_address_id,
				   i.id as item_id, i.product_id, i.quantity, i.price
			FROM orders o
			JOIN order_items i ON o.id = i.order_id
			WHERE o.customer_id = ?
		`;

		if (options.status) {
			query += ' AND o.status = ?';
			params.push(options.status);
		}

		if (options.dateFrom) {
			query += ' AND o.created_at >= ?';
			params.push(options.dateFrom.toISOString());
		}

		if (options.dateTo) {
			query += ' AND o.created_at <= ?';
			params.push(options.dateTo.toISOString());
		}

		query += ' ORDER BY o.created_at DESC';

		if (options.limit) {
			query += ' LIMIT ?';
			params.push(options.limit);

			if (options.offset) {
				query += ' OFFSET ?';
				params.push(options.offset);
			}
		}

		try {
			const results = await this.sqlClient.query(query, params);

			// Group by order ID to assemble order with items
			return this.assembleOrdersFromResults(results);
		} catch (error) {
			this.logger.error('Failed to find orders by customer ID', { customerId, error });
			throw new RepositoryError('Failed to find orders', { cause: error });
		}
	}

	private assembleOrdersFromResults(results: any[]): Order[] {
		// Implementation to transform flat SQL results to domain entities
		const orderMap = new Map<string, any>();

		// Group rows by order ID
		for (const row of results) {
			// Implementation details
		}

		// Convert grouped data to domain entities
		return Array.from(orderMap.values()).map((orderData) => OrderMapper.toDomain(orderData));
	}
}
```

### Resilient Service Implementation:

```typescript
export class NotificationServiceImpl implements NotificationService {
	constructor(
		private httpClient: HttpClient,
		private circuitBreaker: CircuitBreaker,
		private retryPolicy: RetryPolicy,
		private logger: Logger,
		private config: NotificationConfig
	) {}

	async sendNotification(notification: Notification): Promise<NotificationResult> {
		// Combine multiple resilience patterns using decorators or composition
		return this.retryPolicy.execute(
			() =>
				this.circuitBreaker.execute(async () => {
					try {
						const response = await this.httpClient.post(
							`${this.config.apiUrl}/notifications`,
							{
								recipient: notification.getRecipient(),
								template: notification.getTemplateId(),
								data: notification.getTemplateData()
							},
							{
								headers: {
									Authorization: `Bearer ${this.config.apiKey}`,
									'Content-Type': 'application/json'
								},
								timeout: this.config.timeout
							}
						);

						this.logger.info('Notification sent successfully', {
							notificationId: response.data.id,
							recipient: notification.getRecipient()
						});

						return NotificationResultMapper.toDomain(response.data);
					} catch (error) {
						this.logger.error('Failed to send notification', {
							recipient: notification.getRecipient(),
							templateId: notification.getTemplateId(),
							error: error.message
						});

						if (this.isTemporaryFailure(error)) {
							// Mark as retriable error for retry policy
							throw new RetriableError('Temporary notification service issue', {
								cause: error
							});
						}

						throw new NotificationError('Failed to send notification', {
							cause: error
						});
					}
				}),
			{
				maxRetries: 3,
				onRetry: (error, retryCount) => {
					this.logger.warn(`Retrying notification (${retryCount}/3)`, {
						error: error.message,
						recipient: notification.getRecipient()
					});
				}
			}
		);
	}

	private isTemporaryFailure(error: any): boolean {
		// Check if this is a temporary failure worth retrying
		return (
			error.response?.status >= 500 || // Server errors
			error.code === 'ECONNRESET' || // Connection reset
			error.code === 'ETIMEDOUT' // Timeout
		);
	}
}
```

## 10. Implementation Checklist

-   [ ] Define repository interfaces in the domain layer
-   [ ] Create base repository implementation with common functionality
-   [ ] Implement repository classes for each domain entity
-   [ ] Create query builders for complex queries
-   [ ] Implement data mappers between infrastructure and domain models
-   [ ] Configure external service clients
-   [ ] Implement proper error handling and logging
-   [ ] Add caching where appropriate
-   [ ] Implement transactions for data modifications
-   [ ] Add resilience patterns for external services
-   [ ] Create index resolvers if using search engines
-   [ ] Implement specialized repositories for different data stores if needed
-   [ ] Write unit and integration tests
-   [ ] Document repository behavior and constraints
-   [ ] Implement performance monitoring
-   [ ] Configure security settings for external services
-   [ ] Set up observability infrastructure
-   [ ] Create health checks for external dependencies

## 11. Conclusion

The infrastructure layer is the outermost layer of clean architecture, implementing the interfaces defined by the domain layer and handling all interactions with external systems. By following this SOP, you can create a clean, maintainable infrastructure layer that effectively isolates external concerns from your domain logic, making your application more testable, maintainable, and adaptable to changing requirements.
