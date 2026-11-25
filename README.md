# ☠️ Pirate Battle

A browser-based naval combat game built with React, TypeScript, and PixiJS 8.

Control your pirate ship, battle enemy vessels, survive incoming attacks, and compete for the highest score.

## Live Demo

[Play Pirate Battle](https://pirate-battle-mauve.vercel.app/)

[GitHub Repository](https://github.com/MarcusMa01/pirate-battle)

## Technologies

- React + TypeScript
- PixiJS 8
- TanStack Query
- Axios
- Mock Service Worker (MSW)
- Playwright
- Vite
- GitHub Actions
- Vercel

## Requirements

- Node.js 22
- npm
- A modern browser with JavaScript enabled

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

Open the local URL displayed in the terminal, usually:

[http://localhost:5173](http://localhost:5173)

## Controls

### Desktop — Keyboard

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

### Mobile — Touch Controls

The game includes on-screen controls for mobile devices.

| Button | Action |
|---|---|
| ▲ | Move forward |
| ▼ | Move backward |
| Left rotation | Rotate left |
| Right rotation | Rotate right |
| FIRE | Fire forward |
| LEFT | Fire left broadside |
| RIGHT | Fire right broadside |

The mobile layout adapts to different screen sizes. Portrait orientation has been visually tested using an iPhone 14 Pro Max viewport (430 × 932).

The game arena, HUD, and touch controls remain accessible on the tested portrait layout.

## Gameplay

The objective is to survive enemy attacks and destroy enemy ships.

The game features two enemy types:

- **Chaser:** Pursues the player and damages the ship on collision.
- **Shooter:** Attacks the player with projectiles.

Destroying enemies with the player's weapons increases the score.

The game includes:

- Ship movement and rotation
- Forward cannon fire
- Left and right broadside attacks
- Enemy spawning
- Collision detection
- Player health
- Score tracking
- Match timer
- Pause and resume
- End-of-match results
- Restart and return-to-menu options

A match ends when the timer reaches zero or the player's health reaches zero.

## Game Options

Players can configure:

- Match duration: 60–180 seconds
- Enemy spawn interval: 2–15 seconds

Settings are saved in browser localStorage.

## Ranking and Match History

Completed matches are registered through a mocked REST API.

The application includes:

- Ranking ordered by score
- Match history
- Pagination
- Player identification
- Match duration
- Match result information

**Important:** Match records are stored locally in the browser. They are not shared between different browsers, devices, or users.

The application does not currently use a centralized production database.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/matches` | Retrieve match history |
| POST | `/api/matches` | Register a completed match |
| GET | `/api/ranking` | Retrieve ranked match results |

The API is simulated using Mock Service Worker (MSW).

### API Behavior

MSW intercepts application requests and returns mocked REST responses.

The application uses Axios for HTTP communication and TanStack Query for server-state management.

The mocked API is enabled in both development and the deployed production build.

Because match data is stored locally, clearing browser storage can remove previously saved results.

## Automated Testing

The project uses Playwright for end-to-end testing.

Run the tests with:

```bash
npx playwright test
```

Playwright requires a supported browser environment.

Automated tests are also executed on Linux through GitHub Actions.

The latest verified GitHub Actions execution completed successfully for commit `d5a1f82`.

[GitHub Repository](https://github.com/MarcusMa01/pirate-battle)

## Production Build

Generate the production build with:

```bash
npm run build
```

The production files are generated in the `dist/` directory.

The project is deployed to Vercel:

[Play Pirate Battle](https://pirate-battle-mauve.vercel.app/)

The production deployment uses the MSW mock API, so no external API server is required for the current MVP.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for information about:

- Project structure
- React component responsibilities
- PixiJS game rendering
- Application state and data flow
- Axios and TanStack Query integration
- MSW API simulation
- Technical decisions

## Known Limitations

- Ranking and match history are browser-local, not globally shared.
- Performance targets have not yet been documented with complete profiling evidence.
- Mobile behavior should also be validated on physical devices.
- The current version is an MVP rather than a full multiplayer game.

## Project Status

Playable browser-based MVP featuring naval combat, configurable matches, mobile touch controls, ranking, match history, local persistence, automated tests, and public deployment.

## Author

[MarcusMa01](https://github.com/MarcusMa01)
