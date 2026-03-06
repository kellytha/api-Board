# Collaborative Workspace API

A professional, production-ready REST API for a collaborative workspace application built with Node.js, TypeScript, Express, and PostgreSQL.

## 🎯 Overview

This backend service powers a collaborative workspace application that allows users to:
- Create and manage boards
- Organize work with columns
- Track tasks with cards
- Tailor work with tags
- Collaborate through comments
- Set due dates for accountability

## 🏗️ Architecture

### Layered Architecture Design

The application follows a clean, scalable **layered architecture** pattern:

```
┌─────────────────────────────────────────────────────────┐
│                   HTTP Requests                          │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│           Route Layer (Express Router)                   │
│  - Defines API endpoints                                │
│  - Handles routing logic                                │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Middleware Layer                            │
│  - Authentication (JWT)                                 │
│  - Request validation (Zod)                             │
│  - Error handling                                       │
│  - Request logging                                      │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│            Controller Layer                              │
│  - Receives validated requests                          │
│  - Calls appropriate services                           │
│  - Sends HTTP responses                                 │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│             Service Layer (Business Logic)               │
│  - Core application logic                               │
│  - Business rules enforcement                           │
│  - Data calculations                                    │
│  - Authorization checks                                 │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│          ORM Layer (Prisma Client)                       │
│  - Database queries                                     │
│  - Data access abstraction                              │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              Database (PostgreSQL)                       │
│  - Persistent data storage                              │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
api/
├── src/
│   ├── controllers/           # HTTP Request Handlers
│   │   ├── authController.ts
│   │   ├── boardController.ts
│   │   ├── columnController.ts
│   │   ├── cardController.ts
│   │   ├── tagController.ts
│   │   └── commentController.ts
│   │
│   ├── services/             # Business Logic Layer
│   │   ├── authService.ts
│   │   ├── boardService.ts
│   │   ├── columnService.ts
│   │   ├── cardService.ts
│   │   ├── tagService.ts
│   │   └── commentService.ts
│   │
│   ├── routes/               # API Route Definitions
│   │   ├── authRoutes.ts
│   │   ├── boardRoutes.ts
│   │   ├── columnRoutes.ts
│   │   ├── cardRoutes.ts
│   │   ├── tagRoutes.ts
│   │   └── commentRoutes.ts
│   │
│   ├── middlewares/          # Express Middleware
│   │   ├── errorHandler.ts   # Global error handling & auth
│   │   └── validation.ts     # Request validation
│   │
│   ├── utils/                # Utility Functions
│   │   ├── token.ts          # JWT token generation/verification
│   │   ├── password.ts       # Password hashing/comparison
│   │   └── errors.ts         # Error classes & response helpers
│   │
│   ├── types/                # TypeScript Interfaces
│   │   └── index.ts
│   │
│   ├── validators/           # Zod Validation Schemas
│   │   └── index.ts
│   │
│   └── index.ts              # Application Entry Point
│
├── prisma/
│   ├── schema.prisma         # Data Model Definitions
│   └── migrations/           # Database Migrations (auto-created)
│
├── .env.example              # Environment Variables Template
├── .gitignore
├── package.json
├── tsconfig.json             # TypeScript Configuration
└── README.md
```

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)             │
│ email (Unique)      │
│ username (Unique)   │
│ password            │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │ 1:N
           │
           ▼
┌─────────────────────┐
│       Board         │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ description         │
│ userId (FK)         │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │ 1:N
           │
           ▼
┌─────────────────────┐
│      Column         │
├─────────────────────┤
│ id (PK)             │
│ name                │
│ position            │
│ boardId (FK)        │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │ 1:N
           │
           ▼
┌──────────────────────────┐      ┌──────────────────┐
│         Card             │      │       Tag        │
├──────────────────────────┤      ├──────────────────┤
│ id (PK)                  │      │ id (PK)          │
│ title                    │      │ name (Unique)    │
│ description              │◄─────► color            │
│ position                 │ M:N  │ createdAt        │
│ columnId (FK)            │      │ updatedAt        │
│ dueDate                  │      └──────────────────┘
│ createdAt                │
│ updatedAt                │
└──────────┬───────────────┘
           │ 1:N
           │
           ▼
