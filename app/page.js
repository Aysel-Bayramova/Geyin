'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['Üst geyim', 'Alt geyim', 'Üst örtük (Gödəkçə/Palto)', 'Ayaqqabı', 'Aksesuar'];
const STYLES = [
  { value: 'gundelik', label: 'Gündəlik' },
  { value: 'klassik', label: 'Klassik / İş' },
  { value: 'idman', label: 'İdman' },
  { value: 'gece', label: 'Xüsusi / Axşam' },
];

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);

  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Wardrobe state
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Hamısı');

  // Form state for new item
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subCategory, setSubCategory] = useState('');
  const [color, setColor] = useState('');
  const [warmthLevel, setWarmthLevel] = useState(3);
  const [waterproof, setWaterproof] = useState(false);
  const [windproof, setWindproof] = useState(false);
  const [style, setStyle] = useState('gundelik');

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchItems(currentUser.id);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchItems(currentUser.id);
      } else {
        setItems([]);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchItems = async (userId) => {
    setLoadingItems(true);
    const { data, error: fetchError } = await supabase
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setItems(data || []);
    }
    setLoadingItems(false);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);

    try {
      if (isRegister) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setMessage('Qeydiyyat uğurludur! E-poçtunu yoxla (təsdiq tələb olunursa) və ya daxil ol.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || 'Xəta baş verdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage('');
    setError('');
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setMessage('');

    if (!imageFile) {
      setError('Zəhmət olmasa paltar şəkli seç.');
      return;
    }

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('clothes')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('clothes')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData?.publicUrl;

      const { error: insertError } = await supabase.from('wardrobe_items').insert([
        {
          user_id: user.id,
          image_url: imageUrl,
          category,
          sub_category: subCategory.trim() || null,
          color: color.trim() || null,
          warmth_level: Number(warmthLevel),
          waterproof,
          windproof,
          style,
        },
      ]);

      if (insertError) throw insertError;

      setMessage('Paltar qarderoba əlavə olundu!');
      setImageFile(null);
      setSubCategory('');
      setColor('');
      setWarmthLevel(3);
      setWaterproof(false);
      setWindproof(false);
      setStyle('gundelik');

      const fileInput = document.getElementById('clothes-file-input');
      if (fileInput) fileInput.value = '';

      await fetchItems(user.id);
    } catch (err) {
      setError(err.message || 'Şəkil yüklənərkən və ya saxlanılarkən xəta baş verdi.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!user) return;
    setError('');
    try {
      const urlParts = item.image_url.split('/clothes/');
      if (urlParts.length > 1) {
        const storagePath = urlParts[1].split('?')[0];
        await supabase.storage.from('clothes').remove([storagePath]);
      }

      const { error: deleteError } = await supabase
        .from('wardrobe_items')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message || 'Silinmə zamanı xəta baş verdi.');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Yüklənir...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geyin</h1>
            <p className="text-sm text-zinc-400 mt-1">
              {isRegister
                ? 'Yeni hesab yarat və qarderobunu qur.'
                : 'Hava şəraitinə uyğun kombinlər üçün hesabına daxil ol.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">E-poçt</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nümunə@mail.com"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1.5">Şifrə</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ən az 6 simvol"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-400">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-400">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 font-semibold py-2.5 text-sm transition cursor-pointer"
            >
              {submitting
                ? 'Gözləyin...'
                : isRegister
                ? 'Qeydiyyatdan keç'
                : 'Daxil ol'}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setMessage('');
              }}
              className="text-xs text-zinc-400 hover:text-white transition cursor-pointer"
            >
              {isRegister
                ? 'Artıq hesabın var? Daxil ol'
                : 'Hesabın yoxdur? Yeni hesab yarat'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const filteredItems =
    selectedCategoryFilter === 'Hamısı'
      ? items
      : items.filter((item) => item.category === selectedCategoryFilter);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Geyin — Qarderobum</h1>
            <p className="text-xs text-zinc-400 mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 transition cursor-pointer"
          >
            Çıxış et
          </button>
        </header>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {/* Add item form */}
        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Yeni paltar əlavə et</h2>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-zinc-400 mb-1.5">Paltar şəkli *</label>
              <input
                id="clothes-file-input"
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2 text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-zinc-700"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Kateqoriya *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Alt kateqoriya (məs: Hudi, Cins)</label>
              <input
                type="text"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder="Məsələn: Oversize hudi"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Rəng</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Məsələn: Qara, Bej, Göy"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Stil</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-500"
              >
                {STYLES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span>İstilik səviyyəsi (1 = çox nazik, 5 = çox qalın)</span>
                <span className="font-semibold text-white">{warmthLevel} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={warmthLevel}
                onChange={(e) => setWarmthLevel(e.target.value)}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waterproof}
                  onChange={(e) => setWaterproof(e.target.checked)}
                  className="rounded accent-white"
                />
                Suya davamlı (yağış üçün)
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={windproof}
                  onChange={(e) => setWindproof(e.target.checked)}
                  className="rounded accent-white"
                />
                Küləyə davamlı
              </label>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={uploading}
                className="w-full md:w-auto rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 font-semibold px-6 py-2.5 text-sm transition cursor-pointer"
              >
                {uploading ? 'Yüklənir...' : 'Qarderoba əlavə et'}
              </button>
            </div>
          </form>
        </section>

        {/* Wardrobe list */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              Əşyalarım ({filteredItems.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {['Hamısı', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-white text-zinc-950'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loadingItems ? (
            <p className="text-sm text-zinc-400">Qarderob yüklənir...</p>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-8 text-center text-sm text-zinc-400">
              Bu kateqoriyada hələ paltar yoxdur. Yuxarıdakı formadan ilk paltarını əlavə et!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <img
                      src={item.image_url}
                      alt={item.sub_category || item.category}
                      className="w-full h-44 object-cover bg-zinc-950"
                    />
                    <div className="p-3.5 space-y-1.5">
                      <p className="text-xs font-semibold text-white">{item.category}</p>
                      {item.sub_category && (
                        <p className="text-xs text-zinc-300">{item.sub_category}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.color && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                            {item.color}
                          </span>
                        )}
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300">
                          İstilik: {item.warmth_level}/5
                        </span>
                        {item.waterproof && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300">
                            Suya davamlı
                          </span>
                        )}
                        {item.windproof && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300">
                            Küləyə davamlı
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-3.5 pb-3">
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="w-full rounded-lg bg-zinc-950 hover:bg-red-500/15 border border-zinc-800 hover:border-red-500/30 py-1.5 text-xs text-zinc-400 hover:text-red-400 transition cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}