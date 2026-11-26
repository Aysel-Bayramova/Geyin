# Supabase Setup Guide

Geyin uses Supabase for email/password authentication, Postgres wardrobe storage (`wardrobe_items`), and image storage (`clothes` bucket).

## 1. Environment Variables

Copy `.env.example` to `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Fill in the credentials from **Supabase Dashboard → Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL` — your project URL (`https://<project-ref>.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your project `anon` public key

If these variables are missing in development, `lib/supabase.js` logs a console warning instead of failing silently on network errors.

## 2. Database Schema, Bucket & RLS Migration

Run [001_initial_wardrobe_schema.sql](./migrations/001_initial_wardrobe_schema.sql) in **Supabase Dashboard → SQL Editor** (or push via Supabase CLI):

- Creates `public.wardrobe_items` with columns matching the app (`id`, `user_id`, `image_url`, `category`, `sub_category`, `color`, `warmth_level`, `waterproof`, `windproof`, `style`, `created_at`).
- Adds index `idx_wardrobe_items_user_created_at` on `(user_id, created_at desc)`.
- Enables Row Level Security (RLS) on `public.wardrobe_items` so authenticated users can only read/write/delete their own rows (`auth.uid() = user_id`).
- Creates the `clothes` storage bucket (`public = false` by default) and `storage.objects` policies restricting access to each user's `<user_id>/...` folder.

> **Note for existing public buckets:** If your `clothes` bucket was previously created as public, update it to private in **Storage → clothes → Configuration** (or `update storage.buckets set public = false where id = 'clothes';`) once your app uses signed URLs.

## 3. Authentication

In **Supabase Dashboard → Authentication → Providers**, ensure **Email** provider is enabled.
