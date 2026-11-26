# Clothes Storage Security & Private Bucket Migration

Wardrobe photos are validated client-side before upload and stored under random UUID filenames scoped to the authenticated user (`<user_id>/<uuid>.<ext>`).

## Upload Validation Rules (`lib/storage.js`)

- **Allowed formats**: JPEG, PNG, WebP, GIF (verified via both MIME type and binary magic bytes in the file header).
- **Maximum size**: 5 MB (`MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024`).
- **Safe filenames**: Generated via `crypto.randomUUID()` with the extension derived strictly from the validated image signature rather than the user's filename.
- **Database storage value**: New uploads persist the relative storage path (`<user_id>/<uuid>.<ext>`) in `wardrobe_items.image_url`. On read (`fetchItems`), `resolveWardrobeItemUrls` requests short-lived signed URLs (`createSignedUrls`) for both new relative paths and legacy public `/clothes/...` URLs.

## Switching the `clothes` Bucket to Private

1. In Supabase Dashboard → **Storage → clothes → Configuration**, disable **Public bucket** (or run in SQL Editor):

```sql
update storage.buckets
set public = false
where id = 'clothes';
```

2. Ensure RLS is enabled on `storage.objects` and `public.wardrobe_items` so users can only access their own records and `<auth.uid()>/...` folder objects:

```sql
-- storage.objects policies for private `clothes` bucket
create policy "clothes_select_own"
on storage.objects for select to authenticated
using (bucket_id = 'clothes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "clothes_insert_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'clothes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "clothes_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'clothes' and (storage.foldername(name))[1] = auth.uid()::text);
```

## Fallback & Legacy Compatibility

If `createSignedUrls` fails (for example, while a bucket is still public or before storage `SELECT` policies are applied), `lib/storage.js` logs a development warning and falls back to `getPublicUrl` or the stored URL so existing items remain visible during migration.
