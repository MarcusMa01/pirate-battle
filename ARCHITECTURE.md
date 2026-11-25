# Pirate Battle — Architecture

## 1. Project Overview

Pirate Battle is a browser-based naval combat game developed with React, TypeScript, and PixiJS.

The project separates the user interface, game rendering, API communication, and mock backend.

## 2. Technology Stack

- **React:** Application interface, menus, options, ranking, and match history.
- **TypeScript:** Static typing and improved code reliability.
- **PixiJS 8:** Game arena, ships, projectiles, collisions, and visual effects.
- **TanStack Query:** Server-state management, queries, mutations, and cache invalidation.
- **Axios:** HTTP communication with the REST API.
- **Mock Service Worker (MSW):** Simulated REST endpoints for match registration, ranking, and history.
- **Playwright:** Automated end-to-end testing.
- **GitHub Actions:** Continuous integration and automated test execution.

## 3. Application Structure

```text
src/
├── api/
│   └── matches.ts
├── mocks/
│   ├── browser.ts
│   └── handlers.ts
├── App.tsx
├── Game.tsx
├── App.css
└── main.tsx

tests/
└── game.spec.ts
```

## 4. Main Components

### App.tsx

Responsible for application navigation, game configuration, ranking, match history, and match registration.

### Game.tsx

Responsible for game initialization, rendering, movement, combat mechanics, collision detection, scoring, health, timing, and match completion.

### api/matches.ts

Provides typed HTTP functions for registering matches and retrieving ranking and match history.

### mocks/handlers.ts

Defines the mocked REST API endpoints and stores match records in browser localStorage.

## 5. Data Flow

1. The player configures and starts a match through React.
2. React passes the match configuration to the game component.
3. PixiJS renders and updates the game world.
4. When a match ends, the game returns the result to React.
5. React stores the latest completed match in localStorage.
6. Axios sends the result to the mocked REST API.
7. MSW processes the request and stores the match record.
8. TanStack Query invalidates the relevant caches so ranking and history can refresh.

## 6. Persistence

The application uses browser localStorage to preserve game settings, the last completed match, and match records.

The mocked backend does not use an external database. Records are local to the browser and are not shared between devices.

## 7. Testing and Continuous Integration

Playwright provides end-to-end tests for application navigation and interface behavior.

GitHub Actions runs the automated test workflow on Linux, installing dependencies, building the application, and executing the Playwright tests.

## 8. Architectural Considerations

The current implementation is a browser-based MVP.

The mocked REST API allows frontend development and testing without a dedicated backend service.

Future improvements may include a persistent backend database, multiplayer functionality, expanded mobile controls, and additional automated gameplay tests.
