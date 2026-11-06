# MSHome Mobile

Expo and React Native companion app for the MSHome web dashboard. It uses the same hosted API (Render) and supports parent and child accounts with SMS phone verification.

## Run locally

```sh
npm install
npx expo start
```

Open the project in Expo Go, an Android emulator, or an iOS simulator. The app uses the hosted MSHome backend configured in `src/services/api.ts`.

## Auth flow

1. **Register** with username, email, phone number (international format, e.g. `+972501234567`), and password.
2. **Verify phone** on the OTP screen: a 6-digit SMS code with auto-submit and a 60-second resend timer. The JWT session is saved (expo-secure-store) only after the code is confirmed.
3. **Login** with username, **email, or phone number** + password.

In development the backend prints the OTP to its console / Render logs instead of sending a real SMS (Twilio credentials not configured).

## App structure

```text
src/
  app/                  Expo Router routes: entry, login, register, verify-otp, dashboard
  components/           Shared branding and UI controls (Button, TextField, chips, toast)
  constants/            Shared color and font tokens
  features/
    auth/               AuthForm (login + registration), OtpForm (6-digit SMS code)
    dashboard/          Device dashboard, cards, editor, controls, delete confirmation
  providers/            AuthProvider: session state + login/register/verify actions
  services/             api.ts (typed API client), session-storage.ts (SecureStore)
  types/                Shared API and device models
```

## Backend behavior

- Registration and login use `/auth/register` and `/auth/login` (identifier = username/email/phone).
- Phone verification uses `/auth/send-otp` and `/auth/verify-otp`; codes are hashed server-side, expire after 10 minutes, and allow 5 attempts.
- Device inventory, supported device types, controls, and CRUD operations use the protected `/devices` API.
- Weather is loaded from the server proxy at `/api/weather?city=Haifa`.
- Authentication tokens are stored with Expo SecureStore (localStorage on web).
- Parent accounts manage devices and share a family invite code; child accounts see devices shared with them by the backend.

## Checks

```sh
npx expo lint      # lint
npx tsc --noEmit   # typecheck
```
