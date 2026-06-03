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

## Development Launcher

The repository contains `scripts/Start-Forcebit.ps1` for development and
showcase demos. It starts the ASP.NET Core backend, starts the Expo web
frontend, and lets Expo open the frontend URL in the browser.

`Start-Forcebit.bat` is a Windows double-click entry point that delegates to the
PowerShell script. This avoids duplicated startup logic while making the app
easy to launch from File Explorer during a demonstration.

The script is intentionally placed in `scripts` instead of inside the backend or
frontend source folders. It is project automation, not application logic. This
keeps the application layers focused while still making the demo startup
repeatable.

The launcher also checks for `dotnet`, `npm`, and installed frontend
dependencies before starting the app. That makes setup problems visible at the
beginning, which is safer during a presentation than discovering the issue after
multiple terminal windows have opened.

The launcher keeps running while the backend and frontend are active. Pressing
any key in the launcher window stops the process trees that were started for the
demo, which closes the backend and frontend terminal windows and prevents
leftover `dotnet` or `npx expo` processes from continuing in the background.

The backend and frontend are started in separate terminals so their logs stay
separated by responsibility. Backend `ILogger` output remains in the backend
terminal, while Expo/Metro output remains in the frontend terminal. The launcher
does not redirect these streams to files, because terminal output is easier to
watch during development and during a live project demonstration.

Browser opening for the frontend is delegated to Expo's `--web` flag. The
launcher does not open the frontend URL itself, because doing both would create
two browser tabs for the same app.

## Database Startup Check

The backend depends on MySQL for authentication, tickets, conversation messages,
attachments, profile data, and the seeded admin account. Because those workflows
cannot work without persistence, the API verifies the database connection during
startup.

There are two checks:

- `PersistenceServiceExtensions` wraps Pomelo's server-version detection so a
  stopped MySQL service or invalid connection string produces a clear startup
  exception.
- `DatabaseStartupExtensions.EnsureDatabaseIsAvailableAsync` calls EF Core's
  `CanConnectAsync` after the app is built and before requests are accepted.

This is intentional fail-fast behavior. It is better for development and demos
if the backend stops immediately with a database message than if login or ticket
replies fail later with a less obvious provider exception.

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
- Translate HTTP-specific request shapes into service DTOs.

Controllers inherit from `ApiControllerBase`. This base controller centralizes repeated claim-reading logic such as `CurrentUserId` and `CurrentUserRole`. That keeps individual controllers smaller and easier to read.

API-only request models live in `1_Api/Requests`. These models exist when the
shape is caused by HTTP itself, for example multipart form-data binding with
`[FromForm]`. They are kept out of `2_Services/DTOs` because the services should
not know whether data arrived as JSON, form-data, or another transport later.

`FormFileMapper` also lives in the API layer for the same reason. ASP.NET gives
uploaded files to controllers as `IFormFile`, but the services receive
`FileUploadRequest`, which contains only normal metadata and a `Stream`.

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

General use-case DTOs live in `2_Services/DTOs`. These are the contracts used by
the service methods, such as `CreateTicketRequest`, `TicketDetailResponse`, and
`TicketMessageResponse`. They are not EF entities and they are not HTTP-only
form binding models. This is a practical 3-layer compromise: controllers and
services share application DTOs, while domain entities and database models stay
separate.

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

## Email Notifications

The backend sends ticket notifications through Brevo's transactional email API. `EmailOptions` is bound with the Options pattern, and `EmailService` receives a managed `HttpClient` through `AddHttpClient`. The API key can come from the `Email:ApiKey` setting, .NET user secrets, or from the `BREVO_APIKEY` environment variable. Empty `BREVO_APIKEY` values are ignored so they do not accidentally override the local user secret.

Notification rules:

- Admin sends a message: the ticket client receives the ticket title and message body.
- Admin changes status: the ticket client receives the ticket title and new status. Closed tickets use a clearer `Ticket closed` subject because that is the most important client-facing status update.
- Client creates a ticket, replies, closes, or reopens: no email is sent. Admins follow those actions from the dashboard.

`TicketService` decides who should be notified because it knows the workflow and current user role. `EmailService` only formats and sends the email, which keeps provider-specific Brevo code out of the ticket use case. Brevo rejects unverified sender addresses, so `Email:FromEmail` must match a sender or domain configured in the Brevo account.

