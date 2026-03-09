# Clean Code & Best Practices

To maintain high code quality and consistency across the Zerra API, please follow these guidelines.

## Architecture & Separation of Concerns

### Module Structure

Maintain the 5-layer split: **Routes -> Controller -> Service -> Repository -> Validator**.

- **Repositories**: Database interaction only. No business rules here.
- **Services**: Where business logic lives. This layer handles authorization logic (e.g., "is the user banned?" or "does the user own this resource?").
- **Controllers**: Thin wrappers. Their job is to extract data from the request and pass it to the service.
- **Validators**: Use Zod for all request validation. Coerce types where necessary (especially for URL parameters).

## Naming Conventions

- **Classes**: `PascalCase` (e.g., `PostService`, `UserRepository`).
- **Files**: `kebab-case` or `dot.notation` (e.g., `posts.controller.ts`, `api-error.ts`).
- **Variables/Functions**: `camelCase`.
- **Interfaces**: Prefixed with `I` (e.g., `IUser`) to distinguish from classes.
- **Persistence**: Use `createdAt` and `updatedAt` for timestamps (Prisma standard).

## Error Handling

- **Throw Errors**: Never return error JSON manually. Always throw an instance of `AppError` or its subclasses (`NotFoundError`, `AuthenticationError`, etc.).
- **Global Handler**: The global error handler catches these and applies a standardized format.
- **Specificity**: Use specific error classes instead of generic ones for better client feedback.

## Code Quality

- **Type Safety**: Avoid `any`. Define interfaces in `src/shared/types/`.
- **Async/Await**: Use async/await for all asynchronous operations.
- **Function Responsibility**: Keep functions small and focused on a single task.
- **Dependency Injection**: Pass dependencies through constructors to improve testability and modularity.

## Database (Prisma)

- **Schema Management**: Always update `schema.prisma` and run `pnpm db:migrate` to keep the database in sync.
- **Repository Abstraction**: Do not use `db.prisma` directly in services or controllers. Always access the database through repositories.

## Testing (Coming Soon)

- Place tests in a `__tests__` folder within the module or alongside the file being tested with a `.test.ts` extension.

## Git Workflow

- **Descriptive Commits**: Use descriptive commit messages (e.g., `feat: article module`, `fix: auth validation error`).
- **Focused Commits**: Keep commits focused on a single change or feature module.
