# CalPal 💕

A cute, multi-user calorie and fitness tracker with a maths brain.

- **Daily budget:** set a goal, log meals, treats and workouts, and see calories left today plus an event countdown.
- **Craving Optimizer:** a bounded-knapsack dynamic program picks the foods with the most joy within your calorie budget.
- **Multi-user:** JWT auth, with every query scoped to the logged-in user.

## Stack
React, TypeScript, Vite, Tailwind · Node, Express 5, Zod, Mongoose · MongoDB Atlas · bcrypt, JWT, helmet, rate limiting

## Setup
```bash
git clone https://github.com/RitulVashistha-IITD/calpal.git
cd calpal/server && npm install
cp .env.example .env    # fill in MONGODB_URI and JWT_SECRET
npm run seed && npm run dev
# new terminal
cd calpal/client && npm install && npm run dev
```