┌─────────────────────┐
│      Comment        │
├─────────────────────┤
│ id (PK)             │
│ content             │
│ cardId (FK)         │
│ userId (FK)         │
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
```

### Schema Details

**Users Table**
- Stores user authentication & identity information
- Indexes on email and username for fast lookups
- Passwords are hashed using bcrypt (never stored in plain text)

**Boards Table**
- Represents workspace boards
- Foreign key references the owner (User)
- Cascade delete ensures data integrity

**Columns Table**
- Represents columns within boards (like swimlanes)
- Position field allows ordering
- Composite unique constraint on (boardId, position)

**Cards Table**
- Represents individual tasks/cards
- Optional due date for deadline tracking
- Position field for drag-and-drop ordering
- Composite unique constraint on (columnId, position)

**Tags Table**
- Represents reusable tags (many-to-many with cards)
- Includes color for UI representation
- Unique name constraint

**Comments Table**
- Represents discussions on cards
- References both card and user
- Sorted by creation date for thread view

### Key Design Decisions

1. **UUIDs (CUID) Instead of Auto-Increment**
   - Better for distributed systems
   - No sequential ID enumeration vulnerabilities

2. **Soft Deletes Not Implemented**
   - Simpler schema, cleaner queries
   - Can be added later if audit trail needed

3. **Position Field for Ordering**
   - Allows drag-and-drop without complex SQL
   - Supports concurrent updates better than sort index

4. **Composite Indexes**
   - (boardId, position): Fast column/card reordering
   - (dueDate): Efficient due date queries
   - (createdAt): Timeline queries

5. **Cascade Deletes**
   - When board deleted → columns & cards deleted
   - When card deleted → comments & tag associations deleted
   - Maintains referential integrity automatically

## 🔐 Authentication & Security

### Authentication Flow

```
1. User Registration
   POST /api/v1/auth/register
   ├─ Validate email, username, password match
   ├─ Check email/username uniqueness
   ├─ Hash password with bcrypt (10 rounds)
   ├─ Create user record
   └─ Generate JWT token

2. User Login
   POST /api/v1/auth/login
   ├─ Find user by email
   ├─ Verify password hash
   ├─ Generate JWT token
   └─ Return token & user info

3. Protected Requests
   GET /api/v1/boards
   ├─ Extract token from Authorization header
   ├─ Verify JWT signature
   ├─ Extract userId from payload
   └─ Attach user to request object
```

### Security Features

- **Password Hashing**: bcryptjs with 10 salt rounds
- **JWT Tokens**: Signed with HS256 algorithm
- **Token Expiration**: Default 7 days (configurable)
- **Authorization**: User ownership verification on all endpoints
- **Input Validation**: Zod schemas for all requests
- **Error Messages**: Non-revealing error responses (e.g., "Invalid credentials" instead of "Email not found")

## 🔧 Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18+ |
| Language | TypeScript | 5.3.3 |
| Web Framework | Express | 4.18 |
| ORM | Prisma | 5.8 |
| Database | PostgreSQL | 12+ |
| Validation | Zod | 3.22 |
| Authentication | JWT | 9.0 |
| Password Hashing | bcryptjs | 2.4 |
| CORS | cors | 2.8 |
| Env Variables | dotenv | 16.3 |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone and Setup**
```bash
cd api
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

3. **Setup Database**
```bash
# Create database tables (Prisma migrations)
npm run prisma:migrate

# Optional: Open Prisma Studio to view data
npm run prisma:studio
```

4. **Start Development Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication

```
POST   /api/v1/auth/register          Register new user
POST   /api/v1/auth/login             Login user (returns JWT)
GET    /api/v1/auth/me                Get current user info
```

### Boards

```
POST   /api/v1/boards                 Create board
GET    /api/v1/boards                 Get all user boards
GET    /api/v1/boards/:boardId        Get single board with all columns & cards
PATCH  /api/v1/boards/:boardId        Update board
DELETE /api/v1/boards/:boardId        Delete board
```

### Columns

```
POST   /api/v1/columns                Create column in a board
GET    /api/v1/columns/:columnId      Get column details
GET    /api/v1/boards/:boardId/columns Get all columns in board
PATCH  /api/v1/columns/:columnId      Update column
DELETE /api/v1/columns/:columnId      Delete column
PATCH  /api/v1/boards/:boardId/columns/reorder  Reorder columns
```

