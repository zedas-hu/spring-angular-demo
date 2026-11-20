# Chinook Database Demo

A full-stack demo application built with Angular and Spring Boot, using the [Chinook sample database](https://www.sqlitetutorial.net/sqlite-sample-database/) in SQLite. It demonstrates common frontend and backend development techniques through a music catalog for browsing tracks and albums.

## What this project demonstrates

### Angular frontend

- A feature-oriented Angular application with standalone components and lazy-loaded routes.
- Reactive UI state with signals, computed values, and Angular resources.
- Signal-based forms with client-side validation for creating albums and tracks.
- Runtime language switching between English and Hungarian. The selected language is saved in browser storage.
- Light and dark themes, also saved in browser storage.
- Track search across track, album, and artist names.
- Server-side pagination (10 tracks per page) and sorting by track, album, artist, genre, composer, or media type.
- Album browsing and details, plus localized validation and API error messages.

### Spring backend

- REST endpoints backed by Spring Data JPA and SQLite.
- Request and response DTOs, MapStruct mappings, and bean/business-rule validation.
- Server-side pagination, sorting, and filtering for the track catalog.
- Transactional operations for creating and deleting catalog data.
- HTTP session handling and an interceptor that guards data-changing requests.
- Backend tests for controllers, mapping, validation, and session handling.

## Data model in scope

This demo focuses on the following six Chinook tables:

| Table | Role in the application |
| --- | --- |
| `tracks` | The catalog's songs, including their album, genre, media type, composer, duration, and price. |
| `albums` | Album titles and their artist; albums contain tracks. |
| `artists` | Artist names associated with albums. |
| `genres` | Genre labels associated with tracks. |
| `media_types` | Media format labels associated with tracks. |
| `employees` | Employee records used as the available identities in the demo sign-in flow. |

Other tables in the full Chinook database are outside the scope of this README.

## Sign-in and write access

You must sign in to create an album, create or edit a track, or delete an album or track. The backend checks the session for data-changing requests.

Sign-in is **symbolic and for demonstration only**: choose an employee from the list; no password is requested. This is not real authentication and must not be treated as production security.

## Run locally

Requirements: Java 27, Maven, and Node.js/npm. The database file is `database/data/chinook.db`.

From the repository root, install the npm workspace dependencies:

```bash
npm install
```

Set the database URL and start both the Spring backend and Angular development server. In PowerShell:

```powershell
$env:DB_URL = "jdbc:sqlite:database/data/chinook.db"
npm run dev
```

On macOS/Linux, use:

```bash
export DB_URL=jdbc:sqlite:database/data/chinook.db
npm run dev
```

Open the frontend at [http://localhost:4200](http://localhost:4200). Its development proxy forwards `/api` requests to the backend on port `8080`.

## Run with Docker Compose

From the repository root:

```bash
docker compose up --build
```

The application is available at [http://localhost:8080](http://localhost:8080). Compose mounts `database/data` into the backend container and configures the SQLite database URL.

## Tests

Run the frontend tests with:

```bash
npm test --workspace frontend
```

Run the backend tests with `DB_URL` set as shown above:

```bash
mvn -f backend/pom.xml test
```

## Main technologies

- **Frontend:** Angular 22, TypeScript, Signal Forms
- **Backend:** Java 27, Spring Boot 4, Spring Data JPA, MapStruct
- **Database:** SQLite
