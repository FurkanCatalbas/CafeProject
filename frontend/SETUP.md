# Frontend Setup Guide

## Quick Start

1. **Install Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env file with your backend URL
   ```

3. **Start Development Server:**
   ```bash
   npm start
   ```

## Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend services running (default: http://localhost:8080)

## Environment Configuration

Create a `.env` file in the frontend root:

```
REACT_APP_API_URL=http://localhost:8080
```

## Available Scripts

- `npm start` - Development server (http://localhost:3000)
- `npm run build` - Production build
- `npm test` - Run tests

## Features Implemented

✅ **Authentication System**
- Login/logout with JWT tokens
- Protected routes
- Role-based access control

✅ **Dashboard**
- Real-time statistics
- Recent orders display
- Quick actions

✅ **User Management**
- CRUD operations
- Role assignment (Admin, Manager, Waiter, Cashier, Customer)
- Status management

✅ **Place Management**
- Multi-location support
- Status tracking (Available, Occupied, Reserved, Closed)
- Manager assignment

✅ **Product Catalog**
- Menu management
- Inventory tracking
- Category organization
- Active/inactive status

✅ **Order Management**
- Complete order lifecycle
- Payment processing
- Status tracking
- Order items management

## API Integration

The frontend connects to these backend endpoints:

- `POST /api/auth/token` - User login
- `POST /api/auth/register` - User registration
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/places` - List places
- `POST /api/places` - Create place
- `PUT /api/places` - Update place
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products` - Update product
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `PUT /api/orders` - Update order

## Design System

- **Theme:** Dark with orange accents
- **Colors:**
  - Primary: Orange (#f97316)
  - Background: Dark (#0a0a0a)
  - Cards: Dark gray (#1a1a1a)
- **Typography:** Inter font family
- **Components:** Custom Tailwind CSS classes

## Troubleshooting

### TypeScript Errors
All TypeScript errors have been resolved with proper type annotations.

### Missing Dependencies
Run `npm install` to install all required packages.

### API Connection Issues
1. Ensure backend is running on port 8080
2. Check .env file configuration
3. Verify CORS settings in backend

### Build Issues
1. Clear node_modules: `rm -rf node_modules`
2. Reinstall: `npm install`
3. Check Node.js version: `node --version`

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to your web server

3. Configure environment variables for production

## Support

For issues with:
- Backend integration: Check backend logs
- Frontend compilation: Verify Node.js version
- API connectivity: Check network and CORS settings
