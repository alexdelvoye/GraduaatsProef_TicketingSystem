# Forcebit Ticketing Technical Deep Dive

This document explains how the project is structured and why the main design choices were made. The normal [README.md](README.md) is the practical run guide. This file is the educational version: architecture, theory, workflows and design decisions.

## How To Read This Project

When you need to understand a feature, start at the user action and follow the dependency direction inward:

1. Frontend screen or form: what the user sees and can click.
2. Frontend hook: state, loading, validation result handling, API calls, filtering, and navigation decisions.
3. API controller: route, HTTP binding, JWT user id/role, and conversion from HTTP shapes to service DTOs.
4. Service: the application use case and coordination point.
5. Domain entity/rule: business behavior that should not depend on HTTP or EF Core.
6. Repository and EF Core configuration: database queries, includes, relationships, and persistence details.

## Architecture Overview

The backend uses a layered architecture. The normal request flow looks like this:

```text
API layer -> Services layer -> Persistence layer -> Domain layer
```

The important idea is responsibility direction:

- The API layer knows about HTTP.
- The Services layer knows about use cases.
- The Persistence layer knows about EF Core and MySQL.
- The Domain layer knows about business concepts and rules.

At project-reference level, the API project also references Persistence because it composes dependency injection. The service use cases still depend on repository interfaces, while the Persistence project provides the EF Core implementations.

Controllers should not contain ticket rules. Repositories should not decide who may reply to a ticket. Domain rules should not know about route names or `IFormFile`. Keeping those responsibilities separate makes the code easier to explain, test, and change.

The frontend follows a similar separation:

```text
Screen -> Hook -> API module -> Backend
```

Screens compose UI. Hooks own behavior. API modules own endpoint calls. Shared utilities own reusable transformations such as search, grouping, formatting, and attachment form-data conversion.

## Single Responsibility Principle

Single Responsibility Principle means that a class or module should have one main reason to change.

In this project:

- Controllers change when routes or HTTP behavior change.
- Services change when application workflows change.
- Repositories change when database queries change.
- Domain rules change when business rules change.
- Options classes change when configuration shape changes.
- Frontend screens change when layout changes.
- Frontend hooks change when screen behavior changes.
- Frontend components change when reusable UI changes.
- Frontend utilities change when reusable data transformations change.

This is why ticket status rules live close to the domain and service layer instead of being spread across controllers and React components.

## Backend Layers

### API Layer

Location:

```text
Ticketing_Backend/1_Api
```

Main responsibilities:

- Configure the ASP.NET Core app in `Program.cs`.
- Register dependency injection.
- Configure logging, Swagger, CORS, JWT authentication, and authorization.
- Add middleware.
- Expose HTTP endpoints through controllers.
- Read route/body/form data.
- Read authenticated user id and role from JWT claims.
- Map HTTP-specific request shapes to service DTOs.

Controllers inherit from `ApiControllerBase`, which centralizes claim reading through values such as `CurrentUserId` and `CurrentUserRole`. That matters because the frontend should not send a trusted user id. The authenticated user is determined by the JWT.

API-only request classes live in:

```text
Ticketing_Backend/1_Api/Requests
```

Those classes exist because HTTP sometimes has a special shape. Multipart form-data is the best example. ASP.NET receives uploaded files as `IFormFile`, but services should not depend on ASP.NET-specific types. The controller maps files through `FormFileMapper` into `FileUploadRequest`, which is a normal service DTO containing metadata and a stream.

### Services Layer

Location:

```text
Ticketing_Backend/2_Services
```

Main responsibilities:

- Execute application use cases.
- Validate use-case input.
- Call repositories.
- Call domain rules and domain behavior.
- Call file storage.
- Call email services.
- Create response DTOs.
- Throw meaningful custom exceptions.
- Log important workflow events.

`TicketService` is the main ticket workflow class. It creates tickets, loads ticket details, adds replies, changes status, coordinates attachments, and triggers email notifications. It does not return HTTP responses directly. Instead, it throws service exceptions such as `NotFoundException`, `ForbiddenException`, or `BadRequestException`; middleware turns those into consistent HTTP responses.

Interfaces in `2_Services/Interfaces` are contracts between layers. For example:

- `ITicketService` describes ticket use cases.
- `ITicketRepository` describes what ticket data the service needs.
- `IFileStorageService` describes file storage behavior without tying the service to a local disk implementation.

The service layer depends on abstractions. The persistence layer provides the EF Core implementations.

### Domain Layer

Location:

```text
Ticketing_Backend/4_Domain
```

Main responsibilities:

- Entities such as `Ticket`, `TicketMessage`, `TicketAttachment`, and `User`.
- Enums such as `TicketStatus`, `TicketCategory`, `TicketSubject`, and `UserRole`.
- Rule classes such as `TicketRules` and `UserRoleRules`.
- Domain behavior that belongs to the business concept itself.

