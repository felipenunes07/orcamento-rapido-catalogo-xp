# Project Context for Qwen Code

## Project Overview

This is a React-based web application built with Vite, TypeScript, and shadcn/ui components. The application is called "Catálogo XP Orçamento" and serves as an interactive product catalog for generating quick quotes.

The main purpose of the application is to:
1. Display a product catalog loaded from a Google Spreadsheet
2. Allow users to select products and add them to a cart
3. Generate and export quotes in PDF and Excel formats
4. Share quotes via WhatsApp
5. Function as a Progressive Web App (PWA)

## Technologies Used

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Context API and TanStack Query
- **Data Source**: Google Spreadsheet (CSV export)
- **Backend**: Supabase for storage and database
- **PDF Generation**: @react-pdf/renderer
- **Excel Export**: xlsx library
- **UI Components**: Radix UI, Lucide React icons

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── catalog/         # Catalog-specific components
│   ├── layout/          # Layout components
│   ├── quote/           # Quote-related components
│   └── ui/              # shadcn/ui components
├── context/             # React context providers
├── hooks/               # Custom React hooks
├── integrations/        # Third-party service integrations (Supabase)
├── lib/                 # Utility libraries
├── pages/               # Page components
├── services/            # Business logic and API services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
│   └── pdf/             # PDF generation utilities
└── App.tsx              # Main application component
```

## Key Features

### Product Catalog
- Loads products from a Google Spreadsheet via CSV export
- Provides filtering by brand and quality
- Supports search functionality
- Displays products in a grid layout

### Shopping Cart
- Managed via React Context
- Persists in localStorage
- Special handling for "DOC DE CARGA" products (quantities adjusted to multiples of 5)

### Quote Generation
- Generates PDF quotes using @react-pdf/renderer
- Exports quotes to Excel format
- Saves quotes to Supabase database with fallback to localStorage
- Uploads Excel files to Supabase Storage

### Sharing
- Share quotes via WhatsApp with automatic formatting
- Generates shareable links for Excel files

### Responsive Design
- Mobile-friendly interface
- PWA support with offline capabilities

## Development Setup

### Prerequisites
- Node.js (latest LTS version recommended)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# or
npm start
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Configuration Files

### Environment Configuration
- `.env` files for environment variables
- `vite.config.ts` for Vite configuration
- `tailwind.config.ts` for Tailwind CSS configuration
- `components.json` for shadcn/ui configuration

### Deployment
- `vercel.json` for Vercel deployment configuration
- `manifest.json` for PWA configuration

## Data Flow

1. **Product Loading**: 
   - Fetches CSV data from Google Spreadsheet
   - Parses and normalizes product data
   - Extracts brands and qualities for filtering

2. **Cart Management**:
   - Uses React Context for global state
   - Persists to localStorage
   - Handles special product types (DOC DE CARGA)

3. **Quote Generation**:
   - Saves to Supabase with localStorage fallback
   - Generates PDF and Excel files
   - Uploads Excel to Supabase Storage

4. **Sharing**:
   - Creates WhatsApp messages with quote details
   - Provides shareable links for Excel files

## Key Components

### Main Pages
- `HomePage`: Entry point with welcome message
- `CatalogPage`: Main product catalog with filtering
- `QuoteSummaryPage`: Review and export quotes
- `ThankYouPage`: Confirmation after quote generation

### Core Services
- `sheetService.ts`: Loads products from Google Spreadsheet
- `quoteService.ts`: Manages quote saving and retrieval
- `exportFunctions.tsx`: Handles PDF and Excel export

### Utilities
- `formatters.ts`: Currency and date formatting
- `pdf/`: PDF generation components and utilities

## Supabase Integration

The application uses Supabase for:
- Storing generated quotes
- Hosting Excel files in storage
- Providing backup when localStorage is unavailable

Configuration is in `src/integrations/supabase/client.ts`

## PWA Features

- Service worker registration in `main.tsx`
- Manifest file for installation
- Offline capabilities
- Mobile-friendly interface

## Custom Components

### Chat Widget
- Custom-built chat assistant on the homepage
- Connects to external webhook for responses
- Only visible on the homepage

### UI Components
- Uses shadcn/ui components with Radix UI primitives
- Custom styling with Tailwind CSS
- Responsive design for all screen sizes

## Brand-Specific Logic

The application has special handling for:
- Brand detection from product models
- Custom brand ordering in filters
- Quality descriptions with popover information
- DOC DE CARGA products with quantity adjustments

## Error Handling

- Graceful fallbacks for Supabase failures
- Retry mechanisms for product loading
- User-friendly error messages
- Toast notifications for user feedback

## Testing

The application includes:
- TypeScript for type safety
- ESLint for code quality
- No explicit testing framework configured

## Deployment

The application is configured for:
- Vercel deployment
- PWA capabilities
- Static file serving
- Client-side routing