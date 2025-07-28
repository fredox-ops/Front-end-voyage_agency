# Costa Voyage Travel Management System

A comprehensive travel agency management system built with Next.js, TypeScript, and PostgreSQL.

## Features

- **Hotel Booking Management**: Complete CRUD operations for hotel reservations
- **Hotel Directory**: Manage hotel information with ratings and amenities
- **Tour Packages**: Display and manage tour offerings
- **Admin Dashboard**: System administration with backup and export capabilities
- **Data Export**: Excel and CSV export functionality
- **Database Backup**: Automated backup system with PostgreSQL

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd costa-voyage-travel
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Database Setup**
   
   Create a PostgreSQL database:
   \`\`\`sql
   CREATE DATABASE costa_voyage;
   \`\`\`

   Run the initialization script:
   \`\`\`bash
   psql -U your_username -d costa_voyage -f scripts/init-database.sql
   \`\`\`

   Seed with sample data:
   \`\`\`bash
   psql -U your_username -d costa_voyage -f scripts/seed-data.sql
   \`\`\`

4. **Environment Configuration**
   
   Copy the example environment file:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

   Update the database credentials in `.env.local`:
   \`\`\`env
   DB_USER=your_postgresql_username
   DB_PASSWORD=your_postgresql_password
   DB_NAME=costa_voyage
   \`\`\`

5. **Update API Configuration**
   
   Update the database connection settings in all API route files:
   - `app/api/bookings/route.ts`
   - `app/api/hotels/route.ts`
   - `app/api/export/[type]/route.ts`
   - `app/api/admin/backup/route.ts`

   Change these values:
   \`\`\`typescript
   const pool = new Pool({
     user: "your_username",     // Your PostgreSQL username
     host: "localhost",
     database: "costa_voyage",  // Your database name
     password: "your_password", // Your PostgreSQL password
     port: 5432,
   })
   \`\`\`

6. **Run the application**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Tables

- **bookings**: Hotel reservation records
- **hotels**: Hotel directory with amenities and ratings
- **tours**: Tour package information
- **users**: User management for admin access
- **backups**: Backup history tracking

## API Endpoints

- `GET/POST /api/bookings` - Booking management
- `GET/POST /api/hotels` - Hotel directory management
- `GET /api/export/[type]` - Data export (Excel/CSV)
- `POST /api/admin/backup` - Database backup

## Features

### Booking Management
- Create, view, and manage hotel bookings
- Status tracking (confirmed, pending, cancelled)
- Search and filter functionality
- Guest and room management

### Hotel Directory
- Add and manage hotel information
- Star ratings and amenities
- City-based organization
- Image support

### Admin Dashboard
- Real-time sync status monitoring
- Database backup and restore
- Data export to Excel/CSV
- User management
- Security settings
- System information

### Data Export
- Export bookings to Excel/CSV
- Export hotel directory
- Automated file download

## Usage

1. **Bookings Tab**: Manage all hotel reservations
2. **Hotels Tab**: Add and view hotel directory
3. **Tours Tab**: Display tour packages
4. **Admin Tab**: System administration and data management

## Database Configuration

Make sure to update the PostgreSQL connection settings in all API files with your actual database credentials:

\`\`\`typescript
const pool = new Pool({
  user: "your_username",     // Change to your PostgreSQL username
  host: "localhost",
  database: "costa_voyage",  // Change to your database name
  password: "your_password", // Change to your PostgreSQL password
  port: 5432,
})
\`\`\`

## Backup System

The system includes automated backup functionality:
- Manual backup creation via admin panel
- Backup history tracking
- PostgreSQL pg_dump integration

## Technologies Used

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with pg driver
- **Export**: xlsx library for Excel export
- **Icons**: Lucide React

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

© 2024 Costa Voyage Travel Management System. All rights reserved.