The service logs Brevo's response body on successful sends so a test run can be matched with the provider message id. Email bodies use a simple table-free HTML layout with clear sections for the heading, ticket title, message/status content, and footer. User-entered ticket text is HTML-encoded before it is inserted into the email.

Ticket messages are limited to 3000 characters. The frontend Yup schemas, backend request DTOs, and database column all use the same limit so long messages fail with a validation message instead of an unexpected database error.

## Attachment Flow

The attachment workflow follows the same three-layer structure as the rest of the project:

1. `NewTicketForm` and `TicketReplyForm` let the user select files and send multipart form data only when files are present. The picker appends new selections so several files can be attached to the first message or a later reply.
2. `attachmentFormData` builds the multipart request differently per platform: web uploads are converted to Blob/File values, while native uploads use the React Native `{ uri, name, type }` file shape.
3. The API controller uses an API request model for the text fields, reads `Request.Form.Files` for files, and uses `FormFileMapper` to convert uploaded files into `FileUploadRequest` DTOs. Reading from `Request.Form.Files` is more reliable for React Native multipart uploads than depending on one exact action-parameter binding shape.
4. `TicketService` creates the message, saves files through `IFileStorageService`, creates `TicketAttachment` metadata rows, and sends admin attachments through Brevo when the client should receive an email. During ticket creation, selected files are attached to the initial message because the description is stored as the first conversation message.
5. `LocalFileStorageService` validates size and extension, writes the file to the configured upload folder, and returns the stored file path. It also owns protected file opening/deletion path resolution, so path safety stays inside the storage implementation instead of being repeated in controllers or workflow services.
6. Existing attachments are downloaded through a protected API endpoint. `attachmentApi` fetches the file with the JWT token and creates a temporary browser download link, so the upload folder does not need to be publicly exposed.
7. PNG and JPG/JPEG attachments use the same protected endpoint for inline previews. The frontend fetches the file with the JWT token, creates a temporary object URL, and revokes old preview URLs when the ticket data changes or the screen unmounts. This keeps the upload folder private while avoiding forced downloads for normal screenshots/photos.

The database stores attachment metadata, not the binary file. The metadata fields are `Id`, `TicketId`, `MessageId`, `UploadedById`, `FileName`, `FilePath`, `ContentType`, and `UploadedAt`.

Allowed local extensions are `.png`, `.jpg`, `.jpeg`, `.pdf`, and `.zip`. The configured upload limit is 20 MB per reply, which follows Brevo's documented transactional email size limit. The frontend mirrors this limit in `attachmentLimits` for immediate user feedback, while `LocalFileStorageService` remains the final backend check. On web, the document picker is configured with `base64: false` so it returns file metadata immediately instead of trying to read a huge file into memory before validation. Because Brevo receives base64 file content, large files should still be tested carefully: base64 makes the outgoing API payload larger than the raw file.

## Frontend Form Structure

The frontend separates page rendering, behavior, forms, reusable components,
styles, and API calls.

Main folders:

- `src/navigation` contains the React Navigation stack. `App.tsx` only wires
  providers and renders `AppNavigator`, so route decisions are not mixed with
  provider setup.
- `src/screens` contains page-level composition. Screens decide what appears on
  a page, but data loading and submit behavior are moved into hooks.
- `src/hooks` contains stateful behavior such as loading tickets, filtering the
  admin dashboard, sending replies, profile actions, and attachment picking.
- `src/forms` contains Formik form components and form-specific UI.
- `src/components` contains reusable non-form UI, such as `AppHeader`.
- `src/styles` contains React Native stylesheets split by UI responsibility and
  shared theme values.
- `src/api` contains endpoint calls and HTTP error normalization.
- `src/utils` contains platform/data helpers such as date formatting and
  multipart attachment conversion.

The frontend uses Formik and Yup for forms.

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

Attachment picking follows the same separation. `useAttachmentPicker` owns the
stateful behavior: opening Expo DocumentPicker, converting picked assets into
`SelectedAttachment` objects, removing duplicate selections, checking the shared
20 MB limit, and showing attachment-specific errors. `AttachmentPicker` is only
a presentational component that renders the buttons, help text, selected file
names, and validation message. `NewTicketForm` and `TicketReplyForm` can
therefore reuse the same attachment behavior without duplicating picker logic in
their JSX.

The shared `AppHeader` component removes repeated FORCEBIT header JSX from the
home, admin, profile, new-ticket, and ticket-detail screens. Screens still pass
their own actions, such as profile navigation, logout, or back navigation. This
keeps the component reusable without letting it know about specific screens.

