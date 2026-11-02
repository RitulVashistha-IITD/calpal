```
# CalPal

A calorie, workout and weight tracker with a heart. It has a coach who cheers you on, a maths-powered craving optimizer, and a daily budget built around your body and your goal date.

**Live app:** https://calpal-038y.onrender.com

It runs on free hosting, so the first load after a quiet spell can take about a minute while the server wakes up. You can install it on your phone's home screen like an app (it's a PWA).

## What it does

- **Day-by-day tracking.** Log meals, treats and workouts for any day. A progress ring shows how many calories you have left, and the totals update as you add, edit or delete entries. Deleting is instant, with an Undo toast.
- **Calorie estimates.** Type a food or activity and CalPal suggests a typical calorie count with a serving size. You can always change it.
- **Craving optimizer.** Pick the foods you're tempted by and a calorie budget, and it finds the combination with the most "joy" that fits. See [how it works](#craving-optimizer-bounded-knapsack).
- **A goal that does the maths.** Set a target weight, a date and what it's for. CalPal suggests a daily budget for your body and timeline, and always shows you the safe option next to the number your date would really need.
- **Body stats and BMI.** Height, weight, age, sex and daily activity. BMI is calculated for you now and at your target, with the healthy weight range for your height.
- **Weight forecast.** Based on what you actually eat and burn, it estimates your weight on your date and when you'd reach your target.
- **Weigh-in reminders.** Daily, weekly or never. They show up when you open the app.
- **A coach.** Choose Irene, Samay or Jamey and a skin tone. The coach reacts to your day and sends a note about whatever you're working towards.
- **Welcome flow.** New accounts get a three-step setup (about you, your goal, your coach) that you can go back through or skip.
- **Multiple users.** Every account only ever sees its own data. You can delete your account, which needs your password.
- **Installable.** It works as a PWA with its own icon, and opens full screen on phones.

## How it works

### Craving optimizer (bounded knapsack)

You have a calorie budget `W` and a list of foods, each with calories and a joy score from 1 to 10. Each food can be picked at most `k` times. The goal is the most total joy that doesn't go over the budget.

Each food is expanded into `k` separate copies, which turns it into a classic 0/1 knapsack solved with dynamic programming:

```
dp[i][w] = best joy using the first i items with w calories of room
dp[i][w] = max( dp[i-1][w],                    // skip item i
                dp[i-1][w - cal_i] + joy_i )   // take item i
```

The chosen items are recovered by walking the table backwards. It runs in O(n · W) time and is a pure function in `server/src/services/knapsack.ts`. The unit tests include a case where the greedy "best joy per calorie first" approach gives the wrong answer and the DP gets it right.

### Daily budget suggestion

1. Estimate resting burn with the Mifflin-St Jeor formula, then multiply by a lifestyle factor that does **not** count logged workouts (those are added on top, so nothing is counted twice).
2. Work out the weekly pace needed to reach the target weight by the date.
3. Cap the pace at the smaller of 1 kg a week or 1% of body weight when losing, and 0.5 kg a week when gaining.
4. Never suggest less than 1,200 kcal (female), 1,500 (male) or 1,350 (prefer not to say), and never below resting burn.
5. If the date needs more than the safe pace, show both: the safe suggestion first, then the exact number the date would require, with an encouragement to take the safe plan.

### Weight forecast

It uses the last 7 completed days (today is left out because it's unfinished). A day with no food logged counts as missing, not as zero calories, and at least 3 logged days are needed. It simulates day by day at about 7,700 kcal per kg, re-estimating burn as weight changes. It warns about very fast paces, intake below resting burn, and weigh-ins that have gone stale.

### AI calorie estimates

The server asks the Gemini API for the typical calories in one serving (or burned in 30 minutes for a workout), using structured JSON output. The reply is validated with Zod before it's used. Results are cached, a busy upstream gets one retry, and the endpoint has its own rate limit. The API key never reaches the browser.

## Tech stack

| Part | Tools |
|---|---|
| Client | React, TypeScript, Vite, Tailwind CSS v4, React Router |
| PWA | `vite-plugin-pwa` (Workbox service worker, web manifest) |
| Server | Node.js, Express 5, TypeScript |
| Validation | Zod, on the client and the server |
| Database | MongoDB (Atlas free tier) with Mongoose |
| Auth and security | bcrypt password hashing, JWT, helmet, rate limiting |
| AI | Google Gemini API |
| Tests | Vitest |
| Hosting | Render (one free web service) and MongoDB Atlas |

## Project structure

```
calpal/
├── client/                React app (Vite)
│   ├── public/            PWA icons
│   └── src/
│       ├── api/           fetch wrapper and shared types
│       ├── components/    cards, forms, coach, layout
│       ├── context/       auth state
│       └── pages/         Today, History, Plan, Learn, Profile, Welcome, Login
└── server/                Express API
    └── src/
        ├── config/        environment parsing (fails fast if misconfigured)
        ├── routes/        URL to controller wiring
        ├── middleware/    auth, validation, rate limits, central error handler
        ├── controllers/   HTTP in and out
        ├── services/      business logic (budget, forecast, optimizer, AI)
        ├── models/        Mongoose schemas
        ├── schemas/       Zod request schemas
        └── scripts/       seed script for the starter foods
