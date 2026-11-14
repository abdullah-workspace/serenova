# Serenova Clinic

## Setup

1. Install Node.js 20 and MongoDB Community 7 locally.
2. Run `npm install`, `npm --prefix server install`, and `npm --prefix client install`.
3. Copy `.env.example` files to `.env` in `server` and `client`.
4. Start MongoDB, then run `npm run seed`.
5. Run `npm run dev`, then visit `http://localhost:5173`.

The API health check is available at `http://localhost:5000/api/v1/health`. Docker Compose is provided for later use and is not required.