### Cards

```
POST   /api/v1/cards                  Create card
GET    /api/v1/cards/:cardId          Get card details
GET    /api/v1/columns/:columnId/cards Get all cards in column
PATCH  /api/v1/cards/:cardId          Update card
DELETE /api/v1/cards/:cardId          Delete card
POST   /api/v1/cards/:cardId/tags/:tagId     Assign tag to card
DELETE /api/v1/cards/:cardId/tags/:tagId    Remove tag from card
POST   /api/v1/cards/:cardId/move     Move card to another column
PATCH  /api/v1/columns/:columnId/cards/reorder  Reorder cards
```

### Tags

```
POST   /api/v1/tags                   Create tag
GET    /api/v1/tags                   Get all tags
GET    /api/v1/tags/:tagId            Get tag details
PATCH  /api/v1/tags/:tagId            Update tag
DELETE /api/v1/tags/:tagId            Delete tag
```

### Comments

```
POST   /api/v1/comments               Create comment on card
GET    /api/v1/comments/:commentId    Get comment details
GET    /api/v1/cards/:cardId/comments Get all comments on card
PATCH  /api/v1/comments/:commentId    Update comment
DELETE /api/v1/comments/:commentId    Delete comment
```

## 📝 Example Requests

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123"
  }'
```

### Create Board (Protected)
```bash
curl -X POST http://localhost:3000/api/v1/boards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "name": "Project Roadmap",
    "description": "Q1 2024 roadmap"
  }'
```

## ✅ Code Quality & Best Practices

### Error Handling

- **Centralized error handler** middleware catches all errors
- **Custom error classes** (ValidationError, NotFoundError, ForbiddenError, etc.)
- **Consistent error responses** with proper HTTP status codes
- **No stack traces** in production error responses

### Validation

- **Zod schemas** for compile-time type safety
- **Request validation middleware** on all protected routes
- **Detailed validation error messages**
- **Type inference** from schemas for controller functions

### Authorization

- **JWT token verification** on all protected routes
- **Resource ownership verification** in service layer
- **Consistent authorization checks** across all endpoints
- **No privilege escalation** vulnerabilities

### Database

- **Prisma migrations** tracked in version control
- **Proper indexes** on frequently queried fields
- **Cascade deletes** for data integrity
- **Unique constraints** where needed

## 🧪 Testing the API

### Using Postman

1. Import the API collection (see next section)
2. Set `bearer_token` in environment variables after login
3. Execute requests in sequence

### Using cURL

```bash
# Health check
curl http://localhost:3000/health

# Get user boards (after login)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/v1/boards
```

## 📦 Deployment Checklist

- [ ] Set strong `JWT_SECRET` in production
- [ ] Use PostgreSQL with proper user permissions
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure appropriate CORS origins
- [ ] Set up database backups
- [ ] Monitor error logs
- [ ] Implement rate limiting (future enhancement)
- [ ] Add request logging/monitoring

## 🔄 CI/CD & Version Control

```bash
# Build TypeScript
npm run build

# Run in production
npm start

# Check for linting issues
npm run lint
```

## 🚀 Performance Optimizations

1. **Database Indexes**: Strategic indexes on FK and frequently filtered columns
2. **Query Optimization**: Prisma select/include for efficient data fetching
3. **Pagination**: Ready for implementation in future iterations
4. **Caching**: Can be added with Redis for frequently accessed data
5. **Connection Pooling**: Configured via DATABASE_URL

## 🔮 Future Enhancements

- [ ] WebSocket for real-time collaboration
- [ ] Comment threads and replies
- [ ] Card attachments
- [ ] User invitations to boards
- [ ] Activity logging/audit trail
- [ ] Advanced filtering and search
- [ ] Rate limiting
- [ ] Request/response caching
- [ ] Email notifications
- [ ] Mobile app support (GraphQL API)

## 📄 License

MIT

## 👤 Author

Built as a professional backend service for collaborative workspace applications.

---

**Status**: Production-Ready | **Version**: 1.0.0 | **Last Updated**: March 2026
