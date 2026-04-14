# AI_BASED_BUG_DETECTAOR

Lightweight overview and instructions for the AI-Based Bug Detector project.

## Project

AI_BASED_BUG_DETECTAOR is a modular system that provides automated bug detection and analysis across multiple services. The workspace contains backend services (NestJS), frontend (Next.js), and supporting AI orchestration components.

## Key folders

- `backend/` — NestJS microservices and APIs.
- `frontend/` — Next.js application and UI components.
- `Asset-Manager/` — auxiliary asset manager and libraries.
- `docs/` — design and documentation artifacts.

## Features

- Static and dynamic analysis orchestration
- Modular microservices for analysis, chat, auth, notifications
- Frontend UI for visualizing scan results

## Quickstart (development)

Prerequisites: Node.js (LTS), pnpm or npm, Python for AI orchestration components.

1. Clone the repo:

```bash
git clone <your-repo-url>
cd AI_BASED_BUG_DETECTAOR
```

2. Install dependencies (example using pnpm in subprojects):

```bash
cd Asset-Manager/Asset-Manager
pnpm install
cd ../../frontend
pnpm install
cd ../backend
pnpm install
```

3. Create local environment files (do NOT commit):

```bash
cp .env.example .env
# edit .env with local values
```

4. Start services per their README files (see `backend/` and `frontend/`).

## Git / Security notes

- The repository includes a top-level `.gitignore` that already ignores `node_modules/` and `.env` files. Do not commit secrets or `.env` files.
- To push to GitHub, add a remote and push the `main` branch:

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git branch -M main
git push -u origin main
```

## Contributing

Please follow these guidelines:

- Open an issue for feature requests or bugs.
- Create a branch per feature: `feature/your-short-name`.
- Make small, focused commits and open a pull request.

## License

Specify your license (e.g., MIT). Add a `LICENSE` file at project root.

## Contact

Project maintainers and contact details can be added here.
