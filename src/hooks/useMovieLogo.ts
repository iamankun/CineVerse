import { useEffect, useState } from "react";
import { env } from "@/utils/env";

interface Logo {
  iso_639_1: string | null;
  file_path: string;
}

interface Logo {
  iso_639_1: string | null;
  file_path: string;
}

export const useMovieLogo = (movieId: number, type: "movie" | "tv", originalLanguage?: string) => {
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
        
        // Priority order: vi-VN → en → null → original language → any
        // CHỈ sử dụng original language khi KHÔNG có vi, en, hoặc null
        const viLogo = data.logos?.find((logo: Logo) => logo.iso_639_1 === "vi");
        const enLogo = data.logos?.find((logo: Logo) => logo.iso_639_1 === "en");
        const nullLogo = data.logos?.find((logo: Logo) => logo.iso_639_1 === null);
        const originalLogo = originalLanguage 
          ? data.logos?.find((logo: Logo) => logo.iso_639_1 === originalLanguage)
          : null;
        const anyLogo = data.logos?.[0];
        
        // Select logo with priority: VI LUÔN ƯU TIÊN TRƯỚC
        const selectedLogo = viLogo || enLogo || nullLogo || originalLogo || anyLogo;
        
        console.log("Logo selection:", {
          hasVi: !!viLogo,
          hasEn: !!enLogo,
          hasNull: !!nullLogo,
          hasOriginal: !!originalLogo,
          selected: selectedLogo?.iso_639_1,
          originalLanguage,
          priority: viLogo ? "vi" : enLogo ? "en" : nullLogo ? "null" : originalLogo ? "original" : "any"
        });
        
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
  }, [movieId, type, originalLanguage]);

  return logoPath;
};
