# API Routing Documentation

This project uses [Hono](https://hono.dev/) as the web framework. Routing is modular and strictly typed.

## Route Definition Pattern

Each module defines its routes in a separate file (e.g., `articles.routes.ts`) using the following pattern:

```typescript
export function createModuleRoutes(
    controller: ModuleController,
    authMiddleware: AuthMiddleware,
): Hono<AppEnv> {
    const router = new Hono<AppEnv>();

    // Public route
    router.get('/', controller.getAll);

    // Protected route with parameter validation
    router.get('/:id', validate('param', idSchema), controller.getOne);

    // Protected route with session check and body validation
    router.post(
        '/',
        authMiddleware.validateUserSession,
        validate('json', createSchema),
        controller.create,
    );

    return router;
}
```

## Validation

We use a custom `validate` wrapper around Hono's `zValidator`. It ensures that validation errors are thrown as `ValidationError` and handled by the global error handler consistently.

- `validate('json', schema)`: Validates the request body.
- `validate('param', schema)`: Validates URL parameters (e.g., `:id`).

### Type Safety

Validated data can be retrieved in the controller using:

```typescript
const body = c.req.valid('json'); // Typed according to your Zod schema
const { id } = c.req.valid('param'); // Typed and Coerced
```

## Middleware

- **AuthMiddleware**: Used to protect routes. `validateUserSession` ensures the user has a valid active session.
- **Request Logger**: Automatically logs every incoming request with detailed metadata.

## Global Registration

All module routes are mounted to the main router in `src/platform/Application/application.ts`:

```typescript
mainRouter.route('/posts', createPostRoutes(postController, authMiddleware));
mainRouter.route('/articles', createArticleRoutes(articleController, authMiddleware));
```

## Response Standards

All responses MUST use the standardized `ApiResponse` or throw an `AppError`.

### Success

```typescript
return c.json(ApiResponse.success(data, 'Optional Message'), 200);
```

### Error

Instead of returning JSON directly, **throw** an error:

```typescript
throw new NotFoundError('Article');
// or
throw new AppError(400, 'Custom error message');
```

The global error handler in `application.ts` will catch these and format them into a consistent JSON response.
