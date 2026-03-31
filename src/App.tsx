import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getMoodRecommendations, SongRecommendation } from './services/geminiService';

const MOODS = [
  { id: 'happy', name: 'Happy', label: 'Euphoric & Bright', icon: 'sunny', color: 'text-primary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiMDIalTS6BkPVRpXn216_8lnAHe26v3nH4yH1BjgyquH4sV3mZ2k5o5LzFem8ngu72n6bGvaG2i0W5UxFK2EmA4_TAclOfPXgYqDO7lrAdDGQ5jBkcNbhFbPYsHnXKKexKNb7TCK0uuH-aW-QayZppQxzoRHqeSe8nC4MOT83j67nWixxT1R0skN8Zo0iCB_Xe5s9EG7AcEicNFBWxIRD3XsbJKTy4RI2uYccPf8pvuMOZwMpzq6uvL-M11N7mw0yK_HftUTEXQ' },
  { id: 'sad', name: 'Sad', label: 'Introspective Blue', icon: 'water_drop', color: 'text-secondary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMbhloZRBcJF6zhHSB9lkIfAezVSB9GtlYREEN5c1XzOyqpMP0poIgcAgHQAcnJIBT_K2q7h0syJirpIrOmFZWJTjgFnS6bbh18zwlWilhZk1FF6YInL0-9vSkFme00S-4p42_M-6GJhHCGi-vcZqhhFKVEQVI88X5RxST4T-hx2z0nf1r-zlGpoYeI4kixzMhatuled4fjzE8sOlRT0prxGRzj97JiEsFClFGzA6DK8-6OhQRQOlmF-YjOh_NGd1xytX_KiPHuw' },
  { id: 'calm', name: 'Calm', label: 'Stillness & Flow', icon: 'filter_drama', color: 'text-tertiary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQOJoRD-4Jhzj9Dh4bmgaRNyRpZqDijSQUj2w-XgdLYRoIZOFlbtR-HQFF3BX-Zdtqx4ctElUXR99yrOiB1a8y0f_5MzpFofhXViGNHFx8DgcfreyAY9x01r3ljOviponotIdg41UqvgZ8B3Q34GSG_Mg-7RQeeb-NJq9SdsspUs3j9M2kENdeqr1fSA-By_HNxDxRsQe7jKZjE4Z8nWBa-ZKLRq96d-uO6lzIOTIIQ4-7dBIF31WTCniUF_wx8c4N1gMlC_uE4A' },
  { id: 'party', name: 'Party', label: 'Electric Energy', icon: 'celebration', color: 'text-secondary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAkOPKCu_UnfhsKrDZnWyDMldF4Z3rsF0P-xJg46iPrSZTreIO7xQiSXYSj8dFK0xAxynchIi6-sqkBa8ciiLUxd-tzJ08e5m5mXPAXQsNSOlaDbyEXyHMTuJOcyLhKGFkEhE4XxjgDWf0kxDw3mSOlK_NkdfdLQQrMGxs3npCrtWvQDTrjvW54JcG0wOoMh2SysvnfOt9R0GW4JmjDR08v1EXzGR2C2Y7fQu2SxitICSkntiLuYPUQciO1kMexfG-Kwjbn_BTCg' },
  { id: 'focused', name: 'Focused', label: 'Deep Work Flow', icon: 'center_focus_strong', color: 'text-primary', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6U7iO2SB6beF5iIS32iEle6IzFx9D-k2AhpEFhjhBWSAMamZIzWQYF6GRElczIYbDKzfjntsQltiCeM9OTrS6S5zVZ5QwLOEZVSa3iLK_1v3SGicfMoCv5bTN_NdfE8A-urTG61mO0KQ4erMLZ90otYUr-_R8B2Yhnr7pJ-y5hMwAoiNXOMZNVzgz_aswDh-uskyakFE9vNu7_-3NRDWUV_QVGd7_DP79u5ivBiPkHtEVfCSNOmmQZbqJOe9iCUIfSp_n4dL_7g' },
  { id: 'romantic', name: 'Romantic', label: 'Velvet & Flame', icon: 'favorite', color: 'text-error', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD30lnggTNyrsvJkki1j9im5FyAvj7KFZXJ2nFA4izDgE0NuAzXKc63vtWE-rdMQ74YnVqAcnFC1nzR_r5f_jK9M7gnwJLl9D1QX4fRPTqe2W2tyjvOQxzLp56oTpYRUVuWfDKfyJxuNcqsne1RGTVu5ZdzJfRUJVvf4_Hn_WerIZjlhS3KtRK1-v_uYTkzZakgOzeRNiobWHTDIsCp4036FbvwTGKYtNo4Esn6q6dj4jrnZEpw-dNCzMXEQwGIFSRatb-gnNi44A' },
];

export default function App() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [customVibe, setCustomVibe] = useState('');
  const [recommendations, setRecommendations] = useState<SongRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'selection' | 'results' | 'favorites' | 'documentation'>('selection');
  const [favorites, setFavorites] = useState<SongRecommendation[]>([]);

  const toggleFavorite = (song: SongRecommendation) => {
    setFavorites(prev => {
      const isFav = prev.some(f => f.title === song.title && f.artist === song.artist);
      if (isFav) {
        return prev.filter(f => !(f.title === song.title && f.artist === song.artist));
      } else {
        return [...prev, song];
      }
    });
  };

  const handleGenerate = async () => {
    if (!selectedMood && !customVibe) return;
    
    setIsLoading(true);
    try {
      const results = await getMoodRecommendations(selectedMood || 'Unknown', customVibe);
      setRecommendations(results);
      setView('results');
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setView('selection');
    setRecommendations([]);
    setSelectedMood(null);
    setCustomVibe('');
  };

  const isFavorite = (song: SongRecommendation) => {
    return favorites.some(f => f.title === song.title && f.artist === song.artist);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pb-32">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#131313]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer">menu</span>
          <h1 className="text-primary font-headline font-bold text-2xl tracking-tight italic tracking-widest cursor-pointer" onClick={handleBack}>
            Listen Heart
          </h1>
        </div>
        <button 
          onClick={() => setView('documentation')}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${view === 'documentation' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-highest text-primary border-outline-variant/20 hover:bg-surface-bright'}`}
        >
          <span className="material-symbols-outlined">mic</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Editorial Section */}
              <section className="mb-12">
                <span className="font-label uppercase tracking-widest text-[10px] text-primary/60 block mb-2">The Digital Sommelier</span>
                <h2 className="font-headline text-5xl md:text-6xl font-bold leading-tight mb-4">
                  How does your<br /><span className="italic text-primary">heart</span> feel?
                </h2>
                <p className="font-body text-on-surface-variant max-w-md text-lg leading-relaxed">
                  Select a curated frequency or describe the atmosphere you wish to inhabit.
                </p>
              </section>

              {/* Search / Vibe Input */}
              <section className="mb-16">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-primary/50 group-focus-within:text-primary transition-colors">auto_awesome</span>
                  </div>
                  <input 
                    className="w-full h-16 pl-14 pr-6 rounded-xl bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/30 glass-card text-on-surface placeholder:text-on-surface-variant/40 font-body text-lg transition-all" 
                    placeholder="Type a vibe description... (e.g., 'Rainy jazz in a basement bar')" 
                    type="text"
                    value={customVibe}
                    onChange={(e) => setCustomVibe(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGenerate();
                      }
                    }}
                  />
                </div>
              </section>

              {/* Bento Grid Mood Selection */}
              <section className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {MOODS.map((mood) => (
                  <button 
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.name)}
                    className="group relative flex flex-col items-center gap-2 transition-all duration-300"
                  >
                    <div className={`relative aspect-square w-full overflow-hidden rounded-xl bg-surface-container-high ring-inset transition-all duration-500 ${selectedMood === mood.name ? 'ring-2 ring-primary' : 'ring-0'}`}>
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
                        <img 
                          className="w-full h-full object-cover" 
                          src={mood.img} 
                          alt={mood.name}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="relative z-10 h-full flex items-center justify-center pointer-events-none">
                        <span className={`material-symbols-outlined ${mood.color} text-3xl md:text-5xl`}>{mood.icon}</span>
                      </div>
                    </div>
                    <div className="text-center pointer-events-none">
                      <h3 className="font-headline text-sm md:text-2xl font-bold leading-tight">{mood.name}</h3>
                      <p className="font-label text-[9px] md:text-[10px] uppercase tracking-wider text-on-surface-variant/80 leading-tight">
                        {mood.label}
                      </p>
                    </div>
                  </button>
                ))}
              </section>

              {/* Primary Action */}
              <div className="mt-20 flex justify-center">
                <button 
                  onClick={handleGenerate}
                  disabled={isLoading || (!selectedMood && !customVibe)}
                  className="gold-gradient px-12 py-5 rounded-full text-on-primary-fixed font-bold text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoading ? 'Curating...' : 'Generate Recommendations'}</span>
                  <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>
                    {isLoading ? 'sync' : 'auto_fix_high'}
                  </span>
                </button>
              </div>
            </motion.div>
          ) : view === 'documentation' ? (
            <motion.div
              key="documentation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="pb-20"
            >
              <section className="mb-12">
                <span className="font-label text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">
                  System Guide
                </span>
                <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">
                  Listen Heart <br /><span className="italic text-primary/80">Documentation</span>
                </h2>
                <div className="w-24 h-px bg-primary/30 mt-6 mb-8"></div>
              </section>

              <section className="space-y-12 font-body text-on-surface-variant leading-relaxed">
                <div>
                  <h3 className="text-primary font-headline text-2xl font-bold mb-4 italic">The Vision</h3>
                  <p>
                    Listen Heart is an AI-powered sonic curator designed to bridge the gap between human emotion and digital music libraries. 
                    By analyzing your current state of mind or a specific atmospheric description, our system synthesizes a unique 7-track 
                    journey tailored to your exact frequency.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                    <h4 className="text-on-surface font-headline text-xl font-bold mb-3">Mood Selection</h4>
                    <p className="text-sm">
                      Choose from our curated bento grid of core frequencies. Each mood is mapped to specific musical attributes 
                      like tempo, key, and instrumentation.
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
                    <h4 className="text-on-surface font-headline text-xl font-bold mb-3">Vibe Synthesis</h4>
                    <p className="text-sm">
                      Use the custom input to describe your atmosphere. Our AI understands complex prompts like "rainy jazz in a 
                      Parisian cafe" or "neon-lit midnight drive."
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-primary font-headline text-2xl font-bold mb-4 italic">Hindi Priority</h3>
                  <p>
                    The system is optimized to prioritize Hindi music (Bollywood, Indie, Classical fusion) to provide a rich 
                    cultural experience while still incorporating global influences when appropriate.
                  </p>
                </div>

                <div>
                  <h3 className="text-primary font-headline text-2xl font-bold mb-4 italic">Favorites</h3>
                  <p>
                    Mark tracks with the heart icon to save them to your collection. Your favorites are stored locally 
                    during your session for quick access via the navigation bar.
                  </p>
                </div>

                <div className="pt-8 flex justify-center">
                  <button 
                    onClick={handleBack}
                    className="gold-gradient px-10 py-4 rounded-full text-on-primary-fixed font-bold text-sm uppercase tracking-widest shadow-xl"
                  >
                    Start Curating
                  </button>
                </div>
              </section>
            </motion.div>
          ) : view === 'favorites' ? (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <section className="mb-12">
                <span className="font-label text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">
                  Your Collection
                </span>
                <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">
                  Favorite <br /><span className="italic text-primary/80">Melodies</span>
                </h2>
                <div className="w-24 h-px bg-primary/30 mt-6 mb-8"></div>
              </section>

              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/40">
                  <span className="material-symbols-outlined text-6xl mb-4">heart_broken</span>
                  <p className="font-body text-lg italic">No favorites yet. Start curating your vibe!</p>
                  <button 
                    onClick={() => setView('selection')}
                    className="mt-8 text-primary font-label text-xs uppercase tracking-widest border-b border-primary/30 pb-1"
                  >
                    Back to Moods
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map((song, index) => (
                    <div key={index} className="bg-surface-container-lowest p-4 rounded-lg flex gap-4 items-center group hover:bg-surface-container-high transition-colors">
                      <div className="w-20 h-20 bg-surface-container-highest flex-shrink-0 rounded overflow-hidden">
                        <img 
                          className="w-full h-full object-cover" 
                          src={song.imageUrl} 
                          alt={song.title}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-headline text-lg font-bold">{song.title}</h4>
                            <p className="font-label text-on-surface/50 text-[10px] uppercase tracking-wider">{song.artist}</p>
                          </div>
                          <span 
                            className="material-symbols-outlined cursor-pointer hover:scale-110 transition-transform text-error"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                            onClick={() => toggleFavorite(song)}
                          >
                            favorite
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-[11px] mt-1 italic mb-3">{song.reason}</p>
                        <a 
                          href={`https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/5"
                        >
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                          Listen on Spotify
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero Header */}
              <section className="mb-12">
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 mb-6 text-primary hover:text-primary-fixed transition-colors group"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span className="font-label text-xs uppercase tracking-[0.2em]">Back to Moods</span>
                </button>
                <div className="relative">
                  <span className="font-label text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">
                    AI Curation • {selectedMood || 'Custom Vibe'}
                  </span>
                  <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-4">
                    The {selectedMood || 'Vibe'} <br /><span className="italic text-primary/80">Curations</span>
                  </h2>
                  <div className="w-24 h-px bg-primary/30 mt-6 mb-8"></div>
                </div>
              </section>

              {/* Recommendation List */}
              <section className="space-y-4">
                {recommendations.map((song, index) => (
                  index === 0 ? (
                    <div key={index} className="group relative bg-surface-container-low p-6 rounded-lg flex flex-col md:flex-row gap-6 items-center transition-all hover:bg-surface-bright">
                      <div className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden rounded shadow-2xl">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          src={song.imageUrl} 
                          alt={song.title}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-headline text-2xl font-bold text-on-background">{song.title}</h3>
                            <p className="font-label text-primary/70 uppercase tracking-widest text-xs">{song.artist}</p>
                          </div>
                          <span 
                            className={`material-symbols-outlined cursor-pointer hover:scale-110 transition-transform ${isFavorite(song) ? 'text-error' : 'text-primary'}`} 
                            style={{ fontVariationSettings: isFavorite(song) ? "'FILL' 1" : "'FILL' 0" }}
                            onClick={() => toggleFavorite(song)}
                          >
                            favorite
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-sm leading-relaxed max-w-lg mb-4">
                          {song.reason}
                        </p>
                        <a 
                          href={`https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gold-gradient inline-flex items-center gap-2 px-6 py-3 rounded-full text-on-primary-fixed font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform"
                        >
                          <span className="material-symbols-outlined">play_circle</span>
                          Listen on Spotify
                        </a>
                      </div>
                    </div>
                  ) : null
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.slice(1).map((song, index) => (
                    <div key={index} className="bg-surface-container-lowest p-4 rounded-lg flex gap-4 items-center group hover:bg-surface-container-high transition-colors">
                      <div className="w-20 h-20 bg-surface-container-highest flex-shrink-0 rounded overflow-hidden">
                        <img 
                          className="w-full h-full object-cover" 
                          src={song.imageUrl} 
                          alt={song.title}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-headline text-lg font-bold">{song.title}</h4>
                            <p className="font-label text-on-surface/50 text-[10px] uppercase tracking-wider">{song.artist}</p>
                          </div>
                          <span 
                            className={`material-symbols-outlined cursor-pointer hover:scale-110 transition-transform text-sm ${isFavorite(song) ? 'text-error' : 'text-primary/40 group-hover:text-primary'}`}
                            style={{ fontVariationSettings: isFavorite(song) ? "'FILL' 1" : "'FILL' 0" }}
                            onClick={() => toggleFavorite(song)}
                          >
                            favorite
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-[11px] mt-1 italic mb-3">{song.reason}</p>
                        <a 
                          href={`https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-primary hover:text-primary-fixed transition-colors border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/5"
                        >
                          <span className="material-symbols-outlined text-sm">play_circle</span>
                          Listen on Spotify
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Footer Action */}
              <div className="mt-20 flex flex-col items-center gap-6">
                <div className="h-px w-full bg-surface-container-highest"></div>
                <p className="font-headline italic text-on-surface/40 text-center max-w-xs">
                  Curated by Listen Heart AI based on your "{selectedMood || customVibe}" profile.
                </p>
                <button 
                  onClick={handleBack}
                  className="bg-surface-container-high text-primary px-10 py-4 rounded-full font-label text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-surface-container-highest transition-all"
                >
                  Refine These Selections
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#131313]/90 backdrop-blur-2xl border-t border-outline-variant/10 px-8 py-4">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => setView('selection')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'selection' || view === 'results' ? 'text-primary' : 'text-on-surface-variant/40'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: (view === 'selection' || view === 'results') ? "'FILL' 1" : "'FILL' 0" }}>
              mood
            </span>
            <span className="font-label text-[9px] uppercase tracking-widest font-bold">Moods</span>
          </button>
          
          <button 
            onClick={() => setView('favorites')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'favorites' ? 'text-primary' : 'text-on-surface-variant/40'}`}
          >
            <div className="relative">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'favorites' ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full ring-2 ring-[#131313]"></span>
              )}
            </div>
            <span className="font-label text-[9px] uppercase tracking-widest font-bold">Favorites</span>
          </button>

          <button 
            onClick={() => setView('documentation')}
            className={`flex flex-col items-center gap-1 transition-all ${view === 'documentation' ? 'text-primary' : 'text-on-surface-variant/40'}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: view === 'documentation' ? "'FILL' 1" : "'FILL' 0" }}>
              menu_book
            </span>
            <span className="font-label text-[9px] uppercase tracking-widest font-bold">Guide</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
