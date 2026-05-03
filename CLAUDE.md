# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server (Vite)
pnpm build      # TypeScript check + production build
pnpm preview    # Preview production build locally
```

No test runner is configured.

## Architecture

**Infinity** is a Minecraft server web platform. The UI is in Russian.

### State and routing

`App.tsx` is the single stateful root. It owns `user: User | null` and `theme: 'dark' | 'light'`, and is the only component that calls React Router hooks directly (`useNavigate`, `useLocation`). All other components receive navigation as a `setPage: Navigate` callback prop (a function `(pageId: PageId) => void`), keeping router logic centralized.

Route definitions live in `src/routes.ts`. `PAGE_PATHS` maps `PageId → URL string`; `pageFromPath` maps URL → `PageId`. Pages: `main` (`/`), `launcher` (`/launcher`), `login`, `register`, `pa` (`/account/profile`).

### Theming

Dark/light theme is toggled by setting `data-theme="light"` on `<html>`. All colors are CSS custom properties defined in `src/styles/global.css`. Core brand colors: `--cyan: #25c3e8`, `--purple: #5625e8`. Light-mode overrides the same variables. Utility classes `.grad-text` and `.glass` are defined globally.

### Component structure

- `src/components/ui/` — primitive UI atoms: `Button`, `Card`, `Badge`, `FormField`. Each has its own CSS Module.
- `src/components/` — feature-level components: `Header`, `AuthShell`, `FadeIn`, `FeatureCard`, `HeroBg`, `HeroVisual`, `InfinityLogo`.
- `src/pages/` — full page components. Pages receive `setPage`, `user`, and `setUser` as needed.

### Styling convention

CSS Modules (`.module.css`) per component. Global keyframes (`hero-in`, `fade-up`, `orb-drift`, `shimmer`, etc.) are in `src/styles/global.css` and referenced from component CSS files.

### Data

`src/data/account.ts` holds static mock arrays (`SKINS`, `ACHIEVEMENTS`, `ACTIVITY`) used by the account page. Auth is simulated — login/register write to the `user` state directly with no real backend.

### Types

All shared types are in `src/types.ts`: `PageId`, `Theme`, `HeroVariant`, `User`, `Navigate` (alias for the `setPage` callback), `SetUser`, `TweakValues`.
