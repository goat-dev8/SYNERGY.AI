# SynergyAI Frontend

The React frontend for the SynergyAI autonomous DeFi agent platform.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **wagmi + RainbowKit** - Wallet connection
- **React Query** - Data fetching
- **Framer Motion** - Animations

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Build for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3001
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── ui/         # shadcn/ui components
│   └── layout/     # Layout components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and API client
├── pages/          # Page components
├── config/         # App configuration
├── providers/      # React context providers
└── store/          # State management
```

## Pages

| Route        | Description                   |
| ------------ | ----------------------------- |
| `/`          | Landing page                  |
| `/dashboard` | Command center with metrics   |
| `/identity`  | Identity verification         |
| `/agents`    | Agent deployment & management |
| `/activity`  | Transaction history           |
| `/liquidity` | Liquidity pools               |
| `/settings`  | User settings                 |

## Deployment

See main README for deployment instructions with Vercel.
