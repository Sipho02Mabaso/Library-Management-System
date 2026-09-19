# Library Management System - AGENTS.md

## Project Structure

```
Library Management System/
├── server/                    # .NET 9 Web API backend + static frontend
│   ├── Program.cs             # App startup (CORS, JWT, EF Core, Swagger)
│   ├── GlobalUsings.cs        # Global using directives
│   ├── server.csproj          # .NET 9 project file (EF Core, JWT, BCrypt, Swagger)
│   ├── Core/
│   │   ├── Entities/          # Domain models (User, Book, BorrowRecord, etc.)
│   │   ├── Enums/             # UserRole, BorrowStatus, BookingStatus, LogAction
│   │   ├── DTOs/              # Data transfer objects
│   │   └── Interfaces/        # Service interfaces
│   ├── Infrastructure/
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/   # Fluent API entity configs
│   │   │   └── SeedDataInitializer.cs
│   │   ├── Services/           # Business logic (AuthService, BookService, etc.)
│   │   └── Middleware/
│   │       └── ServiceExtensions.cs  # DI registration, JWT, Swagger
│   ├── Controllers/            # API controllers (11 controllers)
│   └── Migrations/
│       └── InitialCreate.sql   # Initial migration
├── client/                     # Vanilla HTML/CSS/JS frontend
│   ├── index.html              # SPA entry point with landing spinner
│   ├── css/
│   │   ├── theme.css           # Maroon/cream color palette
│   │   ├── landing.css         # Loading spinner styles
│   │   └── app.css             # Layout (nav, sidebar, cards)
│   ├── js/
│   │   ├── api.js              # HTTP client with JWT token handling
│   │   ├── auth.js             # Authentication (login/register)
│   │   ├── app.js              # Router, nav, sidebar
│   │   ├── landing.js          # Spinner init
│   │   ├── books.js            # Book browsing & borrowing
│   │   ├── rooms.js            # Room browsing & booking
│   │   ├── sessions.js         # Session browsing & booking
│   │   ├── bookings.js         # My bookings view
│   │   ├── profile.js          # Profile management
│   │   ├── debt.js             # Debt/fines view
│   │   ├── auth-page.js        # Login/register page
│   │   └── admin.js            # Admin dashboard
│   └── assets/
│       └── book-icon.svg       # Book icon for spinner
└── .kilo/
    └── command/
        └── *.md                # Kilo command docs
```

## Build & Run

### Prerequisites
- .NET 9 SDK
- SQL Server (LocalDB or full)
- Node.js (for `python -m http.server` alternative, any static server works)

### Backend

```bash
cd server

# Restore packages
dotnet restore

# Build
dotnet build

# Run (starts API on http://localhost:5005)
dotnet run

# Apply migrations manually (auto-applied on startup)
dotnet ef database update

# Create a new migration after entity changes
dotnet ef migrations add <MigrationName>
```

### Frontend

```bash
cd client

# Serve with Python (built-in)
python -m http.server 5500

# Or with Node.js (if installed)
npx http-server -p 5500

# Or with .NET
dotnet run --project server  # serves frontend at http://localhost:5005

# Open in browser
http://localhost:5500
```

### Default Test Accounts

| Username    | Email                | Password         | Role       |
|-------------|----------------------|------------------|------------|
| admin       | admin@library.com    | Password123!     | Admin      |
| librarian   | librarian@library.com| Password123!     | Librarian  |
| user        | user@library.com     | Password123!     | User       |

### API Endpoints

All endpoints are under `http://localhost:5005/api/`:

**Auth** (no auth required except /me and /logout):
- `POST /auth/login` - Login with username/password, returns JWT
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user
- `PUT /auth/me` - Update profile
- `GET /auth/logout` - Logout

**Books** (public browse, librarian/admin CRUD):
- `GET /books` - List all books
- `GET /books/{id}` - Get book by ID
- `GET /books/{id}/borrow-history` - Librarian/Admin only
- `POST /books` - Librarian/Admin only
- `PUT /books/{id}` - Librarian/Admin only
- `DELETE /books/{id}` - Librarian/Admin only

**Borrows** (user auth required):
- `POST /borrows` - Borrow a book (30 days max)
- `POST /borrows/return` - Return a book
- `GET /borrows/my-borrows` - View active borrows
- `GET /borrows/overdue` - Librarian/Admin only
- `GET /borrows/{id}/fine` - Check fine for borrow

**Rooms** (public browse, librarian/admin CRUD):
- `GET /rooms` - List rooms
- `GET /rooms/{id}` - Room detail
- `POST /rooms` - Librarian/Admin only
- etc.

**Room Bookings** (user auth required for booking):
- `POST /room-bookings` - Book a room
- `GET /room-bookings/available/{roomId}?date=...` - View available slots
- `GET /room-bookings/my-bookings` - My room bookings
- `DELETE /room-bookings/{id}` - Cancel booking
- `DELETE /room-bookings/{id}/cancel` - Admin remove booking

**Sessions** (public browse, librarian/admin CRUD):
- `GET /sessions` - List sessions
- `GET /sessions/{id}` - Session detail
- `POST /sessions` - Librarian/Admin only (poster must be librarian/admin)
- etc.

**Session Bookings** (user auth required):
- `POST /session-bookings` - Book a session
- `GET /session-bookings/my-bookings` - My session bookings
- `DELETE /session-bookings/{id}` - Cancel booking

**Fines** (user auth required):
- `GET /fines/my-fines` - View my fines
- `POST /fines/pay` - Pay a fine
- `GET /fines` - Admin only: all fines
- `DELETE /fines/{id}` - Admin only: remove fine

**Logs** (admin only):
- `GET /logs` - All logs
- `GET /logs/user/{userId}` - User activity

**Admin** (admin only):
- `GET /admin/users` - All users
- `GET /admin/stats` - System statistics
- `PUT /admin/user/{id}/role` - Change user role
- `DELETE /admin/user/{id}` - Deactivate user

**Reports** (admin only):
- `GET /reports/{type}` - CSV export (types: borrows, fines, rooms, users, sessions, logs, activity)

## Business Rules

1. **Borrowing**: 30-day default period; custom due date must not exceed 30 days from borrow date
2. **Fines**: R5 per day for overdue books; automatically calculated on return
3. **Room Bookings**: Hourly slots; no double-booking (time overlap check)
4. **Session Capacity**: Cannot exceed session capacity; users can only book upcoming sessions

## Database

Uses SQL Server (LocalDB by default). Connection string in `appsettings.json`:
```
Server=(localdb)\\mssqllocaldb;Database=LibraryDb;Trusted_Connection=true;
```
