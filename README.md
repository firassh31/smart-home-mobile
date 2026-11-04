# MSHome Mobile

Expo and React Native companion app for the MSHome web dashboard. It uses the same hosted API and supports parent and child accounts.

## Run locally

```sh
npm install
npx expo start
```

Open the project in Expo Go, an Android emulator, or an iOS simulator. The app uses the hosted MSHome backend configured in `src/services/api.ts`.

## App structure

```text
src/
  app/                  Expo Router routes: entry, login, register, dashboard
  components/           Shared branding and UI controls
  constants/            Shared color and font tokens
  features/
    auth/                Login and registration form
    dashboard/           Device dashboard, cards, editor, controls, confirmation
  providers/             Persisted authentication session
  services/              API client and secure session storage
  types/                 Shared API and device models
```

## Backend behavior

- Login and registration use `/auth/login` and `/auth/register`.
- Device inventory, supported device types, controls, and CRUD operations use the protected `/devices` API.
- Weather is loaded from the server proxy at `/api/weather?city=Haifa`.
- Authentication tokens are stored with Expo SecureStore.
- Parent accounts can manage devices; child accounts see devices shared with them by the backend.