```

A request flows through route, middleware (auth, validation), controller, service and model. Errors from any layer go through one central handler, which returns a consistent JSON shape.

## Getting started

**You'll need** Node.js 20 or newer (Vite 8 needs 20.19+ or 22.12+) and a MongoDB database. A free [Atlas](https://www.mongodb.com/atlas) cluster works well.

```bash
git clone https://github.com/RitulVashistha-IITD/calpal.git
cd calpal

# Server
cd server
npm install
cp .env.example .env          # then fill in the values below
npx tsx src/scripts/seed.ts   # loads the shared starter foods
npm run dev                   # http://localhost:4000

# Client (in a second terminal)
cd client
npm install
npm run dev                   # http://localhost:5173
```

In development the client's dev server forwards `/api` calls to the Express server on port 4000.

### Environment variables (`server/.env`)

| Variable | Notes |
|---|---|
| `MONGODB_URI` | Required. Your MongoDB connection string, ending in `/calpal?retryWrites=true&w=majority` |
| `JWT_SECRET` | Required. At least 32 characters. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `GEMINI_API_KEY` | Optional. Without it, calorie estimates are switched off and everything else works |
| `GEMINI_MODEL` | Optional. A Gemini Flash model name (default `gemini-3.5-flash`). Model names change, so check which ones your key can use |
| `PORT` | Optional. Defaults to 4000 (hosting platforms set it for you) |

Never commit `.env`. It's already in `.gitignore`.

### Tests

```bash
cd server
npx vitest run
```

## Deployment

CalPal deploys as **one** web service: the Express server also serves the built React app, so there is a single URL and no cross-origin setup.

On [Render](https://render.com), create a web service from this repo with:

| Setting | Value |
|---|---|
| Build command | `npm --prefix client ci --include=dev && npm --prefix client run build && npm --prefix server ci --include=dev && npm --prefix server run build` |
| Start command | `npm --prefix server start` |
| Health check path | `/api/health` |
| Environment | `NODE_VERSION=22`, `MONGODB_URI`, `JWT_SECRET`, plus the Gemini variables if you use them |

Use a new `JWT_SECRET` for production, not your development one. Render's free services don't have a fixed IP address, so the Atlas network access list has to allow `0.0.0.0/0`. That makes your database password the main protection, so use a long random password and a database user limited to `readWrite` on the `calpal` database.

To try the production build locally, run `npm run build` in `client`, then start the server and open `http://localhost:4000`.

## API overview

All routes need a login token except register, login and health.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | Create an account or log in, returns a token |
| DELETE | `/api/account` | Delete the account and all its data (needs the password) |
| GET, PUT | `/api/goal` | Read or save the goal (target weight, date, label, budget) |
| GET, POST | `/api/entries` | List (filter by type and date, search, paginate) or create |
| PATCH, DELETE | `/api/entries/:id` | Edit or delete an entry |
| GET | `/api/stats/daily?date=` | Eaten, burned and remaining for a day |
| GET, POST | `/api/foods` | Starter foods plus your own |
| POST | `/api/optimizer/treats` | Best combination for a calorie budget |
| GET | `/api/calories?q=&type=` | AI calorie estimate |
| GET, PUT | `/api/profile` | Body stats |
| PATCH | `/api/profile/weight` | Quick weigh-in |
| GET | `/api/profile/forecast` | Weight forecast |
| GET | `/api/profile/suggest` | Live budget suggestion for the goal form |
| GET | `/api/health` | Health check |

## Security notes

- Passwords are hashed with bcrypt and never stored or returned in plain text.
- Every database query is scoped to the logged-in user.
- Login and register count only failed attempts against their limit (10 per 15 minutes). The calorie lookup is limited to 15 a minute per user, and the rest of the API to 120 a minute.
- Requests are validated with Zod on the server, and the same rules are checked on the client for quick feedback.
- Deleting an account needs the password, and uses a status code that doesn't trigger the client's "session expired" logout.
- The login token is kept in `localStorage`. That's simple, but a cross-site scripting bug could expose it, so a production app might prefer httpOnly cookies.

## Known limitations

- **Free hosting sleeps.** The server spins down after about 15 idle minutes and takes around a minute to wake.
- **No password reset or email verification yet.** Treat it as a personal project, and don't store anything sensitive in it.
- **Reminders appear only when the app is open.** Notifications while the app is closed would need push support.
- **Coach, reminder and onboarding choices are stored on the device.** Meals, goals and body stats are stored on the server.
- **A weigh-in replaces the previous weight.** There's no weight history or chart yet.
- **Rate-limit counters and the calorie cache live in memory,** so they reset when the server restarts.
- **The app works offline only as far as opening.** Your data needs a connection.

## Roadmap

- Weight history with a progress chart
- Calorie estimates in the optimizer's "add food" form
- Password reset and email verification
- Push notifications for reminders
- API integration tests

## Disclaimer

CalPal gives rough estimates from standard formulas. It is not medical advice. Calorie counts, burn estimates and weight forecasts vary from person to person. If you have a health condition, are pregnant, or have a history of disordered eating, please talk to a doctor or dietitian before changing how you eat. The app is for adults only.

## Author

Built by [Ritul Vashistha](https://github.com/RitulVashistha-IITD) as a hands-on project to practice full-stack TypeScript, React, Node and AI-powered features.