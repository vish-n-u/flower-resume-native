# React Native App — Architecture & Developer Reference

## Overview

A mobile companion (iOS + Android) to the existing React + Vite web resume builder. Both apps share the same backend server. The mobile app is built with **Expo SDK 54** and mirrors the core features of the web client — resume CRUD, AI enhancements, template/color customization, and public resume sharing.

---

## Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Expo (managed workflow) | SDK 54 |
| Navigation | expo-router (file-based) | v6 |
| Styling | NativeWind v4 | — |
| State | Redux Toolkit | — |
| Token storage | expo-secure-store | — |
| HTTP | axios | — |
| Rich text editor | react-native-pell-rich-editor | — |
| PDF generation | expo-print | — |
| Resume preview | react-native-webview | — |
| Haptics | expo-haptics | — |
| Image picker | expo-image-picker | — |
| Toasts | react-native-toast-message | — |
| Icons | lucide-react-native | — |

> **Peer dependency note:** `lucide-react-native` declares `react ^18` as a peer dep but the project uses React 19. Any new `expo install` that touches this will fail. Always append `--legacy-peer-deps` when installing packages:
> ```
> npm install <package> --legacy-peer-deps
> ```

---

## Folder Structure

```
react-native/
├── app/                        # expo-router file-based routes
│   ├── _layout.jsx             # Root layout — Redux Provider, bootstrapAuth, Toast, StatusBar
│   ├── (auth)/
│   │   ├── _layout.jsx         # Auth stack (no header)
│   │   └── login.jsx           # Login screen
│   └── (app)/
│       ├── _layout.jsx         # Tab layout — auth guard, tab bar config
│       ├── index.jsx           # Dashboard (resume list)
│       ├── profile.jsx         # Profile & resume defaults
│       ├── applied.jsx         # Hidden (href: null) — not used yet
│       └── builder/
│           └── [resumeId].jsx  # Full-screen resume builder
│
├── components/
│   ├── forms/
│   │   ├── FormField.jsx           # Reusable labeled TextInput
│   │   ├── RichTextInput.jsx       # WYSIWYG editor (pell-rich-editor)
│   │   ├── PersonalInfoForm.jsx
│   │   ├── ProfessionalSummaryForm.jsx
│   │   ├── ExperienceForm.jsx
│   │   ├── EducationForm.jsx
│   │   ├── ProjectForm.jsx
│   │   ├── SkillsForm.jsx
│   │   ├── CertificationsForm.jsx
│   │   └── AchievementsForm.jsx
│   ├── resume/
│   │   └── ResumeWebView.jsx       # WebView-based resume preview
│   └── ui/
│       ├── TemplateSelector.jsx    # Template picker modal
│       └── ColorPicker.jsx         # Accent color picker modal
│
├── configs/
│   └── api.js                  # Axios instance + API_BASE_URL export
│
├── store/
│   ├── index.js                # Redux store
│   └── features/
│       ├── authSlice.js        # Auth state + bootstrapAuth thunk
│       ├── applicationsSlice.js
│       └── jobsSlice.js
│
├── utils/
│   └── storage.js              # expo-secure-store token helpers
│
├── app.json                    # Expo config (bundle IDs, plugins, scheme)
├── babel.config.js             # Babel + module-resolver aliases
├── tailwind.config.js          # NativeWind config
├── metro.config.js
└── global.css                  # NativeWind base import
```

---

## Routing & Navigation

expo-router uses the file system as the route definition. Two route groups:

- `(auth)` — unauthenticated screens (`/login`). No tab bar.
- `(app)` — authenticated screens behind a tab bar.

### Auth Guard
`app/(app)/_layout.jsx` reads `{ token, loading }` from Redux. It waits for `bootstrapAuth` to finish before deciding to redirect:

```js
useEffect(() => {
  if (!loading && !token) router.replace('/(auth)/login')
}, [token, loading])

if (loading || !token) return null  // shows nothing (splash still visible)
```

The `loading` check is critical — without it, the app redirects to login before the persisted token is even read from secure storage.

### Tab Bar
Two visible tabs: **Dashboard** and **Profile**.
- `applied` tab — hidden via `href: null` (stub for future job tracking)
- `builder/[resumeId]` — hidden via `href: null`, navigated to via `router.push`

---

## Authentication

Token is persisted in `expo-secure-store` (encrypted on-device). Flow:

1. **App boot** → `bootstrapAuth` thunk runs in `app/_layout.jsx`
2. Reads token from secure store → hits `/api/users/data` to verify + hydrate `user`
3. On success → dispatches `login({ token, user })` → `(app)` layout allows rendering
4. On failure (expired/invalid) → removes token → `(app)` layout redirects to login

Login page calls `/api/users/login`, gets token back, calls `saveToken(token)` then dispatches `login(...)`.

---

## API

`configs/api.js` exports an axios instance pointed at the production server:

```js
export const API_BASE_URL = "https://resume-builder-dq3j.onrender.com"
```

For local dev, change this to:
- Android emulator: `http://10.0.2.2:4000`
- iOS simulator: `http://localhost:4000`
- Physical device: `http://<your-machine-ip>:4000`

All authenticated requests pass the token manually in headers:
```js
api.get('/api/resumes/get/' + resumeId, { headers: { Authorization: token } })
```

---

## State Management

Redux Toolkit with a single store. Active slices:

| Slice | Purpose |
|---|---|
| `authSlice` | `token`, `user`, `loading` — the only slice actively used |
| `applicationsSlice` | Stub — not connected to UI yet |
| `jobsSlice` | Stub — not connected to UI yet |

---

## Resume Builder (`builder/[resumeId].jsx`)

The most complex screen. Key features:

