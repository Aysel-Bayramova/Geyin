# Geyin — Ağıllı Hava və Qarderob Köməkçisi

Geyin is a weather-aware personal wardrobe and outfit assistant built with Next.js, React, Tailwind CSS, and Supabase. It combines live weather forecasts with your uploaded wardrobe to suggest daily outfits and multi-day travel suitcase plans in Azerbaijani, English, and Russian.

## Features

- **Location & Live Weather**: Automatic GPS detection, 32 built-in world cities, global city search, and 3 demo weather presets (`Sunny 25°C`, `Rainy 10°C`, `Snowy 0°C`).
- **Smart Outfit Builder**: Generates outfits from your wardrobe based on temperature warmth levels (1–5), rain/wind protection, color harmony, and style filter (`Casual`, `Classic / Work`, `Sporty`, `Evening / Special`), with per-slot locking and swapping.
- **Saved Outfits**: Save favorite generated outfits locally per user and reload them into the main view.
- **Travel Suitcase Planner**: Save destination cities, view a 7-day forecast, and build a packing list tailored to your trip length (1–14 days) and expected weather.
- **Digital Wardrobe Management**: Upload clothing photos to Supabase Storage with category, subcategory, color, warmth level, waterproof/windproof flags, and style tags.
- **Multilingual & Themeable UI**: Full interface support for Azerbaijani (`az`), English (`en`), and Russian (`ru`), plus `Auto`, `Light`, and `Dark` theme modes.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend / Auth / Storage**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Weather & Geocoding**: [Open-Meteo API](https://open-meteo.com/)

## Getting Started

### 1. Prerequisites

- Node.js 20+ and `npm`
- A [Supabase](https://supabase.com/) project with:
  - Email/Password authentication enabled
  - A `wardrobe_items` table (`user_id`, `image_url`, `category`, `sub_category`, `color`, `warmth_level`, `waterproof`, `windproof`, `style`, `created_at`) with Row Level Security policies
  - A `clothes` storage bucket with user-scoped policies

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint across the project |

## External APIs

- **Open-Meteo Weather Forecast API** (`https://api.open-meteo.com/v1/forecast`) — current conditions, hourly min/max/rain probability, and 7-day daily forecasts (no API key required).
- **Open-Meteo Geocoding API** (`https://geocoding-api.open-meteo.com/v1/search`) — worldwide city search by name.

## Screenshots

> Screenshots of the **Today Weather & Outfit**, **Travel Suitcase**, and **Wardrobe** views can be placed under `docs/screenshots/` and linked here.
