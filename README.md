# Scotch Gambit Trainer

A Windows 95-styled chess opening trainer focused on the Scotch Gambit. Built with modern React and TypeScript, following John Ousterhout's "A Philosophy of Software Design" principles for minimal complexity and maximum maintainability.

## 🚀 Features

- **Interactive Chess Board**: Drag-and-drop piece movement with visual feedback
- **Opening Theory Training**: Automated responses based on chess opening databases
- **Windows 95 UI**: Nostalgic interface with period-accurate styling
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Architecture

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Windows 95 design system & Tailwind config
│   └── page.tsx           # Main application page (simplified to ~80 lines)
├── components/            # UI components organized by concern
│   ├── layout/           # Layout-specific components
│   │   ├── BackgroundImage.tsx
│   │   ├── TaskBar.tsx
│   │   └── WindowTitleBar.tsx
│   ├── screens/          # Full-screen state components
│   │   ├── ErrorScreen.tsx
│   │   └── LoadingScreen.tsx
│   └── ui/               # Reusable UI elements
├── constants/            # Centralized configuration
│   └── ui.ts            # All magic numbers, strings, timing values
├── hooks/               # Custom React hooks
│   └── useApplicationState.ts  # Deep state management hook
├── services/            # Business logic layer
│   └── openingService.ts # Data loading and chess opening logic
├── types/               # TypeScript definitions
│   ├── components.ts    # Shared component interfaces
│   └── opening.ts       # Chess opening data structures
└── utils/               # Pure utility functions
    └── opening-parser.ts
```

### Key Architectural Decisions

#### 1. Deep Modules Pattern
- **useApplicationState**: Single hook managing all application state
- **OpeningService**: Encapsulates data loading, parsing, and error handling
- **Screen Components**: Hide UI complexity behind simple interfaces

#### 2. Single Sources of Truth
- **constants/ui.ts**: All magic numbers, dimensions, timing values
- **globals.css**: Complete Windows 95 color palette as CSS custom properties
- **useApplicationState**: Unified state management

#### 3. Tailwind-First CSS Strategy
- CSS custom properties for Windows 95 colors (`--color-primary`, `--color-background`)
- Tailwind utility classes (`bg-primary`, `text-foreground`)
- Minimal custom CSS classes for Windows 95-specific styling

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom Windows 95 design system
- **Animation**: Framer Motion for smooth transitions
- **Chess Logic**: Custom chess move validation and opening tree parsing
- **Validation**: Zod for runtime prop validation
- **State Management**: React hooks with custom abstractions

## 📦 Installation

### Prerequisites

- Node.js 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/scotch-trainer.git
cd scotch-trainer

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

## 🎨 Design System

### Component Styling Approach

1. **Tailwind Utilities**: Primary styling method (`bg-primary`, `text-foreground`)
2. **CSS Custom Properties**: Windows 95 color system integration
3. **Custom Classes**: Minimal, specific to Windows 95 UI elements (`win95-window`, `win95-panel`)

## 🧪 Development

### Code Quality Standards

- **TypeScript**: Strict mode enabled, zero `any` types
- **ESLint**: Extended React and TypeScript rules
- **Architecture**: Following "A Philosophy of Software Design" principles
- **Comments**: JSDoc documentation for all public interfaces


### Testing

```bash
npm run test
```

## 📚 Additional Resources

- [Chess Opening Theory](https://en.wikipedia.org/wiki/Chess_opening)
- [Scotch Gambit](https://en.wikipedia.org/wiki/Scotch_Gambit)
- [A Philosophy of Software Design](https://web.stanford.edu/~ouster/cgi-bin/book.php)
- [Windows 95 Design Guidelines](https://interface.free.fr/Archives/Windows_Guidelines)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- John Ousterhout for "A Philosophy of Software Design"
- Windows 95 design team for the timeless interface
- Lichess database