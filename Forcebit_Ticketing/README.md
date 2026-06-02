# Forcebit Ticketing

Forcebit Ticketing is a small support ticket system with a .NET backend and an Expo React Native frontend. A client can register, log in, create tickets, send messages, and follow the ticket status. A ticket is treated as the full conversation: the text entered during ticket creation is stored as the first message. An admin can log in, view all tickets, reply, and update the status.

## Project Structure

- `Ticketing_Backend/1_Api` - ASP.NET Core Web API entry point, controllers, middleware, configuration.
- `Ticketing_Backend/2_Services` - application services, DTOs, options, exceptions, service interfaces.
- `Ticketing_Backend/3_Persistence` - Entity Framework Core database context, repositories, migrations.
- `Ticketing_Backend/4_Domain` - domain entities, enums, and business rules.
- `Ticketing_Frontend` - Expo React Native app.

Frontend structure:

- `src/navigation` - React Navigation stack setup and route guards.
- `src/screens` - page-level components that compose hooks, forms, and UI components.
- `src/forms` - reusable Formik/Yup form components.
- `src/components` - reusable non-form UI components such as the shared app header.
- `src/hooks` - screen behavior and reusable stateful logic.
- `src/api` - API calls and HTTP error normalization.
- `src/styles` - React Native stylesheets split by responsibility plus shared theme values.
- `src/utils` - formatting, attachment, and helper functions.
- `src/validation` - Yup validation schemas.
- `src/types` - shared TypeScript request/response/navigation types.

The style folder is intentionally split: `theme.ts` contains colors/layout
tokens, `appStyles.ts` belongs to the navigation shell, `authSharedStyles.ts`
contains repeated login/register card styles, and the ticket dashboard styles
are grouped into header, button, form, ticket, attachment, profile, and shared
definition files. `homeStyles.ts` combines those groups so screens can keep a
simple import while the style code remains explainable.

## Requirements

- .NET SDK 10 preview or the SDK version used by the project.
- Node.js and npm.
- Expo tooling through `npx expo`.
- MySQL running locally.

## Local Database

The development connection string is stored in `Ticketing_Backend/1_Api/appsettings.json`.

Default local database:

```text
forcebit_ticketingdb
```

The current development connection string uses the local MySQL `root` user. For a real deployment, move secrets such as database passwords and JWT keys into environment variables or user secrets.

The backend checks the MySQL connection during startup. If MySQL is not running
or the connection string is wrong, the API stops immediately with a clear
database connection error instead of starting and failing later during login or
ticket actions.

## Email Notifications

The backend uses Brevo for ticket notification emails. Configure these values in the `Email` section or with environment variables/user secrets:

```text
Email:ApiKey
Email:FromEmail
Email:FromName
```

`Email:ApiKey` can also come from the `BREVO_APIKEY` environment variable. Keep real API keys out of source control. `Email:FromEmail` must be a sender address or domain that is verified in Brevo.

For local development, store the Brevo key with .NET user secrets:

```powershell
dotnet user-secrets set "Email:ApiKey" "<your-brevo-api-key>" --project Ticketing_Backend/1_Api/1_Api.csproj
```

The app only sends email notifications to clients. Admins use the dashboard to see new tickets and client replies, which prevents the support mailbox from being flooded when many clients are active.

Ticket descriptions and replies are limited to 3000 characters so they fit the database message column and return clear validation errors.

## Start The Full App

For development and showcase demos, the repository includes a PowerShell launcher:

```powershell
.\Start-Forcebit.bat
```

On Windows, you can also double-click `Start-Forcebit.bat` from File Explorer.
The batch file opens the PowerShell launcher with the correct execution policy
for this local script.

You can also run the PowerShell script directly:

```powershell
.\scripts\Start-Forcebit.ps1
```

