import { useMemo } from "react";
import { analyzeSEO, type SEOConfig, type SEOAnalysisResult } from "@/utils/seo/yoast-algorithm";

/**
 * Hook to analyze SEO for a page
 * @param config - SEO configuration
 * @returns SEO analysis result
 */
export function useSEOAnalysis(config: SEOConfig): SEOAnalysisResult {
  return useMemo(() => {
    return analyzeSEO(config);
  }, [
    config.title,
    config.description,
    config.url,
    config.content,
    config.focusKeyphrase,
    JSON.stringify(config.images),
  ]);
}

/**
 * Hook to get SEO score for a page
 * @param config - SEO configuration
 * @returns SEO score (0-100)
 */
export function useSEOScore(config: SEOConfig): number {
  const analysis = useSEOAnalysis(config);
  return analysis.score;
}

/**
 * Hook to check if SEO is good
 * @param config - SEO configuration
 * @returns boolean indicating if SEO is good (score >= 80)
 */
export function useIsSEOGood(config: SEOConfig): boolean {
  const analysis = useSEOAnalysis(config);
  return analysis.status === "good";
}