### Auto-save
On any `resumeData` state change, a 3-second debounced save fires:
```js
formData.append('resumeId', resumeId)
formData.append('resumeData', JSON.stringify(resumeData))
api.put('/api/resumes/update', formData, { headers: { ..., 'Content-Type': 'multipart/form-data' } })
```

### Section Tabs
8 sections: Personal, Summary, Experience, Education, Projects, Skills, Certs, Awards. Each maps to a form component. A visibility toggle bar appears below the tab bar for sections that support hide/show.

### AI Features (FAB)
A purple Sparkles FAB in the bottom-right expands to:
- **AI Prompt** → `POST /api/ai/custom-prompt` with `{ userPrompt, currentResumeData }`
- **Job Needs** → `POST /api/ai/extract-job-requirements` with `{ jobDescription }`

### Preview Modal
Opens `ResumeWebView` loading the public share URL `/view/:resumeId`. **Known limitation**: only works for resumes marked `public: true`. Private resumes return 404 from the public endpoint.

### PDF Download
Captures the WebView's HTML via `postMessage`, passes it to `expo-print`, then shares via `expo-sharing`.

### Public/Private Toggle
Globe/Lock icon in header. Calls `PUT /api/resumes/update` with `{ public: newValue }`.

---

## Form Field Names (Critical)

All form components use **snake_case** to match the server's MongoDB schema exactly. Do not change these to camelCase.

| Field | Correct key |
|---|---|
| Full name | `personal_info.full_name` |
| Job title | `personal_info.profession` |
| Profile image | `personal_info.image` |
| Professional summary | `professional_summary` |
| Job position | `experience[].position` |
| Start date | `experience[].start_date` |
| End date | `experience[].end_date` |
| Currently working | `experience[].is_current` |
| Field of study | `education[].field_of_study` |
| Project list | `project` (not `projects`) |
| Tech stack | `project[].tech_stack` |
| Credential ID | `certifications[].credential_id` |
| Accent color | `accent_color` |

---

## Rich Text Editor (`RichTextInput.jsx`)

Wraps `react-native-pell-rich-editor`. Used for description fields in Experience, Projects, and Professional Summary. Stores and emits **HTML strings** (e.g. `<p>text</p>`, `<ul><li>...</li></ul>`) — the same format the web app's Quill editor produces. This ensures resume previews render correctly in both the web and mobile templates.

Toolbar actions: Bold, Italic, Bullet list, Ordered list, Undo, Redo.

---

## Resume Preview (`ResumeWebView.jsx`)

Loads `${API_BASE_URL}/view/${resumeId}` in a `react-native-webview`. Token is injected via `injectedJavaScriptBeforeContentLoaded` so it's available before the page's React code runs. Also exposes a `captureHTML()` method via `forwardRef` / `useImperativeHandle` for PDF capture.

---

## Brand Colors

The app uses **amber** (`#f59e0b`) as the primary brand color, not indigo. The web client uses indigo — this is intentional divergence for the mobile app.

| Usage | Color |
|---|---|
| Primary buttons, CTAs | `#f59e0b` (amber) |
| Active tab indicator | `#f59e0b` (amber) |
| Loading spinners | `#f59e0b` (amber) |
| AI / FAB button | `#8b5cf6` (purple) |
| Success / public indicator | `#10b981` (green) |

---

## Module Aliases

Configured in `babel.config.js` via `babel-plugin-module-resolver`:

| Alias | Resolves to |
|---|---|
| `@` | `./` |
| `@components` | `./components` |
| `@store` | `./store` |
| `@configs` | `./configs` |
| `@utils` | `./utils` |

---

## Key Differences from the Web Client (`client/`)

| Aspect | Web Client | React Native App |
|---|---|---|
| Framework | React + Vite | Expo SDK 54 (React Native) |
| Routing | React Router DOM | expo-router (file-based) |
| Styling | Tailwind CSS v4 | NativeWind v4 |
| Auth storage | `localStorage` (token key: `"token"`) | `expo-secure-store` |
| Auth header | Sent via axios interceptor automatically | Passed manually per-request |
| Rich text | Quill editor | react-native-pell-rich-editor |
| Resume preview | Rendered React components (JSX templates) | WebView loading the web app's `/view/:resumeId` |
| PDF export | Browser `window.print()` | expo-print + expo-sharing |
| Template rendering | ClassicTemplate, ModernTemplate, etc. (JSX) | Delegated to WebView (loads web app URL) |
| Primary color | Indigo (`#4f46e5`) | Amber (`#f59e0b`) |
| Image upload | `<input type="file">` | expo-image-picker |
| Toast library | react-hot-toast | react-native-toast-message |
| No web-only APIs | — | No `window`, `document`, `localStorage` in RN scope |

---

## Screens Summary

### Login (`(auth)/login.jsx`)
Email + password. Calls `POST /api/users/login`. Saves token to secure store. Dispatches `login` action.

### Dashboard (`(app)/index.jsx`)
FlatList of resume cards (2-column grid). Pull-to-refresh. Long-press on a card shows a bottom sheet (Rename / Delete). Blank resume creation via `POST /api/resumes/create`. All cards navigate to `builder/[resumeId]`.

### Profile (`(app)/profile.jsx`)
Two pill tabs: **Account** (name, email, password) and **Resume Defaults** (pre-fills all new resumes). Amber avatar with user initials. Saves to `/api/users/update` and `/api/users/update-detailed-resume`.

### Resume Builder (`(app)/builder/[resumeId].jsx`)
See detailed section above.

---

## What's Not Implemented Yet

- **Job Feed** — `jobsSlice` exists but no screen
- **Applied tracker** — `applicationsSlice` exists, `applied.jsx` is a stub
- **Resume preview for private resumes** — preview WebView only works when resume is set to public
- **Offline support** — no caching layer
