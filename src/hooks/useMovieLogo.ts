import { useEffect, useState } from "react";
import { env } from "@/utils/env";

export const useMovieLogo = (movieId: number, type: "movie" | "tv") => {
  const [logoPath, setLogoPath] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if movieId is invalid
    if (!movieId || movieId === 0) {
      return;
    }

    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${type}/${movieId}/images`,
          {
            headers: {
              Authorization: `Bearer ${env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (!response.ok) {
          console.error("Failed to fetch logo, status:", response.status);
          return;
        }
        
        const data = await response.json();
        
        console.log(`Logo data for ${type} ${movieId}:`, data);
        
        // Find Vietnamese logo first, fallback to English, then any logo
        const viLogo = data.logos?.find((logo: any) => logo.iso_639_1 === "vi");
        const enLogo = data.logos?.find((logo: any) => logo.iso_639_1 === "en");
        const anyLogo = data.logos?.[0];
        
        const selectedLogo = viLogo || enLogo || anyLogo;
        
        console.log("Selected logo:", selectedLogo);
        
        if (selectedLogo) {
          setLogoPath(selectedLogo.file_path);
        } else {
          console.warn(`No logo found for ${type} ${movieId}`);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };

    fetchLogo();
  }, [movieId, type]);

  return logoPath;
};
