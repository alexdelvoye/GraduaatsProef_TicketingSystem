# Forcebit Ticketing Technical Notes

This document explains the project in a way that is useful for understanding, presenting, and defending the code. The normal `README.md` explains how to run the project. This file explains why the project is structured the way it is.

## High-Level Architecture

The backend follows a layered architecture:

```text
API layer -> Services layer -> Persistence layer -> Domain layer
```

The dependency direction is important:

- The API layer receives HTTP requests and returns HTTP responses.
- The Services layer contains application use cases such as registering, logging in, creating tickets, replying, and changing status.
- The Persistence layer talks to the database through Entity Framework Core.
- The Domain layer contains business concepts such as `Ticket`, `User`, `TicketStatus`, and rule classes.

The goal is to prevent controllers from becoming too smart. Controllers should not know how ticket rules work, how passwords are hashed, or how files are stored. They should receive a request, ask a service to perform the action, and return a result.

## Single Responsibility Principle

Single Responsibility Principle means that a class should have one main reason to change.

Examples in this project:

- Controllers change when API routes or HTTP behavior changes.
- Services change when application workflows change.
- Repositories change when database queries change.
- Domain rules change when business rules change.
- Options classes change when configuration settings change.
- Middleware changes when cross-cutting request behavior changes.

This keeps the code easier to explain. For example, ticket status validation is not spread across random screens and controllers. It belongs close to the ticket domain logic.

## Backend Layers

## API Layer

Location:

```text
Ticketing_Backend/1_Api
```

Main responsibilities:

- Configure the application in `Program.cs`.
- Register dependency injection.
- Configure authentication and authorization.
- Configure Swagger.
- Add middleware.
- Expose HTTP endpoints through controllers.

Controllers inherit from `ApiControllerBase`. This base controller centralizes repeated claim-reading logic such as `CurrentUserId` and `CurrentUserRole`. That keeps individual controllers smaller and easier to read.

## Services Layer

Location:

```text
Ticketing_Backend/2_Services
```

Main responsibilities:

- Execute application use cases.
- Validate request-specific rules.
- Call repositories.
- Call file storage.
- Create DTO responses.
- Throw meaningful custom exceptions.
- Log important actions.

Example:

`TicketService` is responsible for creating tickets, loading ticket details, adding messages, and changing status. It does not directly decide how HTTP errors should look. It throws service exceptions, and the exception middleware converts them into HTTP responses.

## Persistence Layer

Location:

```text
Ticketing_Backend/3_Persistence
```

Main responsibilities:

- Entity Framework Core `DbContext`.
- Repository implementations.
- Database queries.
- Saving changes.

Repositories hide database details from the services. A service asks for tickets or users without needing to know the exact EF Core query every time.

## Domain Layer

Location:

```text
Ticketing_Backend/4_Domain
```

Main responsibilities:

- Core entities.
- Enums.
- Business rules.
- Domain behavior that belongs to the business concept itself.

Examples:

- `Ticket.Create(...)` creates a valid ticket object.
- `Ticket.AddMessage(...)` adds a message to a ticket.
- `Ticket.ChangeStatus(...)` changes the ticket status.
- `TicketRules` validates ticket-related business rules.
- `UserRoleRules` validates role-related business rules.

This helps avoid an anemic domain model, where entities are only property bags and all rules are hidden somewhere else.

## Options Pattern

The backend uses the Options pattern for grouped configuration:

- `JwtOptions`
- `EmailOptions`
- `FileStorageOptions`

Instead of reading raw configuration strings everywhere, settings are bound once in `Program.cs` and injected where needed through `IOptions<T>`.

Benefits:

- Related settings stay together.
- Missing or invalid configuration can fail early on startup.
- Services receive typed configuration instead of magic strings.
- The code is easier to test.

Example:

JWT settings belong in `JwtOptions`, not scattered through the authentication service and `Program.cs`.

## Authentication Flow

The project uses JWT bearer authentication.

Login flow:

1. The user sends email and password.
2. `AuthService` checks the credentials.
3. If valid, the backend creates a JWT token.
4. The frontend stores the token.
5. Future API calls send the token in the `Authorization` header.
6. ASP.NET Core validates the token before protected endpoints run.

The token contains claims such as the user id, email, and role. Controllers can read those claims through `ApiControllerBase`.

## Error Handling

The backend uses `ExceptionMiddleware` as a central error handler.

Instead of every controller having repeated `try/catch` blocks, services throw meaningful exceptions:

- `ValidationException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`

