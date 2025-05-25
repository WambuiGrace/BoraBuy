# BoraBuy Price Tracker

BoraBuy is a modern, offline-capable price tracking application designed to help businesses monitor and manage supplier prices efficiently. Built with Next.js 15 and Supabase, it offers a robust set of features for price tracking and supplier management.

## Features

### Core Functionality
- **Price Tracking**: Record and monitor supplier prices over time
- **Supplier Management**: Maintain a database of suppliers and their information
- **Product Catalog**: Organize products with categories and units
- **Price History**: View historical price trends and generate reports
- **Multi-supplier Comparison**: Compare prices across different suppliers

### Advanced Features
- **Offline Support**
  - Works without internet connection
  - Automatic data synchronization when back online
  - IndexedDB storage for offline data
  - Service Worker for caching static assets
  - Offline-first PWA capabilities

- **Real-time Notifications**
  - Price change alerts
  - Supplier updates
  - System notifications
  - Email notifications (optional)
  - Push notifications support
  - Color-coded notification types (info, success, warning, error)

- **Data Visualization**
  - Price trend charts
  - Supplier comparison graphs
  - Interactive reports
  - Customizable date ranges

### Security Features
- Secure authentication with Supabase Auth
- Row Level Security (RLS) policies
- Protected API routes
- Secure data handling

## Technology Stack

- **Frontend**
  - Next.js 15
  - React 19
  - TypeScript
  - Tailwind CSS
  - shadcn/ui Components
  - Lucide React Icons

- **Backend**
  - Supabase (Database & Authentication)
  - PostgreSQL
  - Row Level Security

- **Storage**
  - Supabase Storage
  - IndexedDB (offline storage)
  - Service Worker Cache

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- pnpm package manager
- Supabase account

### Environment Setup
Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

### Database Setup
1. Create a new Supabase project
2. Run the migration files in the `supabase/migrations` directory
3. Enable Row Level Security (RLS)
4. Configure storage buckets for avatars

## Project Structure

```
BoraBuy/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard views
│   ├── notifications/     # Notifications system
│   ├── products/         # Product management
│   ├── suppliers/        # Supplier management
│   └── ...
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── supabase/             # Supabase configurations and migrations
```

## Features Documentation

### Price Entry System
- Add new price entries with supplier details
- Record quantity and notes
- Automatic timestamp recording
- Offline capability

### Notification System
- Real-time updates using Supabase subscriptions
- Mark notifications as read/unread
- Bulk actions (mark all as read)
- Notification preferences in user settings

### Offline Support
- Service Worker for asset caching
- IndexedDB for data storage
- Background sync when online
- Offline indicator and status

### Reports and Analytics
- Price trend analysis
- Supplier comparison
- Export functionality
- Custom date range filtering

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/) 
