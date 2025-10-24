# 3D Modal Frontend

A modern Next.js application featuring 3D modal capabilities with a comprehensive UI component library and authentication system.

## 🚀 Features

- **3D Graphics**: Built with Three.js, React Three Fiber, and React Three Drei for immersive 3D experiences
- **Modern UI**: Comprehensive component library using Radix UI primitives and Tailwind CSS
- **Authentication**: Complete auth system with login/logout functionality
- **Editor**: Advanced editor capabilities for 3D content creation
- **Dashboard**: Analytics and management interface
- **Dark Mode**: Full dark/light theme support
- **TypeScript**: Fully typed codebase for better development experience
- **Responsive Design**: Mobile-first responsive design

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 16.0.0** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety

### 3D Graphics
- **Three.js 0.180.0** - 3D graphics library
- **@react-three/fiber 9.4.0** - React renderer for Three.js
- **@react-three/drei 10.7.6** - Useful helpers for React Three Fiber

### UI Components
- **Radix UI** - Headless UI primitives (comprehensive set)
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Pre-built component library
- **Lucide React** - Icon library
- **Geist Font** - Modern typography

### State Management & Forms
- **Zustand 5.0.8** - Lightweight state management
- **React Hook Form 7.54.1** - Form handling
- **Zod 3.24.1** - Schema validation

### Additional Libraries
- **Next Themes** - Theme switching
- **Sonner** - Toast notifications
- **Recharts** - Data visualization
- **Date-fns** - Date utilities
- **Vercel Analytics** - Performance monitoring

## 📁 Project Structure

```
3d-modal-fe/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── page.tsx             # Home page
│   │   └── settings/            # Settings pages
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── dashboard/           # Dashboard API
│   │   ├── editor/              # Editor API
│   │   └── health/              # Health check
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── middleware.ts            # Next.js middleware
├── components/                  # Reusable components
│   ├── feedback/                # Error/success components
│   ├── layout/                  # Layout components
│   └── ui/                      # UI components (shadcn/ui)
├── features/                    # Feature-based organization
│   ├── auth/                    # Authentication feature
│   │   ├── components/          # Auth components
│   │   ├── hooks/               # Auth hooks
│   │   ├── services/            # Auth services
│   │   ├── types/               # Auth types
│   │   └── utils/               # Auth utilities
│   ├── editor/                  # Editor feature
│   └── home/                    # Home feature
├── config/                      # Configuration files
│   ├── app-config.ts            # App configuration
│   ├── db-config.ts             # Database configuration
│   └── env.ts                   # Environment variables
├── lib/                         # Utility libraries
│   ├── api-client.ts            # API client setup
│   ├── query-client.ts          # React Query client
│   ├── utils.ts                 # Utility functions
│   └── constants.ts             # App constants
├── server/                      # Server-side utilities
│   ├── db/                      # Database connection
│   ├── middlewares/             # Custom middlewares
│   ├── services/                # Server services
│   └── utils/                   # Server utilities
├── styles/                      # Additional stylesheets
├── types/                       # Global TypeScript types
└── hooks/                       # Global React hooks
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 3d-modal-fe
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🎨 UI Components

This project uses shadcn/ui components built on Radix UI primitives. Key components include:

- **Layout**: Sidebar, Navigation, Tabs
- **Forms**: Input, Select, Checkbox, Radio Group
- **Feedback**: Toast, Alert Dialog, Progress
- **Data Display**: Charts, Tables, Cards
- **Overlays**: Dialog, Popover, Tooltip, Dropdown

## 🔐 Authentication

The authentication system includes:

- Login/logout functionality
- Protected routes via middleware
- Auth state management with Zustand
- Form validation with Zod and React Hook Form

## 🎮 3D Features

Built with Three.js ecosystem:

- **React Three Fiber**: Declarative Three.js in React
- **React Three Drei**: Useful helpers and abstractions
- **Three.js**: Core 3D graphics library

## 🎨 Theming

- **Dark/Light Mode**: Automatic theme switching
- **Custom CSS Variables**: Consistent design tokens
- **Tailwind CSS**: Utility-first styling
- **Geist Font**: Modern typography

## 📱 Responsive Design

- Mobile-first approach
- Responsive breakpoints
- Touch-friendly interactions
- Optimized for all screen sizes

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=
DATABASE_URL=
# ... other variables
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:
- Path aliases (`@/*` for root directory)
- Next.js plugin integration
- Strict type checking enabled

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

Built with ❤️ using Next.js, Three.js, and modern web technologies.