Examples:

- `Ticket.Create(...)` creates a ticket in a valid initial state.
- `Ticket.AddMessage(...)` adds a conversation message.
- `Ticket.ChangeStatus(...)` updates status and keeps status-related timestamps consistent.
- `TicketRules.CanAccess(...)` decides if a user may view a ticket.
- `TicketRules.CanReply(...)` decides if a user may reply.
- `TicketRules.CanChangeStatus(...)` protects the status workflow.

This prevents an anemic domain model. An anemic model is where entities are only property bags and every rule is hidden in unrelated service code. This project still uses services for use cases, but the business concepts keep important behavior and rules close to the domain.

### Persistence Layer

Location:

```text
Ticketing_Backend/3_Persistence
```

Main responsibilities:

- EF Core `AppDbContext`.
- Entity configuration classes.
- Repository implementations.
- Migrations.
- Database reads and writes.

Repositories hide EF Core query details from services. For example, a service can ask for a ticket detail without repeating all the `Include(...)` logic needed to load messages, senders, client data, and attachments.

This gives one clear place to change query behavior if the database access pattern changes later.

## DTOs And Mapping

DTO means Data Transfer Object. DTOs define the shape of data crossing a boundary.

This project uses DTOs for three reasons:

- Prevent EF/domain entities from leaking directly to the frontend.
- Keep API responses stable even if database shape changes.
- Make request and response contracts easy to read.

Examples:

- `TicketListItemResponse` is small and used for overview pages.
- `TicketDetailResponse` includes messages and attachment metadata.
- `CreateTicketRequest` describes what the service needs to create a ticket.
- `ClientListItemResponse` includes client summary data and ticket counts for the admin dashboard.

API-specific form request classes stay in the API layer because their shape is caused by HTTP binding. General use-case DTOs live in the Services layer because services own the application workflow.

## Options Pattern

The backend uses the Options pattern for grouped configuration:

- `JwtOptions`
- `EmailOptions`
- `FileStorageOptions`

Instead of reading raw configuration strings throughout the app, `Program.cs` binds configuration sections to strongly typed classes and validates them on startup.

Benefits:

- Related settings stay together.
- Missing or invalid configuration fails early.
- Services receive typed settings instead of magic strings.
- Configuration becomes easier to explain and test.

The Brevo API key can come from appsettings, user secrets, or `BREVO_APIKEY`. Empty environment variable values are ignored so they do not accidentally override local user secrets.

## Startup Behavior

The backend does two important startup actions:

1. It checks the database connection before accepting requests.
2. It seeds a configured admin user if that user does not exist.

The database check is fail-fast behavior. Authentication, tickets, messages, attachments, profile data, and the admin account all depend on MySQL. If MySQL is stopped, the API should fail during startup with a clear database error instead of appearing healthy and failing later during login or replies.

The admin seed is development/demo support. Credentials come from configuration, not hard-coded service logic.

## Authentication And Authorization

The app uses JWT bearer authentication.

Login flow:

1. User submits email and password.
2. `AuthService` finds the user and verifies the BCrypt password hash.
3. `TokenService` creates a JWT.
4. The frontend stores the token.
5. API calls send the token in the `Authorization` header.
6. ASP.NET Core validates the token and fills the `User` claims.
7. Controllers read the user id and role from claims.

Authentication answers: who is this user?

Authorization answers: may this user do this action?

Role attributes such as `[Authorize(Roles = "Admin")]` protect admin-only routes. More specific ticket permissions live in `TicketRules`, because rules like "a client can only view their own ticket" are business rules, not just route rules.

## Error Handling And Logging

The backend uses `ExceptionMiddleware` for central error handling.

Services throw meaningful exceptions:

- `BadRequestException`
- `UnauthorizedException`
- `ForbiddenException`
- `NotFoundException`
- `ConflictException`

The middleware maps them to consistent JSON responses. This keeps controllers small and gives the frontend one predictable error shape.

`Program.cs` also customizes model validation responses so DataAnnotations errors use the same general response style.

Logging uses console/debug providers and structured messages. Structured logging stores values such as `TicketId`, `UserId`, and `Status` as fields instead of hiding them inside one long string. That makes logs easier to search during development or a demo.

## Ticket Workflow

Ticket statuses:

- `New`: the client created the ticket and support has not replied yet.
- `Open`: the conversation is active, or a closed ticket was reopened.
- `Closed`: the issue is resolved and the conversation is read-only for replies.

Important rules:

- New tickets start as `New`.
- `New` is creation-only and cannot be manually selected later.
- When an admin replies to a `New` ticket, it becomes `Open`.
- Admins can set tickets to `Open` or `Closed`.
- Clients can close or reopen their own tickets.
- Reopening a closed ticket uses `Open`, not `New`, because the ticket already has conversation history.
- Users can view closed tickets, but replies to closed tickets are blocked.

