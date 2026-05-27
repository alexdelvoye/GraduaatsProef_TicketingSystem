# Forcebit Ticketing

Forcebit Ticketing is a small support ticket system with a .NET backend and an Expo React Native frontend. A client can register, log in, create tickets, send messages, and follow the ticket status. A ticket is treated as the full conversation: the text entered during ticket creation is stored as the first message. An admin can log in, view all tickets, reply, and update the status.

## Project Structure

- `Ticketing_Backend/1_Api` - ASP.NET Core Web API entry point, controllers, middleware, configuration.
- `Ticketing_Backend/2_Services` - application services, DTOs, options, exceptions, service interfaces.
- `Ticketing_Backend/3_Persistence` - Entity Framework Core database context, repositories, migrations.
- `Ticketing_Backend/4_Domain` - domain entities, enums, and business rules.
- `Ticketing_Frontend` - Expo React Native app.

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

## Run The Backend

From the repository root:

```powershell
dotnet restore Ticketing_Backend/1_Api/1_Api.csproj
dotnet build Ticketing_Backend/1_Api/1_Api.csproj
dotnet run --project Ticketing_Backend/1_Api/1_Api.csproj
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

From the frontend folder:

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
npx tsc --noEmit
```

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
- Ticket list and ticket detail views.
- Client and admin ticket messages.
- Admin status updates.
- Client close and reopen actions for their own tickets.
- Backend exception middleware with consistent error responses.
- Frontend Formik/Yup validation for the main forms.
- Frontend toast notifications for success and error feedback.
- Structured backend logging.

Deferred for later:

- Real email sending.
- Full attachment flow in the frontend.
- Production secret management.

## Troubleshooting

If the backend starts and then stops, check the console logs first. The project now logs startup, requests, unhandled exceptions, and important service actions.

If the frontend cannot reach the API, confirm that:

- The backend is still running.
- The backend URL is `http://localhost:5047`.
- The frontend base URL matches the device you are testing on.
- CORS is configured for the frontend origin.

If login fails after changing JWT settings, check `Jwt` values in `appsettings.json`. The issuer, audience, and key must match between token creation and token validation.
