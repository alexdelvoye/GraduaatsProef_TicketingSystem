# Forcebit Ticketing

Forcebit Ticketing is a support ticket system built with an ASP.NET Core backend, a MySQL database, and an Expo React Native frontend. Clients can create tickets, reply in a conversation, attach files, and follow the status. Admins can manage the support queue, reply to clients, and update ticket status.

For architecture, workflow explanations, and graduaatsproef defense notes, see [TECHNICAL_README.md](TECHNICAL_README.md).

## Features

- Client registration, login, profile editing, and client account removal.
- Seeded admin account for local development and demos.
- Ticket creation with category, subject, title, first message, and optional attachments.
- Conversation-style ticket detail with client/admin messages on opposite sides.
- `New`, `Open`, and `Closed` ticket workflow.
- Client close/reopen actions for their own tickets.
- Admin dashboard with client search, ticket search, status/category/subject filters, grouped ticket sections, and pagination.
- Client ticket overview with search, filtering, grouped sections, and pagination.
- Attachments for ticket creation and replies.
- PNG/JPG/JPEG inline previews and protected attachment downloads.
- 20 MB upload limit per ticket message, shown in the frontend and enforced by the backend.
- Brevo email notifications to clients for admin replies and status changes.
- JWT authentication, central API error responses, and frontend toast notifications.
- Expo web browser history support for normal routes and ticket detail links.

## Tech Stack

Backend:

- .NET `net10.0`
- ASP.NET Core Web API
- Entity Framework Core
- Pomelo MySQL provider
- JWT bearer authentication
- Brevo transactional email API

Frontend:

- Expo
- React Native / React Native Web
- React Navigation
- TypeScript
- Formik and Yup

Database:

- MySQL

## Project Structure

```text
Forcebit_Ticketing
|-- Ticketing_Backend
|   |-- 1_Api          ASP.NET Core startup, controllers, middleware, API requests
|   |-- 2_Services     use cases, DTOs, interfaces, options, exceptions
|   |-- 3_Persistence  EF Core DbContext, repositories, migrations
|   `-- 4_Domain       entities, enums, domain rules
|-- Ticketing_Frontend Expo React Native app
|-- scripts            local development launcher scripts
|-- README.md
`-- TECHNICAL_README.md
```

## Requirements

- .NET SDK that supports `net10.0`.
- Node.js and npm.
- MySQL running locally.
- Optional: `dotnet-ef` tool for applying migrations from the command line.

## Configuration

Default local backend settings live in:

```text
Ticketing_Backend/1_Api/appsettings.json
Ticketing_Backend/1_Api/appsettings.Development.json
```

Default local database:

```text
forcebit_ticketingdb
```

Default backend URL:

```text
http://localhost:5047
```

Default frontend API base URL:

```text
http://localhost:5047/api
```

The frontend base URL is centralized in:

```text
Ticketing_Frontend/src/api/apiClient.ts
```

When testing on a physical phone, `localhost` points to the phone itself. Change the frontend API base URL to the LAN IP address of the computer running the backend.

## Email Setup

The backend uses Brevo for email notifications. Configure:

```text
Email:ApiKey
Email:FromEmail
Email:FromName
```

For local development, keep the real API key out of source control:

```powershell
dotnet user-secrets set "Email:ApiKey" "<your-brevo-api-key>" --project Ticketing_Backend/1_Api/1_Api.csproj
```

`Email:ApiKey` can also be provided through the `BREVO_APIKEY` environment variable. `Email:FromEmail` must be a sender address or domain verified in Brevo.

## Install

Install frontend dependencies:

```powershell
cd Ticketing_Frontend
npm install
cd ..
```

Restore the backend:

```powershell
dotnet restore Ticketing_Backend/1_Api/1_Api.csproj
```

Apply database migrations:

```powershell
dotnet ef database update --project Ticketing_Backend/3_Persistence/3_Persistence.csproj --startup-project Ticketing_Backend/1_Api/1_Api.csproj
```

## Run The Full App

The easiest local startup path is the launcher:

```powershell
.\Start-Forcebit.bat
```

You can also run the PowerShell script directly:

```powershell
.\scripts\Start-Forcebit.ps1
```

Useful launcher options:

```powershell
.\scripts\Start-Forcebit.ps1 -OpenSwagger
.\scripts\Start-Forcebit.ps1 -NoBrowser
.\scripts\Start-Forcebit.ps1 -FrontendPort 8082
```

Default URLs:

```text
Backend:  http://localhost:5047
Swagger:  http://localhost:5047/swagger
Frontend: http://localhost:8081
```

The launcher opens separate backend and frontend terminals. Keep the launcher window open; pressing any key in that window stops both services.

## Run Services Manually

Backend:

```powershell
dotnet run --project Ticketing_Backend/1_Api/1_Api.csproj --launch-profile http
```

Frontend:

```powershell
cd Ticketing_Frontend
npx expo start --web
```

## Default Admin Account

The backend seeds an admin account from `appsettings.Development.json` when the configured admin user does not exist:

```text
Email: admin@forcebit.be
Password: Admin123!
```

Clients can register from the frontend.

## Useful Checks

Backend build:

```powershell
dotnet build Ticketing_Backend/1_Api/1_Api.csproj
```

Frontend lint and typecheck:

```powershell
cd Ticketing_Frontend
npm run lint
npm run typecheck
```

## Troubleshooting

If the backend stops during startup, check the backend terminal first. The API validates the MySQL connection before accepting requests.

Common database checks:

- MySQL service is running.
- Port `3306` is available locally.
- `DefaultConnection` points to the correct database, user, and password.
- Migrations were applied.

If the frontend cannot call the API:

- Confirm the backend is running on `http://localhost:5047`.
- Confirm `Ticketing_Frontend/src/api/apiClient.ts` points to the right API base URL.
- For physical device testing, use the computer LAN IP instead of `localhost`.

If login fails after JWT configuration changes, check the `Jwt` settings used by token creation and validation.

## Documentation Rule

This project is part of a graduaatsproef. When code changes affect behavior, setup, architecture, or an important design decision, update the matching comments and documentation in the same change.

Use:

- `README.md` for practical setup and usage.
- `TECHNICAL_README.md` for architecture, theory, workflows, and defense notes.
