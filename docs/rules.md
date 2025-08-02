# Ultimate AI Coach - Project Rules & Guidelines

## Project Purpose
This is a rapid prototyping environment for testing AI coaching functionality and different product ideas. The focus is on **speed of iteration** and **testing functionality**, not building production-ready UI from scratch.

## Core Principles

### 1. Use Pre-built Components
- **ALWAYS** use Shadcn UI components when available
- **NEVER** build UI components from scratch if a pre-made solution exists
- Prioritize component libraries, templates, and existing solutions
- Animation libraries (Framer Motion, etc.) are encouraged for polish

### 2. Rapid Prototyping Focus
- Functionality > Perfect UI
- Test ideas quickly
- Iterate based on user feedback
- Don't over-engineer for scale initially

### 3. Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI Library**: Shadcn UI (primary), other component libraries as needed
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **PWA**: next-pwa for progressive web app features
- **Memory**: mem0 for long-term context (Phase B)

## Architecture Overview

### Current Implementation Plan
1. **Phase A**: Basic chat with episode-based context management
   - Anonymous users with optional email upgrade
   - Episode IDs for conversation threading
   - Sliding window context (last N messages)
   - Daily usage quotas

2. **Phase B**: Advanced memory with mem0
   - Automatic summarization when context exceeds limits
   - Long-term memory storage
   - Cross-episode context retrieval

### Database Schema
- `users`: Anonymous + email users (single table)
- `messages`: All chat messages with episode_id
- `episode_summaries`: Compressed conversation summaries
- `daily_turns`: View for rate limiting

## Development Guidelines

### 1. File Organization
```
/app              # Next.js app router pages
/components       # Reusable React components (use Shadcn)
/lib             # Shared utilities and helpers
/hooks           # Custom React hooks
/app/api         # Edge API routes
```

### 2. Component Selection Priority
1. Shadcn UI component exists? → Use it
2. Another library has it? → Use that
3. Can combine existing components? → Do that
4. Only build custom if absolutely necessary

### 3. Styling Approach
- Tailwind CSS for utility classes
- Shadcn UI's theming system
- CSS-in-JS only when necessary for dynamic styles
- Pre-built animations > custom animations

### 4. State Management
- Local state for UI (useState, useReducer)
- Context for cross-component state
- Supabase for persistent data
- localStorage for anonymous user tracking

### 5. Performance Considerations
- Edge functions for API routes
- Minimize bundle size (use dynamic imports)
- PWA for offline capability
- Aggressive caching strategies

## Common Patterns

### Anonymous → Email User Flow
```typescript
// 1. Start anonymous
const uid = ensureAnonUid();

// 2. User decides to save progress
await upgradeToEmail(email, uid);

// 3. Messages automatically migrate
```

### Adding New Features
1. Check if Shadcn has relevant components
2. Search for React libraries that solve the problem
3. Prototype quickly with existing tools
4. Only optimize/customize after validation

### API Route Pattern
```typescript
export const runtime = 'edge';  // Always use edge runtime
// Lean, focused handlers
// One concern per route
```

## Don'ts
- Don't build custom UI components when pre-made exist
- Don't optimize prematurely
- Don't add complex state management early
- Don't focus on pixel-perfect design in prototypes
- Don't implement features not in the current phase

## Quick Start for New Features
1. Define the user flow
2. Find Shadcn/library components that fit
3. Wire up minimal API route
4. Test functionality
5. Polish with animations/transitions from libraries
6. Ship and iterate

## Resources
- [Shadcn UI Docs](https://ui.shadcn.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

## Remember
**Speed wins**. Use what exists. Test with users. Iterate based on feedback.