Import organization follows the same readability rule. Runtime imports and
type-only imports are separated with blank lines, and type-only values use
`import type`. This makes it easier to see which imports affect the JavaScript
bundle and which imports only exist for TypeScript checking.

## Toast Notifications

The frontend uses a notification context to show success and error messages in a uniform way.

Instead of every screen inventing its own alert style, the app has one system for:

- Success confirmations.
- Error messages.
- Form validation submit errors.
- Friendly feedback after actions.

This makes the app feel more professional and also makes the code easier to maintain.

Toasts are positioned at the bottom right on web so they behave like common
desktop ticketing/admin systems and do not cover the page header or navigation.

Formik still shows field errors inline. The shared `formErrorHelpers` submit
path shows a toast when the user presses submit on an invalid form, while the
inline text shows exactly which field needs attention.

## Frontend Styling

The frontend styling follows the Forcebit website direction: dark navy pages,
rounded darker navigation/cards, white text, muted helper text, and lime action
buttons. The shared tokens live in `theme.ts`, so colors and layout values do
not have to be repeated across every stylesheet.

The ticket detail conversation is styled like a chat thread. Client messages
are aligned to the left with a dark bubble, while admin messages are aligned to
the right with a lime bubble. This makes the sender role visible at a glance,
which is easier to scan than a list of identical full-width message cards.

Responsive layout decisions use the `useResponsiveLayout` hook. It exposes
named `isCompact` and `isNarrow` breakpoints so screens, forms, the shared
header, ticket cards, option buttons, and chat bubbles adjust consistently.
Compact layouts reduce page padding, card padding, heading sizes, and preview
heights. Narrow layouts let important actions use the full available width and
allow chat bubbles to grow wider so messages remain readable.

The authenticated ticket area uses `homeStyles` as a small public import for
screens and components, but `homeStyles` is now only an aggregator. The actual
style definitions are split by responsibility:

- `sharedStyles` for page layout, cards, section titles, empty states, loading
  states, and common text.
- `headerStyles` for the reusable `AppHeader`.
- `buttonStyles` for primary, secondary, disabled, and logout buttons.
- `formStyles` for labels, inputs, validation text, text areas, and option
  buttons.
- `ticketStyles` for ticket cards, status pills, and conversation messages.
- `attachmentStyles` for selected files and attachment download buttons.
- `profileStyles` for the profile details and account action area.

Authentication styles are also separated. `loginStyles` and `registerStyles`
keep their different container behavior because login uses `KeyboardAvoidingView`
and register uses a scrollable layout. Their repeated card, input, link, error,
and button styles come from `authSharedStyles`.

The main content wrapper uses a maximum width and centered alignment. This keeps
the app readable on wide desktop browsers while still allowing the same screens
to shrink on smaller windows.

## Profile Editing

The profile screen lets the authenticated user edit only `Name` and `Email`.
`CompanyName` and `Role` are shown as read-only values because those fields are
business/admin data, not normal personal profile details.

The frontend separates those concerns visually as well: editable contact fields
live in the profile form, while company and role are grouped below as account
details.

The backend enforces this by using `UpdateProfileRequest`, which contains only
`Name` and `Email`. Even if a malicious client sends company or role values,
the controller/service do not bind or update those fields.

Client users can also remove their own account from the profile screen. The
backend exposes this as `DELETE /api/profile`, reads the account id from the
JWT, refuses admin deletion, removes uploaded files for the client's tickets,
removes the client's tickets, and then removes the user. This order is needed
because tickets use a restrictive foreign key to the client user, while ticket
messages and attachment rows cascade from the deleted tickets.

## Ticket Workflow

Ticket statuses:

- `New` means a client has created a ticket and support has not replied yet.
- `Open` means the conversation is active or a closed ticket was reopened.
- `Closed` means the issue is resolved and the conversation is read-only.
`New` is creation-only. Status update controls and domain rules allow moving
tickets to `Open` or `Closed`, but not back to `New`.

Older development databases may still contain the old stored strings `Open` and
`InProgress`. The `RenameTicketWorkflowStatuses` migration converts those rows
to `New` and `Open` so database data, backend enum values, and frontend labels
use the same workflow language.

Client ticket creation:

1. Client fills in the ticket form.
2. Formik manages the input state.
3. Yup validates required fields.
4. The hook calls the API.
5. The backend validates the user and ticket rules.
6. The ticket container is created.
7. The form description is saved as the first `TicketMessage`.
8. The ticket starts with status `New`.
9. The ticket and initial message are saved through the repository.
10. The frontend shows a success toast.