The middleware maps these exceptions to HTTP status codes and returns a consistent error response.

Benefits:

- API errors look consistent.
- Controllers stay simple.
- Unexpected exceptions are logged.
- Internal exception details are not leaked to the frontend.

The frontend has a matching error handling approach:

- API errors are normalized in one place.
- Screens and hooks can show user-friendly messages.
- Toast notifications give consistent success and error feedback.

## Logging

The backend uses ASP.NET Core logging with console output and request logging middleware.

What gets logged:

- Incoming HTTP requests.
- Response status and duration.
- Important service actions.
- Validation and not-found cases at lower severity.
- Unexpected exceptions at error severity.

This is useful during development because it helps explain why a backend stopped, why a request failed, or which workflow was executed.

Log levels matter:

- `Information` for normal important events.
- `Warning` for expected but important problems, such as invalid login.
- `Error` for unexpected exceptions.

## Frontend Form Structure

The frontend now uses Formik and Yup for forms.

Form components live in:

```text
Ticketing_Frontend/src/forms
```

Validation schemas live in:

```text
Ticketing_Frontend/src/validation
```

This separation matters because screen files should focus on screen layout and user flow. Form components handle form state, and validation schemas handle validation rules.

Benefits:

- Validation is consistent.
- Form errors are shown close to the relevant input.
- Screens are easier to read.
- Rules can be reused.

## Toast Notifications

The frontend uses a notification context to show success and error messages in a uniform way.

Instead of every screen inventing its own alert style, the app has one system for:

- Success confirmations.
- Error messages.
- Friendly feedback after actions.

This makes the app feel more professional and also makes the code easier to maintain.

## Ticket Workflow

Client ticket creation:

1. Client fills in the ticket form.
2. Formik manages the input state.
3. Yup validates required fields.
4. The hook calls the API.
5. The backend validates the user and ticket rules.
6. The ticket container is created.
7. The form description is saved as the first `TicketMessage`.
8. The ticket and initial message are saved through the repository.
9. The frontend shows a success toast.

Admin reply:

1. Admin opens ticket detail.
2. Admin writes a message.
3. The frontend validates the message.
4. The backend checks that the user is allowed to reply.
5. The message is added to the ticket.
6. The updated ticket is returned.

Status update:

1. Admin selects a new status.
2. The backend checks role and status rules.
3. The ticket status changes through domain behavior.
4. The database is updated.
5. The frontend shows confirmation.

Client close/reopen:

1. Client opens one of their own tickets.
2. If the ticket is open or in progress, the client can close it.
3. If the ticket is closed, the client can reopen it.
4. Reopening moves the ticket back to `Open`.
5. Clients cannot set `InProgress`, because that is an internal support workflow state.

## Defending The Design

Useful explanation for a presentation:

The project separates HTTP concerns, application workflows, database access, and business rules. This makes the system easier to test, easier to explain, and safer to change. If a ticket rule changes, I know to look in the domain rules. If a database query changes, I look in the repository. If the API response changes, I look in the controller or DTO. This follows Single Responsibility Principle and keeps the layers focused.

Why use middleware for exceptions:

Exception middleware prevents repeated error handling code in every controller. Services can throw meaningful exceptions, and the middleware converts them into consistent HTTP responses.

Why use the Options pattern:

The Options pattern gives strongly typed configuration. Instead of reading individual strings from configuration in many places, the app binds settings once and injects typed objects.

Why use Formik and Yup:

Formik manages form state, while Yup defines validation rules. This keeps form screens cleaner and makes validation consistent for login, registration, ticket creation, and messages.

Why use repositories:

Repositories keep Entity Framework queries out of services. This makes services more focused on use cases and less focused on database details.

Why status rules are in the domain:

Ticket status permissions are business rules. Admins can manage the full workflow, but clients can only close or reopen their own tickets. Keeping this rule in `TicketRules` prevents the frontend and controller from becoming the only place where the rule exists.

Why the initial description is a message:

The project treats a ticket as the complete support conversation. The ticket table stores the stable metadata such as client, title, category, subject, status, and timestamps. The text entered during creation is stored as the first `TicketMessage`, so every piece of conversation text lives in the same table and can be displayed chronologically.

## Things Still To Improve

- Add real email sending for notifications.
- Finish the frontend attachment upload experience.
- Move local secrets to user secrets or environment variables.
- Add automated integration tests for the main ticket workflow.
- Add pagination and filtering if the ticket list grows.
- Add production logging sinks such as files or a monitoring service.
