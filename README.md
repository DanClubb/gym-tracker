# Gym Tracker - Progressive Web App

A lightweight, mobile-friendly progressive web app for tracking workouts and progress with progressive overload recommendations.

## Features

-   **Authentication**: Email/password sign up and login
-   **Workout Templates**: Create and manage custom workout routines
-   **Workout Logging**: Log actual sets, reps, and weights during workouts
-   **Progressive Overload**: Get recommendations for weight increases based on performance
-   **Progress Tracking**: View historical performance data for exercises
-   **PWA Support**: Install as a mobile app with offline capabilities

## Tech Stack

-   **Frontend**: Next.js 15 (App Router) + TypeScript
-   **UI**: shadcn/ui + Tailwind CSS
-   **State Management**: @tanstack/react-query
-   **Backend**: Supabase (PostgreSQL + Auth)
-   **Package Manager**: pnpm (via Corepack)
-   **Testing**: Playwright for E2E
-   **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

-   Node.js 20.10.0 or later
-   pnpm (installed via Corepack)
-   Supabase account

### 1. Clone and Install

```bash
git clone <repository-url>
cd gym-tracker
pnpm install
```

### 2. Set up Supabase

**Quick Setup:**

```bash
./setup-env.sh
```

**Manual Setup:**

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy the database schema from `supabase/schema.sql` and run it in the Supabase SQL editor

📖 **Detailed instructions:** See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Schema

The app uses the following main tables:

-   `users` - User profiles (extends Supabase auth)
-   `exercises` - Predefined exercise library
-   `workout_templates` - User-created workout routines
-   `workout_exercises` - Exercises within templates
-   `workout_sessions` - Individual workout sessions
-   `workout_sets` - Actual sets performed during sessions

## Key Features

### Authentication

-   Email/password authentication via Supabase Auth
-   Row Level Security (RLS) ensures users only access their own data
-   Automatic user profile creation on signup

### Workout Templates

-   Create custom workout routines with multiple exercises
-   Set target sets, reps, weights, and rest periods
-   Reuse templates for consistent workouts

### Workout Logging

-   Start workouts from templates
-   Log actual performance for each set
-   Track completion status and progress

### Progressive Overload

-   Automatic recommendations after completing workouts
-   Weight increases when targets are met
-   Maintain current weight when targets are missed

### Progress Tracking

-   Historical performance data for each exercise
-   Weight progression over time
-   Volume and intensity tracking

## PWA Features

-   Installable on mobile devices
-   Offline caching of core pages
-   App-like experience with custom icons
-   Responsive design optimized for mobile

## Testing

Run the test suite:

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# E2E tests with UI
pnpm test:e2e:ui
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
pnpm build
pnpm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── workout/          # Workout logging pages
│   └── workouts/         # Template management pages
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components
│   ├── pwa/             # PWA components
│   └── ui/              # shadcn/ui components
└── lib/                 # Utilities and configurations
    ├── hooks.ts         # React Query hooks
    ├── providers.tsx    # Context providers
    ├── supabase.ts      # Supabase client
    └── types.ts         # TypeScript types
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue in the GitHub repository.
