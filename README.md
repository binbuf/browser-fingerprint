# Browser Fingerprint

A visualization tool to explore and analyze browser fingerprinting techniques.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.12.0 or higher; v22.x recommended)
- [pnpm](https://pnpm.io/) (v10.33.0 or later)

```bash
    node -v 

    # if not latest LTS
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
    source ~/.bashrc
    nvm install --lts
    nvm use --lts
```

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd browser-fingerprint
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Start the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:5173`.

## Build for Production

To create an optimized production build:
```bash
pnpm build
```
You can preview the production build locally with:
```bash
pnpm preview
```

## Deployment

The app is hosted on GitHub Pages at:
**https://binbuf.github.io/browser-fingerprint/**

### Automatic deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds the app and publishes the `dist/` folder to the `gh-pages` branch automatically.

### Manual deployment

```bash
pnpm deploy
```

This builds the project and force-pushes `dist/` to the `gh-pages` branch.

## Other Commands

- **Run unit tests:** `pnpm test`
- **Run E2E tests:** `pnpm test:e2e`
- **Lint code:** `pnpm lint`
- **Format code:** `pnpm format`
- **Type check:** `pnpm check`

## Project Structure

- `src/collectors/`: Browser fingerprinting data collection modules.
- `src/ui/`: Svelte components and stores.
- `src/engine/`: Core logic for hashing, scoring, and matching.
- `src/persistence/`: Data storage (IndexedDB and LocalStorage).
- `src/utils/`: Helper utilities.
- `tests/`: Unit and E2E tests.
