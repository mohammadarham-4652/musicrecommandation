import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
  imageUrl: string;
}

export async function getMoodRecommendations(mood: string, customVibe: string): Promise<SongRecommendation[]> {
  const prompt = `Generate 7 song recommendations for someone feeling "${mood}"${customVibe ? ` with the specific vibe: "${customVibe}"` : ""}. 
  IMPORTANT: Prioritize Hindi songs (Bollywood, Indie, etc.) over English songs. At least 5 out of 7 songs should be in Hindi.
  For each song, provide the title, artist name, and a one-line reason why it fits this mood. 
  Also provide a descriptive prompt for an image that represents the song's aesthetic (e.g., "minimalist album art with deep blue tones").`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            reason: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["title", "artist", "reason", "imagePrompt"],
        },
      },
    },
  });

  const rawData = JSON.parse(response.text || "[]");
  
  // Fetch real album art for each song using iTunes Search API
  const recommendations = await Promise.all(rawData.map(async (song: any) => {
    try {
      const query = encodeURIComponent(`${song.title} ${song.artist}`);
      const itunesResponse = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const itunesData = await itunesResponse.json();
      
      let imageUrl = `https://picsum.photos/seed/${encodeURIComponent(song.imagePrompt || song.title)}/600/600`;
      
      if (itunesData.results && itunesData.results[0]) {
        // Get a higher resolution version of the artwork
        imageUrl = itunesData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
      }
      
      return {
        title: song.title,
        artist: song.artist,
        reason: song.reason,
        imageUrl: imageUrl
      };
    } catch (error) {
      console.error("Error fetching album art for:", song.title, error);
      return {
        title: song.title,
        artist: song.artist,
        reason: song.reason,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(song.title)}/600/600`
      };
    }
  }));

  return recommendations;
}