Older development databases may contain the previous strings `Open` and `InProgress`. The `RenameTicketWorkflowStatuses` migration maps old `Open` to `New` and old `InProgress` to `Open` so stored data matches the current workflow language.

## Ticket Creation Flow

1. The client fills in the new ticket form.
2. Formik manages form state.
3. Yup validates required fields and limits.
4. The frontend hook chooses JSON or multipart based on selected attachments.
5. The controller reads the authenticated client id from JWT claims.
6. The controller maps HTTP/form data to service DTOs.
7. `TicketService.CreateTicketAsync` validates client, category, and subject.
8. `Ticket.Create(...)` creates the ticket container.
9. The form description is saved as the first `TicketMessage`.
10. Optional attachments are saved and connected to the first message.
11. The repository saves the ticket and message graph.
12. The frontend shows success feedback.

The first description is a message by design. A ticket is treated as the full support conversation, so every piece of conversation text belongs in the messages list and can be displayed chronologically.

## Reply Flow

1. User writes a reply in `TicketReplyForm`.
2. Yup validates the message.
3. `useTicketDetailScreen.handleSendReply` sends JSON or multipart.
4. `TicketMessagesController` reads the sender id/role from JWT claims.
5. `TicketService.AddMessageAsync` checks access and reply permission.
6. The message is added through domain behavior.
7. Attachments are saved if present.
8. Admin replies to `New` tickets move the ticket to `Open`.
9. Admin replies trigger a Brevo email to the client.
10. The frontend reloads ticket detail from the API.

Reloading after save avoids guessing local state. The UI displays the database result, including any status changes caused by the backend.

## Attachment Flow

Attachments are supported during ticket creation and replies.

Frontend responsibilities:

- `useAttachmentPicker` owns selected file state.
- It appends new selections, avoids duplicate selections, checks the 20 MB total, and calculates selected/remaining size.
- `AttachmentPicker` renders buttons, selected files, per-file remove actions, and validation text.
- `attachmentFormData` builds platform-specific multipart requests.

Backend responsibilities:

- Controllers read uploaded files from `Request.Form.Files`.
- `FormFileMapper` converts `IFormFile` to `FileUploadRequest`.
- `LocalFileStorageService` validates size and extension, saves the file, and protects path resolution.
- `TicketService` creates attachment metadata rows and connects files to the correct message.
- Attachment download endpoints are protected by JWT and ticket access rules.

Allowed extensions:

```text
.png
.jpg
.jpeg
.pdf
.zip
```

PNG and JPG/JPEG previews use the same protected download path. The frontend fetches the file with the JWT token, creates a temporary object URL, and revokes old object URLs when ticket data changes or the screen unmounts. This keeps the upload folder private while still making screenshots easy to inspect.

The database stores attachment metadata, not file bytes. The local file path is stored in the database, while the binary file is stored on disk.

## Email Notifications

Brevo is used for transactional ticket emails.

Notification rules:

- Admin sends a reply: the ticket client receives an email.
- Admin changes status: the ticket client receives an email.
- Client creates, replies, closes, or reopens: no email is sent to admins.

This design keeps admin inboxes from being flooded. Admins use the dashboard as their work queue.

`TicketService` decides when email should be sent because it knows the workflow and current user role. `EmailService` only formats and sends the message through Brevo. That separation keeps provider-specific API code out of the ticket use case.

User-entered message text is HTML-encoded before being placed into email HTML.

## Frontend Structure

Location:

```text
Ticketing_Frontend/src
```

Main folders:

- `navigation`: route stack and Expo web linking config.
- `screens`: page-level composition.
- `hooks`: stateful behavior and API orchestration.
- `forms`: Formik form components.
- `components`: reusable non-form UI such as `AppHeader`, `PaginationControls`, and `TicketGroupSection`.
- `api`: endpoint calls and HTTP error normalization.
- `styles`: stylesheet groups and shared theme values.
- `utils`: formatting, ticket grouping/search, and attachment conversion helpers.
- `validation`: Yup schemas.
- `types`: shared TypeScript types.

Screens should remain mostly presentational. When a screen becomes full of data loading, filtering, submit behavior, or side effects, that logic belongs in a hook.

## Frontend State And Derived Data

The dashboard pages keep raw API results as the source of truth.

For the admin dashboard:

```text
clients + tickets
-> searched clients
-> filtered tickets
-> grouped New/Open/Closed ticket sections
-> paginated section items
```

For the client dashboard:

```text
tickets
-> searched/filtered tickets
-> grouped New/Open/Closed ticket sections
-> paginated section items
```

Search results, filters, counts, and groups are derived state. They are calculated from the raw tickets instead of stored as separate state arrays. This avoids stale UI bugs where one list updates and another list accidentally keeps old data.

