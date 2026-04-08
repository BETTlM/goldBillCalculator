# Titan Gold

A jewellery price calculator built with Next.js. It fetches live 24K gold rates from goldapi.io and computes item-level pricing using weight, wastage, making charges, and GST stored in a Supabase database.

## Features

- Live 24K gold rate (INR per gram) via goldapi.io with an 8-hour cache to stay within free-tier API limits
- Jewellery item catalog stored in Supabase (rings, chains, bracelets, earrings, necklaces, bangles)
- Price breakdown: gold value, wastage, making charge, GST, and total
- Fallback to a static rate when the API is unavailable or unconfigured

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Gold Rate**: goldapi.io (free tier, 100 requests/month)

## Prerequisites

- Node.js 18+
- A Supabase project with the `jewellery_items` table created
- A goldapi.io API key (free at https://www.goldapi.io)

## Setup

1. **Install dependencies**

   ```
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file in the project root:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-supabase-key
   GOLDAPI_KEY=your-goldapi-io-key
   ```

3. **Seed the database**

   Run the setup script with your Supabase database password:

   ```
   node setup-db.mjs <your-database-password>
   ```

   This creates the `jewellery_items` table and inserts 30 sample items across 6 categories.

4. **Start the dev server**

   ```
   npm run dev
   ```

   Open http://localhost:3000 in your browser.

## API Routes

### `GET /api/gold-rate`

Returns the current 24K gold rate in INR per gram. The rate is fetched from goldapi.io and cached in memory for 8 hours. If the API is unreachable or the key is missing, a static fallback rate is returned.

**Response**

```json
{
  "ratePerGram": 9245.50,
  "currency": "INR",
  "unit": "gram",
  "source": "live",
  "timestamp": "2026-04-08T10:30:00.000Z"
}
```

### `GET /api/jewellery`

Query jewellery items from Supabase.

| Parameter | Description                          |
|-----------|--------------------------------------|
| `type`    | Filter items by type (e.g. `ring`)   |
| `id`      | Fetch a single item by ID            |

**Examples**

```
GET /api/jewellery?type=ring      — list all rings
GET /api/jewellery?id=3           — get item with id 3
GET /api/jewellery                — list all distinct types
```

## Project Structure

```
src/
  app/
    api/
      gold-rate/route.ts   — gold rate endpoint with caching
      jewellery/route.ts   — jewellery CRUD endpoint
    page.tsx               — main calculator UI
    layout.tsx             — root layout
    globals.css            — global styles
  lib/
    supabase.ts            — Supabase client
setup-db.mjs               — database seed script
supabase-setup.sql          — raw SQL for manual setup
```

## License

Private.
