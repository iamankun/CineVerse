/**
 * API Route: PageSpeed Insights
 * Lấy dữ liệu từ Google PageSpeed Insights API
 */

import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.SPEED_API_KEY;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const strategy = searchParams.get('strategy') || 'mobile'; // mobile hoặc desktop

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'SPEED_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Gọi Google PageSpeed Insights API
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=${strategy}&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES&category=SEO&category=PWA`;

    const response = await fetch(psiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch PageSpeed data';
      
      if (response.status === 403) {
        errorMessage = 'API key không hợp lệ hoặc đã đạt giới hạn quota. Vui lòng kiểm tra SPEED_API_KEY trong Google Cloud Console.';
      } else if (response.status === 429) {
        errorMessage = 'Đã đạt giới hạn request. Vui lòng thử lại sau.';
      } else {
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || `Lỗi ${response.status}: ${response.statusText}`;
        } catch {
          errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Trích xuất dữ liệu quan trọng
    const result = {
      url: data.id,
      strategy: strategy,
      timestamp: new Date().toISOString(),
      scores: {
        performance: Math.round(data.lighthouseResult?.categories?.performance?.score * 100) || 0,
        accessibility: Math.round(data.lighthouseResult?.categories?.accessibility?.score * 100) || 0,
        bestPractices: Math.round(data.lighthouseResult?.categories?.['best-practices']?.score * 100) || 0,
        seo: Math.round(data.lighthouseResult?.categories?.seo?.score * 100) || 0,
        pwa: Math.round(data.lighthouseResult?.categories?.pwa?.score * 100) || 0,
      },
      coreWebVitals: {
        lcp: data.loadingExperience?.metrics?.LARGEST_CONTENTFUL_PAINT_MS?.percentile || null,
        inp: data.loadingExperience?.metrics?.INTERACTION_TO_NEXT_PAINT?.percentile || null,
        cls: data.loadingExperience?.metrics?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile || null,
        ttfb: data.loadingExperience?.metrics?.EXPERIMENTAL_TIME_TO_FIRST_BYTE?.percentile || null,
        fcp: data.loadingExperience?.metrics?.FIRST_CONTENTFUL_PAINT_MS?.percentile || null,
      },
      audits: {
        // Core Web Vitals từ Lighthouse
        'largest-contentful-paint': data.lighthouseResult?.audits?.['largest-contentful-paint']?.displayValue || null,
        'interaction-to-next-paint': data.lighthouseResult?.audits?.['interaction-to-next-paint']?.displayValue || null,
        'cumulative-layout-shift': data.lighthouseResult?.audits?.['cumulative-layout-shift']?.displayValue || null,
        'total-blocking-time': data.lighthouseResult?.audits?.['total-blocking-time']?.displayValue || null,
        'speed-index': data.lighthouseResult?.audits?.['speed-index']?.displayValue || null,
        'first-contentful-paint': data.lighthouseResult?.audits?.['first-contentful-paint']?.displayValue || null,
      },
      opportunities: Object.values(data.lighthouseResult?.audits || {})
        .filter((audit: any) => audit.details?.type === 'opportunity' && audit.numericValue > 0)
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue,
          numericValue: audit.numericValue,
        }))
        .sort((a: any, b: any) => (b.numericValue || 0) - (a.numericValue || 0))
        .slice(0, 10),
      diagnostics: Object.values(data.lighthouseResult?.audits || {})
        .filter((audit: any) => audit.details?.type === 'table' && audit.score !== null && audit.score < 1)
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: audit.score,
        }))
        .slice(0, 10),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('PageSpeed API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