Admin reply:

1. Admin opens ticket detail.
2. Admin writes a message.
3. The frontend validates the message.
4. The backend checks that the user is allowed to reply.
5. The message is added to the ticket.
6. If the ticket was `New`, the status changes to `Open`.
7. The updated ticket is returned.

Status update:

1. Admin selects `Open` or `Closed`.
2. The backend checks role and status rules.
3. The ticket status changes through domain behavior.
4. The database is updated.
5. The frontend shows confirmation.

Client close/reopen:

1. Client opens one of their own tickets.
2. If the ticket is `New` or `Open`, the client can close it.
3. If the ticket is closed, the client can reopen it.
4. Reopening moves the ticket back to `Open`.
5. Clients cannot set `New`, because that state is only for newly created tickets.

## Development Documentation Rule

Every code change should be treated as a documentation change candidate. When a
feature, workflow, validation rule, configuration value, architectural choice,
or user-facing behavior changes, the related comments and README sections must
be updated in the same change.

This rule exists because the project is part of a graduaatsproef. The code must
work, but it must also be explainable and defensible. Documentation should make
clear:

- What changed from the user's point of view.
- Where the responsibility lives in the codebase.
- Why the chosen implementation fits the project structure.
- Which setup, test, or demo steps are affected.

Inline comments are reserved for non-obvious implementation decisions. Simple
code should stay readable by itself, while comments explain intent, trade-offs,
or constraints that are useful during maintenance or a project defense.

## Defending The Design

Useful explanation for a presentation:

The project separates HTTP concerns, application workflows, database access, and business rules. This makes the system easier to test, easier to explain, and safer to change. If a ticket rule changes, I know to look in the domain rules. If a database query changes, I look in the repository. If the API response changes, I look in the controller or DTO. This follows Single Responsibility Principle and keeps the layers focused.

Why use middleware for exceptions:

Exception middleware prevents repeated error handling code in every controller. Services can throw meaningful exceptions, and the middleware converts them into consistent HTTP responses.

Why use the Options pattern:

The Options pattern gives strongly typed configuration. Instead of reading individual strings from configuration in many places, the app binds settings once and injects typed objects.

Why check the database on startup:

The app cannot provide its main workflows without MySQL. Startup validation
turns a hidden dependency into an explicit prerequisite. If MySQL is stopped,
the backend fails before serving requests, which gives a clearer development
and demo error than failing during login or while adding a reply.

Why use Formik and Yup:

Formik manages form state, while Yup defines validation rules. This keeps form screens cleaner and makes validation consistent for login, registration, ticket creation, and messages.

Why use repositories:

Repositories keep Entity Framework queries out of services. This makes services more focused on use cases and less focused on database details.

Why some request classes are in the API layer:

Classes such as `CreateTicketWithAttachmentsFormRequest` and
`CreateMessageWithAttachmentsFormRequest` only exist because ASP.NET needs a
shape for multipart `[FromForm]` binding. They are not business concepts and
they are not service use-case contracts. The controller maps them to service
DTOs before calling the service. This keeps HTTP binding details in the API
layer.

Why most DTOs are in the Services layer:

DTOs such as `TicketDetailResponse` and `CreateTicketRequest` are used by the
application use cases themselves. They define what a service method needs or
returns. Keeping those DTOs in the Services layer is acceptable for this
3-layer project because the services own the application workflow. For a larger
Clean Architecture project, the next step would be separate API contracts and
service commands/results, but that would add extra boilerplate here.

Why status rules are in the domain:

Ticket status permissions are business rules. `New` is assigned only during ticket creation. Admins can move tickets between `Open` and `Closed`, while clients can only close or reopen their own tickets. Reopening uses `Open`, not `New`, because an existing conversation should not look like a brand-new ticket. Keeping this rule in `TicketRules` prevents the frontend and controller from becoming the only place where the rule exists.

Why the initial description is a message:

The project treats a ticket as the complete support conversation. The ticket table stores the stable metadata such as client, title, category, subject, status, and timestamps. The text entered during creation is stored as the first `TicketMessage`, so every piece of conversation text lives in the same table and can be displayed chronologically.

## Things Still To Improve

- Move local secrets to user secrets or environment variables.
- Add automated integration tests for the main ticket workflow.
- Add pagination and filtering if the ticket list grows.
- Add production logging sinks such as files or a monitoring service.