If Windows blocks local scripts because of the execution policy, run it with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\Start-Forcebit.ps1
```

The script starts the backend in one PowerShell window and starts the Expo web
frontend in another window. Expo opens the frontend in the browser. Keep the
launcher window open while developing or presenting. When you press any key in
that launcher window, it stops both services and closes the backend/frontend
terminal windows.

Runtime logs stay visible in the matching service window:

- Backend `ILogger` output appears in the backend PowerShell window.
- Frontend Expo/Metro output appears in the frontend PowerShell window.

Default URLs:

```text
Backend:  http://localhost:5047
Frontend: http://localhost:8081
Swagger:  http://localhost:5047/swagger
```

Optional parameters:

```powershell
.\scripts\Start-Forcebit.ps1 -OpenSwagger
.\scripts\Start-Forcebit.ps1 -NoBrowser
.\scripts\Start-Forcebit.ps1 -FrontendPort 8082
```

`-NoBrowser` starts Expo without the `--web` browser-open flag. This is useful
when you want the servers running but do not want a browser tab opened
automatically.

The launcher expects frontend dependencies to be installed already. If
`Ticketing_Frontend/node_modules` is missing, run `npm install` inside
`Ticketing_Frontend` first.

## Attachments

Clients can add one or more attachments while creating a ticket, and clients/admins can add attachments to replies. The picker can be opened multiple times before sending; each new selection is added to the message. Attachments shown in the conversation can be clicked in the web app to download the stored file. The backend accepts:

```text
.png
.jpg / .jpeg
.pdf
.zip
```

The local upload limit is `20 MB` per ticket message, matching Brevo's transactional email limit for the whole email including attachments and content. The frontend shows a clear error when the selected files exceed that limit, and the backend enforces the same rule. Attachment metadata is stored in the database, while the file itself is saved under the configured upload folder.

Stored metadata:

```text
Id
TicketId
MessageId
UploadedById
FileName
FilePath
ContentType
UploadedAt
```

## Run The Backend

From `cmd.exe`, run:

```cmd
cd /d C:\Users\alexd\Documents\Graduaat_Programmeren\Graduaatsproef\repo\Forcebit_Ticketing
dotnet run --project Ticketing_Backend\1_Api\1_Api.csproj --launch-profile http
```

From PowerShell or another terminal already opened in the repository root:

```powershell
dotnet restore Ticketing_Backend/1_Api/1_Api.csproj
dotnet build Ticketing_Backend/1_Api/1_Api.csproj
dotnet run --project Ticketing_Backend/1_Api/1_Api.csproj --launch-profile http
```

Apply migrations when the database model changes:

```powershell
dotnet ef database update --project Ticketing_Backend/3_Persistence/3_Persistence.csproj --startup-project Ticketing_Backend/1_Api/1_Api.csproj
```

The API runs on:

```text
http://localhost:5047
```

Swagger is available during development at:

```text
http://localhost:5047/swagger
```

## Run The Frontend

From `cmd.exe`, run:

```cmd
cd /d C:\Users\alexd\Documents\Graduaat_Programmeren\Graduaatsproef\repo\Forcebit_Ticketing\Ticketing_Frontend
npm install
npx expo start
```

From PowerShell or another terminal already opened in the repository root:

```powershell
cd Ticketing_Frontend
npm install
npx expo start
```

The frontend API client currently targets:

```text
http://localhost:5047/api
```

When testing on a physical phone, `localhost` points to the phone itself. In that case, change the API base URL in `Ticketing_Frontend/src/api/apiClient.ts` to the LAN IP address of the computer that is running the backend.

## Seeded Admin Account

The backend seeds an admin account on startup:

```text
Email: admin@forcebit.be
Password: Admin123!
```

Clients can register from the app.

## Useful Checks

Backend build:

```powershell
dotnet build Ticketing_Backend/1_Api/1_Api.csproj
```

Frontend lint and TypeScript checks:

```powershell
cd Ticketing_Frontend
npm run lint
npm run typecheck
```

## Development Documentation Rule

When code is added or changed, the matching documentation must be checked in
the same change. Update comments, `README.md`, and `TECHNICAL_README.md` when a
change affects behavior, setup, architecture, important design decisions, or
anything that needs to be explained during the graduaatsproef defense.

Comments should explain why code exists or why a non-obvious choice was made.
They should not repeat simple code line by line. The goal is that the project
stays maintainable and that every important feature can be defended from the
repository documentation.

## Practical Test Flow

1. Start MySQL.
2. Start the backend.
3. Start the frontend.
4. Register a new client account.
5. Create a ticket.
6. Log in as the seeded admin.
7. Reply to the ticket.
8. Switch back to the client and send another message.
9. Update the ticket status as admin.
10. Close the ticket as the client.
11. Reopen the ticket as the client if the issue is not fixed.
12. Check the database tables for the created user, ticket, messages, and status updates.

## Current Scope

Implemented:

- Client registration and login.
- Admin login with seeded account.
- JWT authentication.
- Client ticket creation, with the initial description saved as the first ticket message.
- Ticket creation and replies with attachments.
- Ticket list and ticket detail views.
- Client and admin ticket messages.
- Admin status updates.
- Client close and reopen actions for their own tickets.
- Profile editing for name and email, with company and role shown as read-only account details.
- Client account removal from the profile screen.
- Brevo email notifications to clients for admin messages and status updates.
- Backend exception middleware with consistent error responses.
- Frontend Formik/Yup validation for the main forms.
- Frontend toast notifications for success and error feedback.
- Structured backend logging.

Deferred for later:

- Production secret management.

## Troubleshooting

If the backend starts and then stops, check the console logs first. The project now logs startup, requests, unhandled exceptions, and important service actions.

If the backend reports that it cannot connect to MySQL, confirm that:

- The MySQL service is running.
- Port `3306` is listening locally.
- The database name, user, and password in `DefaultConnection` are correct.
- Migrations were applied to `forcebit_ticketingdb`.

If the frontend cannot reach the API, confirm that:

- The backend is still running.
- The backend URL is `http://localhost:5047`.
- The frontend base URL matches the device you are testing on.
- CORS is configured for the frontend origin.

If login fails after changing JWT settings, check `Jwt` values in `appsettings.json`. The issuer, audience, and key must match between token creation and token validation.