`TicketGroupSection` owns pagination per workflow group. Moving through `Closed` tickets does not change the current page for `New` or `Open` tickets.

Pagination is currently client-side because these overview APIs already return the full list needed by the screen. Server-side pagination is a logical future improvement if the dataset becomes too large.

## Forms And Validation

The frontend uses Formik and Yup.

Formik:

- Owns form state.
- Tracks touched fields.
- Handles submit state.

Yup:

- Describes validation rules.
- Keeps validation separate from JSX layout.
- Gives consistent field errors.

Backend request DTOs and database configuration still remain the final authority. Frontend validation improves user experience, but backend validation protects the system.

Ticket messages are limited to 3000 characters in the frontend validation, backend DTOs, and database column. Keeping those limits aligned prevents confusing "frontend allowed it, backend rejected it" behavior.

## Navigation And Browser History

Expo web uses the same React Navigation stack as the app, but the browser expects URL-based history. `linkingConfig.ts` maps route names to paths such as:

```text
/login
/register
/tickets
/admin
/profile
/tickets/new
/tickets/:ticketId
```

Without this config, the browser back and forward buttons do not understand app navigation. With it, refreshes and direct ticket links behave more like a normal web app.

## Styling And Responsiveness

Styles are split by responsibility:

- `theme.ts` contains shared colors and layout values.
- `sharedStyles` contains common page/card/text styles.
- `headerStyles`, `buttonStyles`, `formStyles`, `ticketStyles`, `attachmentStyles`, `profileStyles`, and `dashboardStyles` own specific UI areas.
- `homeStyles.ts` aggregates authenticated app styles so screens keep a simple import.

`useResponsiveLayout` exposes named breakpoints such as `isCompact` and `isNarrow`. This keeps responsive decisions consistent across screens, forms, headers, ticket cards, option buttons, and chat bubbles.

The ticket conversation is intentionally chat-like:

- Client messages are aligned to one side.
- Admin messages are aligned to the other.
- Different background colors make sender role visible at a glance.
- Image previews reduce unnecessary downloads for common screenshots/photos.

## Profile Workflow

Users can edit:

- Name
- Email

Users cannot edit:

- Company name
- Role

Those fields are business/admin data, not normal profile fields. The backend enforces this with `UpdateProfileRequest`, which contains only editable fields.

Clients can delete their own account. Admin deletion is refused. The backend removes uploaded files and tickets before removing the client user because ticket/client relationships require a safe deletion order.

## Development Launcher

`Start-Forcebit.bat` delegates to `scripts/Start-Forcebit.ps1`.

The launcher:

- Checks for `dotnet`, `npm`, and `node_modules`.
- Starts backend and frontend in separate terminals.
- Lets Expo open the frontend browser tab.
- Can open Swagger with `-OpenSwagger`.
- Stops the started process trees when the launcher exits.

This is development automation, not application logic, so it lives in `scripts` rather than inside a backend or frontend source folder.

## Design Decisions

### Why layered architecture?

Layering separates HTTP concerns, application use cases, database access, and business rules. If a ticket rule changes, look in domain rules or ticket service. If a query changes, look in the repository. If a route changes, look in the controller.

### Why repositories?

Repositories keep EF Core query details out of services. Services can express use cases without repeating database include logic or persistence details.

### Why DTOs?

DTOs protect the API contract. The frontend receives exactly what it needs, not full EF entities with navigation properties and database-specific shape.

### Why domain rules?

Ticket status permissions are business rules. Keeping them in `TicketRules` prevents the frontend or controllers from becoming the only enforcement point.

### Why is the initial description a message?

The project treats a ticket as a conversation. The ticket table stores stable metadata; the messages table stores conversation text. This keeps the first message and later replies in one chronological list.

### Why fail fast when MySQL is unavailable?

The main workflows cannot work without persistence. A startup failure gives a clear setup error before the API accepts requests.

### Why use hooks on the frontend?

Hooks keep screen files readable. A screen should describe what is rendered; a hook should own behavior such as loading, filtering, submitting, refreshing, and showing notifications.

### Why use derived state for filters and groups?

Derived state reduces duplication. The app stores raw API results and calculates filtered/grouped/paginated views from them. This reduces the chance of inconsistent lists.

### Why client-side pagination for now?

The current APIs return the full lists needed by the dashboards, and the project size is still local/demo scale. Client-side pagination centralizes the UI pattern now. If the data grows, the same controls can be connected to server-side pagination later.

## Future Improvements

- Move all local secrets to user secrets or environment variables.
- Add automated integration tests for authentication, ticket creation, replies, status changes, and attachments.
- Add server-side pagination if production ticket/client lists become large.
- Add production logging sinks such as files or external monitoring.
- Add role-management/admin user management instead of relying only on seed configuration.
