# 🚀 Collaborative Workspace API - Setup & Deployment Guide

## Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/collaborative_workspace_db
```

### 3. Create PostgreSQL Database

```bash
# Using psql command line
createdb collaborative_workspace_db

# Or via SQL
psql -U postgres
CREATE DATABASE collaborative_workspace_db;
\q
```

### 4. Setup Database Schema

```bash
# Generate Prisma client (required for first run)
npm run prisma:generate

# Create database tables via migrations
npm run prisma:migrate
# When prompted, give migration a name like "init"

# Optional: Seed database with sample data
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Server will be available at: `http://localhost:3000`

Health check: `http://localhost:3000/health`

## 📚 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Example

**Register**
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

**Response**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clz1234567890abcdef",
      "email": "user@example.com",
      "username": "johndoe",
      "createdAt": "2024-03-06T10:30:00.000Z",
      "updatedAt": "2024-03-06T10:30:00.000Z"
    }
  }
}
```

### Protected Routes

Use the token in Authorization header:
```bash
curl -X GET http://localhost:3000/api/v1/boards \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Project Commands

```bash
# Development
npm run dev           # Start dev server with auto-reload

# Build
npm run build         # Compile TypeScript to JavaScript

# Production
npm start            # Run compiled JavaScript

# Database
npm run prisma:migrate      # Create new migration
npm run prisma:migrate:deploy  # Deploy migrations (production)
npm run prisma:studio       # Open Prisma data browser
npm run prisma:seed         # Run seed script

# Linting
npm run lint         # Check code style

# Testing
npm test            # Run test suite
```

## 📁 Project Structure

```
api/
├── src/
│   ├── controllers/          # HTTP request handlers
│   ├── services/            # Business logic
│   ├── routes/              # API route definitions
│   ├── middlewares/         # Express middleware
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript interfaces
│   ├── validators/          # Zod validation schemas
│   └── index.ts             # Application entry point
│
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed data script
│
├── dist/                    # Compiled JavaScript (after npm run build)
├── .env.example             # Environment template
├── tsconfig.json            # TypeScript config
├── package.json             # Project dependencies
└── README.md                # Full documentation
```

## 🗄️ Database Operations

### Create Migration After Schema Change

```bash
# Edit schema.prisma
nano prisma/schema.prisma

# Create migration
npm run prisma:migrate -- --name "describe_your_changes"

# Apply migration
npm run prisma:migrate:deploy
```

### View Database in Prisma Studio

```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

### Reset Database (⚠️ Deletes all data)

```bash
npx prisma migrate reset
```

## 🔐 Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper database user permissions
- [ ] Enable CORS for trusted domains only
- [ ] Use environment variables for sensitive data
- [ ] Implement rate limiting (future enhancement)
- [ ] Set up database backups
- [ ] Monitor application logs

## 🚀 Deployment

### Heroku Deployment

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET="your-secret-key"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Run migrations
heroku run npm run prisma:migrate:deploy
```

### AWS EC2 Deployment

1. Launch EC2 instance (Node.js AMI)
2. Install PostgreSQL
3. Clone repository
4. Install dependencies: `npm install --production`
5. Build project: `npm run build`
6. Start server: `npm start`
7. Use PM2 to keep process running:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name "workspace-api"
   ```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build
docker build -t workspace-api .

# Run
docker run -p 3000:3000 --env-file .env workspace-api
```

## 📊 Monitoring & Debugging

### View Logs
```bash
npm run dev  # Development logs in console
```

### Database Debugging
```bash
# Connect to PostgreSQL directly
psql -d collaborative_workspace_db -U your_user

# View tables
\dt

# View specific table
SELECT * FROM users;

# Exit
\q
```

### Performance Optimization

```bash
# Check slow queries
npm run prisma:studio  # Use Prisma Studio to monitor

# Add indexes
# (Already added in schema.prisma for common queries)
```

## 🆘 Troubleshooting

### Database Connection Error
```bash
# Check .env DATABASE_URL format:
# postgresql://user:password@localhost:5432/database_name

# Test connection
psql $DATABASE_URL
```

### Port Already in Use
```bash
# Change PORT in .env or:
PORT=3001 npm run dev
```

### Migration Conflicts
```bash
# Reset migrations (⚠️ Deletes data)
npx prisma migrate reset

# Or manually resolve by creating new migration
npm run prisma:migrate
```

### compilation Error

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## 📖 API Documentation

Full API documentation available in `README.md`

Including:
- [ ] Complete endpoint list
- [x ] Request/response examples
- [ ] Error response formats
- [ ] Authentication flow
- [ ] Database schema diagram
- [x] Architecture overview


## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review error messages in logs
3. Check database schema in Prisma Studio
4. Verify .env configuration

## 📝 Contributing

When adding new features:
1. Update database schema in `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Add service in `src/services/`
4. Add controller in `src/controllers/`
5. Add routes in `src/routes/`
6. Add validation in `src/validators/`
7. Test with Postman collection
8. Update API documentation

## 📄 License

MIT

---

**Created**: March 2024  
**Status**: Production-Ready  
**Version**: 1.0.0
