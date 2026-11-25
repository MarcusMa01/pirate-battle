# ☠️ Pirate Battle

A browser-based naval combat game built with React, TypeScript, and PixiJS 8.

Control your pirate ship, battle enemy vessels, survive incoming attacks, and compete for the highest score.

## Technologies

- React + TypeScript
- PixiJS 8
- TanStack Query
- Axios
- Mock Service Worker (MSW)
- Playwright
- Vite
- GitHub Actions

## Requirements

- Node.js 22
- npm
- A modern browser

## Installation

Clone the repository:

```bash
git clone https://github.com/MarcusMa01/pirate-battle.git
cd pirate-battle
```

Install dependencies:

```bash
npm install
```

## Running the Game

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually `http://localhost:5173`.

## Controls

| Key | Action |
|---|---|
| W | Move forward |
| S | Move backward |
| A | Rotate left |
| D | Rotate right |
| Space | Fire forward |
| Q | Fire left broadside |
| E | Fire right broadside |
| P | Pause or resume |

The game also pauses automatically when the browser loses focus.

## Gameplay

The objective is to survive and destroy enemy ships.

The game features two enemy types:

- **Chaser:** Pursues the player and damages the ship on collision.
- **Shooter:** Attacks the player with projectiles.

Destroying enemies with your weapons increases your score.

A match ends when the timer reaches zero or the player's health reaches zero.

## Game Options

Players can configure:

- Match duration: 60–180 seconds.
- Enemy spawn interval: 2–15 seconds.

Settings are saved in browser localStorage.

## Ranking and Match History

Completed matches are registered through a mocked REST API.

The application includes ranking and match history screens with pagination.

Match records are stored locally in the browser. They are not shared between different browsers or devices.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/matches` | Retrieve match history |
| POST | `/api/matches` | Register a completed match |
| GET | `/api/ranking` | Retrieve ranked match results |

The API is simulated using Mock Service Worker (MSW).

## Automated Testing

The project uses Playwright for end-to-end testing.

Run the tests with:

```bash
npx playwright test
```

Playwright requires a supported browser environment. Automated tests are also executed on Linux through GitHub Actions.

## Production Build

```bash
npm run build
```

The production build is generated in the `dist/` directory.

**Note:** The current mock API is initialized in development mode. Production deployment requires enabling or replacing the mock API.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for details about the project structure, component responsibilities, data flow, and technical decisions.

## Project Status

Browser-based MVP with gameplay, configurable matches, ranking, match history, local persistence, and initial automated tests.

## Author

[MarcusMa01](https://github.com/MarcusMa01)
