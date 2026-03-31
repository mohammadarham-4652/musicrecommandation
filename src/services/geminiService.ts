import { GoogleGenAI, Type } from "@google/genai";

export interface SongRecommendation {
  title: string;
  artist: string;
  reason: string;
  imageUrl: string;
}

export async function getMoodRecommendations(mood: string, customVibe: string): Promise<SongRecommendation[]> {
  let apiKey = process.env.GEMINI_API_KEY;
  
  // Try global window variable if process.env is missing
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    apiKey = (window as any).GEMINI_API_KEY;
  }

  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
    throw new Error("Gemini API key is missing. Please configure it in the AI Studio Secrets panel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Generate 7 song recommendations for someone feeling "${mood}"${customVibe ? ` with the specific vibe: "${customVibe}"` : ""}. 
  IMPORTANT: Prioritize Hindi songs (Bollywood, Indie, etc.) over English songs. At least 5 out of 7 songs should be in Hindi.
  For each song, provide the title, artist name, and a one-line reason why it fits this mood. 
  Also provide a descriptive prompt for an image that represents the song's aesthetic (e.g., "minimalist album art with deep blue tones").`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
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

    if (!response.text) {
      throw new Error("The AI returned an empty response. Please try again.");
    }

    const rawData = JSON.parse(response.text);
    
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
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("Quota exceeded")) {
      throw new Error("AI Quota exceeded. Please try again in a few minutes.");
    }
    throw error;
  }
}
