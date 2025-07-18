# FareFair-A-Ride-Comparison-App
FareFair is a full-stack web application that allows users to compare ride fares and estimated arrival times from popular ride-hailing services: **Uber**, **Ola**, and **Rapido**. Users can search for rides between a source and destination, choose their preferred **vehicle type (bike, auto, or car)**, and make data-driven decisions based on price, pickup ETA, and total travel time.

---

## Project Structure

```
farefair-mern-app
├── backend          # Node.js + Express REST API
│   ├── config       # Database and environment config
│   ├── middleware   # Auth & utility middleware
│   ├── models       # Mongoose schemas (User, RideQuery, CacheEntry)
│   ├── routes       # Express routes (rides, auth, users)
│   ├── utils        # Provider adapters & helpers
│   ├── .env.example # Environment variable template
│   └── server.js    # Entry point
├── frontend         # React + Tailwind client app
│   ├── public       # Static assets & index.html
│   ├── src          # Components, pages, context, styles, utils
│   ├── tailwind.config.js
│   └── postcss.config.js
└── docs             # (Optional) design docs & wireframes
```

---

## Quick Start

### 1. Clone & Install

```bash
# Clone this repo or unzip the archive
cd farefair-mern-app

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Environment Variables

Copy **backend/.env.example** to **backend/.env** and set:

```
MONGODB_URI=your_mongodb_uri_here
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
# Provider keys (optional)
UBER_API_KEY=...
OLA_API_KEY=...
RAPIDO_API_KEY=...
```

### 3. Run in Development

```bash
# From project root
cd backend && npm run dev    # Starts API on http://localhost:5000
cd ../frontend && npm start  # Starts React on http://localhost:3000
```

### 4. Production Build

```bash
cd frontend && npm run build              # Builds static assets
# Serve build via Express, Nginx, or a cloud host (Render, Vercel, Netlify, etc.)
```

---

## Key Features

* **Vehicle Picker** – Choose between bike, auto, or car rides before searching.
* **Side-by-Side Comparison** – View price, pickup ETA, and trip duration across providers.
* **Sorting & Filtering** – Sort results by price, pickup time, or total duration.
* **History & Analytics** – User ride history endpoint and popular-routes aggregation.
* **Mocked Provider APIs** – Realistic surge pricing and availability simulation when live APIs are absent.

---

## Tech Stack

| Layer      | Tech |
|------------|------|
| Frontend   | React, React Router, Axios, Tailwind CSS |
| Backend    | Node.js, Express.js, Axios |
| Database   | MongoDB, Mongoose |
| Auth       | JWT, Bcrypt |
| DevOps     | Nodemon, Jest, ESLint |

---
