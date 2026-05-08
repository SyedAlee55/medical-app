# Tj's Medical Hub - Project Context

## Overview
**Tj's Medical Hub** is a medical network web application designed to connect patients with doctors. It features a modern, responsive UI and uses a role-based authentication system to manage access for different types of users (patients and doctors/employees).

## Tech Stack
- **Framework:** Next.js 16.2.4 (using the App Router)
- **UI Library:** React 19.2.4
- **Styling:** Tailwind CSS v4, `next-themes` (for dark mode support)
- **Component Library:** shadcn/ui (Radix UI + Tailwind + Lucide React)
- **Database & Authentication:** Supabase (`@supabase/ssr`, `@supabase/supabase-js`)

## Project Structure
The project uses the Next.js App Router and is structured as follows:

```
medical-app/
├── app/
│   ├── employee/             # Employee/Doctor specific routes
│   │   └── dashboard/        # Doctor dashboard
│   ├── login/                # Authentication page (Login/Signup)
│   ├── patient/              # Patient-specific routes
│   │   ├── dashboard/        # Patient dashboard
│   │   └── onboarding/       # Patient onboarding flow
│   ├── layout.jsx            # Root layout with global Header and Auth logic
│   └── page.jsx              # Landing/Home page
├── components/
│   ├── ui/                   # shadcn/ui components (Button, Card, Input, Tabs, etc.)
│   ├── header.jsx            # Global professional header with Auth buttons
│   └── theme-provider.jsx    # Dark/light mode provider
├── lib/                      # Helper libraries
├── utils/
│   └── supabase/             # Supabase client, server, and middleware utilities
├── middleware.js             # Professional route protection and role-based redirection
└── package.json              # Project dependencies and scripts
```

## Key Features & Architecture

### Authentication & Global Navigation
- **Global Header:** A professional, auth-aware header is integrated into the root layout. It dynamically displays "Sign In" or "Sign Out" based on the user's session, ensuring no "dead-end" pages exist in the application.
- **Role-Based Access Control:**
  - Authenticated users are strictly routed to their respective dashboards (`/patient/dashboard` or `/employee/dashboard`).
  - `middleware.js` ensures that patients cannot access employee areas and vice versa.
  - Sign-up flow now correctly honors the selected role (Doctor/Patient) and redirects accordingly.

### UI & Theming
- The app utilizes a `dark` theme by default via `next-themes` wrapped in `app/layout.jsx`.
- Pre-built accessible components from `shadcn/ui` are heavily utilized (e.g., `Card`, `Tabs`, `Button`, `Input`).
- Styling is implemented via utility classes with Tailwind CSS v4.

### Server Actions
- Authentication actions (`login`, `signup`, `signout`) are implemented using React Server Actions located in files like `app/login/actions.jsx`.

## Current State
The project has the foundational routing, authentication, and basic dashboard views in place. The login page supports choosing between "Patient" and "Doctor" roles during signup. The next development steps likely involve expanding the dashboards and the patient onboarding process.
