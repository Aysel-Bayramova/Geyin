export const CLOTHES_BUCKET = 'clothes';
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const SIGNED_URL_TTL_SECONDS = 3600; // 1 hour

const MIME_ALIASES = {
  'image/jpg': 'image/jpeg',
};

const SIGNATURE_RULES = [
  {
    mimeType: 'image/jpeg',
    ext: 'jpg',
    match: (bytes) =>
      bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  },
  {
    mimeType: 'image/png',
    ext: 'png',
    match: (bytes) =>
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a,
  },
  {
    mimeType: 'image/webp',
    ext: 'webp',
    match: (bytes) =>
      bytes.length >= 12 &&
      bytes[0] === 0x52 && // R
      bytes[1] === 0x49 && // I
      bytes[2] === 0x46 && // F
      bytes[3] === 0x46 && // F
      bytes[8] === 0x57 && // W
      bytes[9] === 0x45 && // E
      bytes[10] === 0x42 && // B
      bytes[11] === 0x50, // P
  },
  {
    mimeType: 'image/gif',
    ext: 'gif',
    match: (bytes) =>
      bytes.length >= 6 &&
      bytes[0] === 0x47 && // G
      bytes[1] === 0x49 && // I
      bytes[2] === 0x46 && // F
      bytes[3] === 0x38 && // 8
      (bytes[4] === 0x37 || bytes[4] === 0x39) && // 7 or 9
      bytes[5] === 0x61, // a
  },
];

const ALLOWED_MIME_TYPES = new Set(SIGNATURE_RULES.map((r) => r.mimeType));

function normalizeMimeType(mime) {
  if (!mime || typeof mime !== 'string') return '';
  const lower = mime.toLowerCase().trim();
  return MIME_ALIASES[lower] || lower;
}

export function detectImageSignature(bufferOrBytes) {
  const bytes =
    bufferOrBytes instanceof Uint8Array ? bufferOrBytes : new Uint8Array(bufferOrBytes);
  for (const rule of SIGNATURE_RULES) {
    if (rule.match(bytes)) {
      return { mimeType: rule.mimeType, ext: rule.ext };
    }
  }
  return null;
}

export async function validateImageFile(file) {
  if (!file) {
    return { valid: false, errorCode: 'missing_file' };
  }

  if (typeof file.size !== 'number' || file.size <= 0) {
    return { valid: false, errorCode: 'invalid_type' };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, errorCode: 'file_too_large' };
  }

  const declaredMime = normalizeMimeType(file.type);
  if (declaredMime && !ALLOWED_MIME_TYPES.has(declaredMime)) {
    return { valid: false, errorCode: 'invalid_type' };
  }

  let headerBuffer;
  try {
    headerBuffer = await file.slice(0, 12).arrayBuffer();
  } catch {
    return { valid: false, errorCode: 'invalid_type' };
  }

  const detected = detectImageSignature(headerBuffer);
  if (!detected) {
    return { valid: false, errorCode: 'invalid_type' };
  }

  if (declaredMime && declaredMime !== detected.mimeType) {
    return { valid: false, errorCode: 'invalid_type' };
  }

  return {
    valid: true,
    ext: detected.ext,
    mimeType: detected.mimeType,
  };
}

function createRandomUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  throw new Error('Secure random generator unavailable');
}

export function generateSafeStoragePath(userId, ext) {
  const safeUserId = String(userId || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const safeExt = String(ext || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (!safeUserId || !safeExt) {
    throw new Error('Invalid userId or file extension');
  }
  return `${safeUserId}/${createRandomUuid()}.${safeExt}`;
}

export function extractClothesStoragePath(imageUrlOrPath) {
  if (!imageUrlOrPath || typeof imageUrlOrPath !== 'string') return null;
  const trimmed = imageUrlOrPath.trim();
  if (!trimmed) return null;

  // Already a relative storage key (e.g. "<userId>/<uuid>.jpg")
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
    const clean = trimmed.split('?')[0].replace(/^\/+/, '');
    if (!clean || clean.includes('..')) return null;
    return clean;
  }

  try {
    const parsed = new URL(trimmed, 'https://placeholder.local');
    const marker = `/${CLOTHES_BUCKET}/`;
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    const rawPath = parsed.pathname.slice(idx + marker.length);
    const decoded = decodeURIComponent(rawPath).replace(/^\/+/, '');
    if (!decoded || decoded.includes('..')) return null;
    return decoded;
  } catch {
    return null;
  }
}

let hasLoggedSignedFallback = false;

function getFallbackUrl(supabase, storagePath, originalValue) {
  if (process.env.NODE_ENV === 'development' && !hasLoggedSignedFallback) {
    hasLoggedSignedFallback = true;
    console.warn(
      '[Geyin] Falling back to public/original URL because signed URL generation failed. ' +
        'Ensure the "clothes" bucket and storage.objects SELECT RLS policy are configured.'
    );
  }
  if (/^https?:\/\//i.test(originalValue || '')) {
    return originalValue;
  }
  const { data } = supabase.storage.from(CLOTHES_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl || originalValue || '';
}

export async function resolveClothesImageUrl(
  supabase,
  imageUrlOrPath,
  expiresIn = SIGNED_URL_TTL_SECONDS
) {
  const storagePath = extractClothesStoragePath(imageUrlOrPath);
  if (!storagePath) return imageUrlOrPath || '';

  try {
    const { data, error } = await supabase.storage
      .from(CLOTHES_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  } catch {
    // Fall back below
  }

  return getFallbackUrl(supabase, storagePath, imageUrlOrPath);
}

export async function resolveWardrobeItemUrls(
  supabase,
  items,
  expiresIn = SIGNED_URL_TTL_SECONDS
) {
  if (!Array.isArray(items) || items.length === 0) return [];

  const extractedPaths = items.map((item) => extractClothesStoragePath(item?.image_url));
  const uniquePaths = Array.from(new Set(extractedPaths.filter(Boolean)));
  const signedByPath = new Map();

  if (uniquePaths.length > 0) {
    try {
      const { data, error } = await supabase.storage
        .from(CLOTHES_BUCKET)
        .createSignedUrls(uniquePaths, expiresIn);

      if (!error && Array.isArray(data)) {
        for (const entry of data) {
          if (entry?.path && entry?.signedUrl && !entry?.error) {
            signedByPath.set(entry.path, entry.signedUrl);
          }
        }
      }
    } catch {
      // Fall back per item below
    }
  }

  return items.map((item, idx) => {
    const storagePath = extractedPaths[idx];
    if (!storagePath) return item;

    const resolvedUrl =
      signedByPath.get(storagePath) || getFallbackUrl(supabase, storagePath, item.image_url);

    return {
      ...item,
      storage_path: storagePath,
      image_url: resolvedUrl,
    };
  });
}
