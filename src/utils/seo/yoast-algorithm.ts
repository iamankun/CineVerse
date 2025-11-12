/**
 * Yoast SEO Algorithm Implementation
 * Based on Yoast SEO's content analysis algorithms
 */

export interface SEOAnalysisResult {
  score: number; // 0-100
  status: "good" | "ok" | "bad";
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  id: string;
  title: string;
  description: string;
  severity: "error" | "warning" | "info";
  score: number;
}

export interface SEOConfig {
  focusKeyphrase?: string;
  title: string;
  description: string;
  url: string;
  content: string;
  images?: Array<{ src: string; alt: string }>;
}

/**
 * Main SEO Analysis Function
 */
export function analyzeSEO(config: SEOConfig): SEOAnalysisResult {
  const issues: SEOIssue[] = [];

  // Run all checks
  issues.push(...checkTitleSEO(config.title, config.focusKeyphrase));
  issues.push(...checkMetaDescription(config.description, config.focusKeyphrase));
  issues.push(...checkContentLength(config.content));
  issues.push(...checkKeyphraseInContent(config.content, config.focusKeyphrase));
  issues.push(...checkKeyphraseDensity(config.content, config.focusKeyphrase));
  issues.push(...checkURLSEO(config.url, config.focusKeyphrase));
  issues.push(...checkHeadings(config.content, config.focusKeyphrase));
  issues.push(...checkImages(config.images, config.focusKeyphrase));
  issues.push(...checkReadability(config.content));
  issues.push(...checkInternalLinks(config.content));
  issues.push(...checkOutboundLinks(config.content));

  // Calculate overall score
  const totalScore = issues.reduce((sum, issue) => sum + issue.score, 0);
  const averageScore = issues.length > 0 ? totalScore / issues.length : 100;

  // Determine status
  let status: "good" | "ok" | "bad";
  if (averageScore >= 80) status = "good";
  else if (averageScore >= 60) status = "ok";
  else status = "bad";

  // Generate recommendations
  const recommendations = generateRecommendations(issues);

  return {
    score: Math.round(averageScore),
    status,
    issues,
    recommendations,
  };
}

/**
 * 1. SEO Title Check
 */
function checkTitleSEO(title: string, focusKeyphrase?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const titleLength = title.length;

  // Title length check (50-60 characters is optimal)
  if (titleLength === 0) {
    issues.push({
      id: "title-empty",
      title: "Thiếu tiêu đề SEO",
      description: "Trang không có tiêu đề. Thêm tiêu đề để cải thiện SEO.",
      severity: "error",
      score: 0,
    });
  } else if (titleLength < 30) {
    issues.push({
      id: "title-too-short",
      title: "Tiêu đề SEO quá ngắn",
      description: `Tiêu đề có ${titleLength} ký tự. Tối thiểu nên có 30 ký tự.`,
      severity: "warning",
      score: 50,
    });
  } else if (titleLength > 60) {
    issues.push({
      id: "title-too-long",
      title: "Tiêu đề SEO quá dài",
      description: `Tiêu đề có ${titleLength} ký tự. Nên giữ dưới 60 ký tự.`,
      severity: "warning",
      score: 70,
    });
  } else {
    issues.push({
      id: "title-length-good",
      title: "Độ dài tiêu đề tốt",
      description: `Tiêu đề có ${titleLength} ký tự, nằm trong khoảng tối ưu.`,
      severity: "info",
      score: 100,
    });
  }

  // Focus keyphrase in title
  if (focusKeyphrase && title) {
    const titleLower = title.toLowerCase();
    const keyphraseLower = focusKeyphrase.toLowerCase();

    if (titleLower.includes(keyphraseLower)) {
      const position = titleLower.indexOf(keyphraseLower);
      if (position <= 40) {
        issues.push({
          id: "keyphrase-in-title-beginning",
          title: "Từ khóa ở đầu tiêu đề",
          description: "Từ khóa xuất hiện ở vị trí tốt trong tiêu đề.",
          severity: "info",
          score: 100,
        });
      } else {
        issues.push({
          id: "keyphrase-in-title",
          title: "Từ khóa trong tiêu đề",
          description: "Từ khóa có trong tiêu đề nhưng nên đặt gần đầu hơn.",
          severity: "info",
          score: 80,
        });
      }
    } else {
      issues.push({
        id: "keyphrase-not-in-title",
        title: "Thiếu từ khóa trong tiêu đề",
        description: "Từ khóa chính không xuất hiện trong tiêu đề SEO.",
        severity: "error",
        score: 30,
      });
    }
  }

  return issues;
}

/**
 * 2. Meta Description Check
 */
function checkMetaDescription(description: string, focusKeyphrase?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const descLength = description.length;

  // Description length check (120-155 characters is optimal)
  if (descLength === 0) {
    issues.push({
      id: "meta-desc-empty",
      title: "Thiếu meta description",
      description: "Trang không có meta description. Thêm mô tả để cải thiện SEO.",
      severity: "error",
      score: 0,
    });
  } else if (descLength < 120) {
    issues.push({
      id: "meta-desc-too-short",
      title: "Meta description quá ngắn",
      description: `Mô tả có ${descLength} ký tự. Tối thiểu nên có 120 ký tự.`,
      severity: "warning",
      score: 50,
    });
  } else if (descLength > 155) {
    issues.push({
      id: "meta-desc-too-long",
      title: "Meta description quá dài",
      description: `Mô tả có ${descLength} ký tự. Nên giữ dưới 155 ký tự.`,
      severity: "warning",
      score: 70,
    });
  } else {
    issues.push({
      id: "meta-desc-length-good",
      title: "Độ dài meta description tốt",
      description: `Mô tả có ${descLength} ký tự, nằm trong khoảng tối ưu.`,
      severity: "info",
      score: 100,
    });
  }

  // Focus keyphrase in description
  if (focusKeyphrase && description) {
    const descLower = description.toLowerCase();
    const keyphraseLower = focusKeyphrase.toLowerCase();

    if (descLower.includes(keyphraseLower)) {
      issues.push({
        id: "keyphrase-in-meta-desc",
        title: "Từ khóa trong meta description",
        description: "Từ khóa chính xuất hiện trong meta description.",
        severity: "info",
        score: 100,
      });
    } else {
      issues.push({
        id: "keyphrase-not-in-meta-desc",
        title: "Thiếu từ khóa trong meta description",
        description: "Từ khóa chính không xuất hiện trong meta description.",
        severity: "warning",
        score: 50,
      });
    }
  }

  return issues;
}

/**
 * 3. Content Length Check
 */
function checkContentLength(content: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const words = content.split(/\s+/).filter((word) => word.length > 0);
  const wordCount = words.length;

  if (wordCount < 300) {
    issues.push({
      id: "content-too-short",
      title: "Nội dung quá ngắn",
      description: `Nội dung có ${wordCount} từ. Nên có ít nhất 300 từ cho SEO tốt.`,
      severity: "error",
      score: 30,
    });
  } else if (wordCount < 600) {
    issues.push({
      id: "content-ok-length",
      title: "Độ dài nội dung chấp nhận được",
      description: `Nội dung có ${wordCount} từ. Tốt hơn nếu có trên 600 từ.`,
      severity: "info",
      score: 70,
    });
  } else {
    issues.push({
      id: "content-good-length",
      title: "Độ dài nội dung tốt",
      description: `Nội dung có ${wordCount} từ, đủ chi tiết cho SEO.`,
      severity: "info",
      score: 100,
    });
  }

  return issues;
}

/**
 * 4. Keyphrase in Content Check
 */
function checkKeyphraseInContent(content: string, focusKeyphrase?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!focusKeyphrase) {
    return issues;
  }

  const contentLower = content.toLowerCase();
  const keyphraseLower = focusKeyphrase.toLowerCase();
  const firstParagraph = content.split("\n\n")[0] || "";

  // Check if keyphrase appears in content
  if (!contentLower.includes(keyphraseLower)) {
    issues.push({
      id: "keyphrase-not-in-content",
      title: "Từ khóa không có trong nội dung",
      description: "Từ khóa chính không xuất hiện trong nội dung.",
      severity: "error",
      score: 0,
    });
  } else {
    // Check if keyphrase appears in first paragraph
    if (firstParagraph.toLowerCase().includes(keyphraseLower)) {
      issues.push({
        id: "keyphrase-in-intro",
        title: "Từ khóa trong đoạn mở đầu",
        description: "Từ khóa xuất hiện trong đoạn mở đầu, rất tốt cho SEO.",
        severity: "info",
        score: 100,
      });
    } else {
      issues.push({
        id: "keyphrase-not-in-intro",
        title: "Từ khóa không có trong đoạn mở đầu",
        description: "Nên thêm từ khóa vào đoạn văn đầu tiên.",
        severity: "warning",
        score: 60,
      });
    }
  }

  return issues;
}

/**
 * 5. Keyphrase Density Check
 */
function checkKeyphraseDensity(content: string, focusKeyphrase?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!focusKeyphrase || !content) {
    return issues;
  }

  const words = content.split(/\s+/).filter((word) => word.length > 0);
  const totalWords = words.length;
  const contentLower = content.toLowerCase();
  const keyphraseLower = focusKeyphrase.toLowerCase();

  // Count keyphrase occurrences
  const keyphraseWords = keyphraseLower.split(/\s+/);
  const keyphraseLength = keyphraseWords.length;
  let count = 0;
  let pos = 0;

  while ((pos = contentLower.indexOf(keyphraseLower, pos)) !== -1) {
    count++;
    pos += keyphraseLower.length;
  }

  // Calculate density (optimal: 0.5% - 2.5%)
  const density = totalWords > 0 ? (count * keyphraseLength / totalWords) * 100 : 0;

  if (density === 0) {
    issues.push({
      id: "keyphrase-density-zero",
      title: "Từ khóa không xuất hiện",
      description: "Từ khóa chính không có trong nội dung.",
      severity: "error",
      score: 0,
    });
  } else if (density < 0.5) {
    issues.push({
      id: "keyphrase-density-low",
      title: "Mật độ từ khóa thấp",
      description: `Mật độ từ khóa là ${density.toFixed(2)}%. Nên tăng lên 0.5-2.5%.`,
      severity: "warning",
      score: 60,
    });
  } else if (density > 2.5) {
    issues.push({
      id: "keyphrase-density-high",
      title: "Mật độ từ khóa quá cao",
      description: `Mật độ từ khóa là ${density.toFixed(2)}%. Có thể bị coi là spam, nên giảm xuống dưới 2.5%.`,
      severity: "warning",
      score: 50,
    });
  } else {
    issues.push({
      id: "keyphrase-density-good",
      title: "Mật độ từ khóa tốt",
      description: `Mật độ từ khóa là ${density.toFixed(2)}%, nằm trong khoảng tối ưu.`,
      severity: "info",
      score: 100,
    });
  }

  return issues;
}

/**
 * 6. URL SEO Check
 */
function checkURLSEO(url: string, focusKeyphrase?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  // URL length check
  if (url.length > 75) {
    issues.push({
      id: "url-too-long",
      title: "URL quá dài",
      description: `URL có ${url.length} ký tự. Nên giữ dưới 75 ký tự.`,
      severity: "warning",
      score: 60,
    });
  } else {
    issues.push({
      id: "url-length-good",
      title: "Độ dài URL tốt",
      description: "URL có độ dài phù hợp.",
      severity: "info",
      score: 100,
    });
  }

  // Stop words in URL
  const stopWords = ["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for"];
  const urlParts = url.split(/[-_/]/);
  const hasStopWords = urlParts.some((part) => stopWords.includes(part.toLowerCase()));

  if (hasStopWords) {
    issues.push({
      id: "url-has-stop-words",
      title: "URL chứa stop words",
      description: "URL chứa các từ không cần thiết (a, the, and, etc.). Nên loại bỏ.",
      severity: "warning",
      score: 70,
    });
  }

  // Keyphrase in URL
  if (focusKeyphrase) {
    const urlLower = url.toLowerCase();
    const keyphraseLower = focusKeyphrase.toLowerCase().replace(/\s+/g, "-");

    if (urlLower.includes(keyphraseLower) || urlLower.includes(keyphraseLower.replace(/-/g, "_"))) {
      issues.push({
        id: "keyphrase-in-url",
        title: "Từ khóa trong URL",
        description: "Từ khóa chính xuất hiện trong URL.",
        severity: "info",
        score: 100,
      });
    } else {
      issues.push({
        id: "keyphrase-not-in-url",
        title: "Thiếu từ khóa trong URL",
        description: "Từ khóa chính không có trong URL.",
        severity: "warning",
        score: 50,
      });
    }
  }

  return issues;
}

/**
 * 7. Heading Structure Check
 */
function checkHeadings(content: string, focusKeyphrase?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  // Extract headings
  const h1Matches = content.match(/<h1[^>]*>.*?<\/h1>/gi) || [];
  const h2Matches = content.match(/<h2[^>]*>.*?<\/h2>/gi) || [];
  const h3Matches = content.match(/<h3[^>]*>.*?<\/h3>/gi) || [];

  // Check H1
  if (h1Matches.length === 0) {
    issues.push({
      id: "no-h1",
      title: "Thiếu thẻ H1",
      description: "Trang không có thẻ H1. Nên có một thẻ H1 chứa từ khóa.",
      severity: "error",
      score: 30,
    });
  } else if (h1Matches.length > 1) {
    issues.push({
      id: "multiple-h1",
      title: "Quá nhiều thẻ H1",
      description: `Trang có ${h1Matches.length} thẻ H1. Chỉ nên có một thẻ H1.`,
      severity: "warning",
      score: 60,
    });
  } else {
    issues.push({
      id: "h1-good",
      title: "Thẻ H1 tốt",
      description: "Trang có đúng một thẻ H1.",
      severity: "info",
      score: 100,
    });
  }

  // Check H2
  if (h2Matches.length === 0) {
    issues.push({
      id: "no-h2",
      title: "Thiếu thẻ H2",
      description: "Trang không có thẻ H2. Nên thêm tiêu đề phụ để cải thiện cấu trúc.",
      severity: "warning",
      score: 70,
    });
  } else {
    issues.push({
      id: "h2-present",
      title: "Có thẻ H2",
      description: `Trang có ${h2Matches.length} thẻ H2, tốt cho cấu trúc nội dung.`,
      severity: "info",
      score: 100,
    });
  }

  // Keyphrase in headings
  if (focusKeyphrase) {
    const keyphraseLower = focusKeyphrase.toLowerCase();
    const allHeadings = [...h1Matches, ...h2Matches, ...h3Matches]
      .map((h) => h.replace(/<[^>]+>/g, "").toLowerCase());
    
    const keyphraseInHeading = allHeadings.some((heading) => heading.includes(keyphraseLower));

    if (keyphraseInHeading) {
      issues.push({
        id: "keyphrase-in-headings",
        title: "Từ khóa trong tiêu đề",
        description: "Từ khóa chính xuất hiện trong ít nhất một tiêu đề.",
        severity: "info",
        score: 100,
      });
    } else {
      issues.push({
        id: "keyphrase-not-in-headings",
        title: "Thiếu từ khóa trong tiêu đề",
        description: "Từ khóa chính không có trong các tiêu đề H1-H3.",
        severity: "warning",
        score: 60,
      });
    }
  }

  return issues;
}

/**
 * 8. Image SEO Check
 */
function checkImages(images?: Array<{ src: string; alt: string }>, focusKeyphrase?: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  if (!images || images.length === 0) {
    issues.push({
      id: "no-images",
      title: "Không có hình ảnh",
      description: "Trang không có hình ảnh. Thêm hình ảnh để cải thiện trải nghiệm.",
      severity: "warning",
      score: 70,
    });
    return issues;
  }

  // Check alt text
  const imagesWithoutAlt = images.filter((img) => !img.alt || img.alt.trim() === "");
  if (imagesWithoutAlt.length > 0) {
    issues.push({
      id: "images-without-alt",
      title: "Hình ảnh thiếu alt text",
      description: `${imagesWithoutAlt.length}/${images.length} hình ảnh không có alt text.`,
      severity: "warning",
      score: 50,
    });
  } else {
    issues.push({
      id: "images-have-alt",
      title: "Tất cả hình ảnh có alt text",
      description: "Tất cả hình ảnh đều có alt text, tốt cho accessibility và SEO.",
      severity: "info",
      score: 100,
    });
  }

  // Keyphrase in alt text
  if (focusKeyphrase) {
    const keyphraseLower = focusKeyphrase.toLowerCase();
    const altWithKeyphrase = images.filter((img) => 
      img.alt.toLowerCase().includes(keyphraseLower)
    );

    if (altWithKeyphrase.length > 0) {
      issues.push({
        id: "keyphrase-in-alt",
        title: "Từ khóa trong alt text",
        description: `Từ khóa xuất hiện trong ${altWithKeyphrase.length} alt text.`,
        severity: "info",
        score: 100,
      });
    } else {
      issues.push({
        id: "keyphrase-not-in-alt",
        title: "Thiếu từ khóa trong alt text",
        description: "Nên thêm từ khóa vào ít nhất một alt text của hình ảnh.",
        severity: "warning",
        score: 70,
      });
    }
  }

  return issues;
}

/**
 * 9. Readability Check
 */
function checkReadability(content: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  // Sentence length check
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = content.split(/\s+/).filter((w) => w.length > 0);
  const avgWordsPerSentence = sentences.length > 0 ? words.length / sentences.length : 0;

  if (avgWordsPerSentence > 25) {
    issues.push({
      id: "sentences-too-long",
      title: "Câu quá dài",
      description: `Trung bình ${avgWordsPerSentence.toFixed(1)} từ/câu. Nên giữ dưới 25 từ/câu.`,
      severity: "warning",
      score: 60,
    });
  } else if (avgWordsPerSentence > 20) {
    issues.push({
      id: "sentences-ok-length",
      title: "Độ dài câu chấp nhận được",
      description: `Trung bình ${avgWordsPerSentence.toFixed(1)} từ/câu.`,
      severity: "info",
      score: 80,
    });
  } else {
    issues.push({
      id: "sentences-good-length",
      title: "Độ dài câu tốt",
      description: `Trung bình ${avgWordsPerSentence.toFixed(1)} từ/câu, dễ đọc.`,
      severity: "info",
      score: 100,
    });
  }

  // Paragraph length check
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const longParagraphs = paragraphs.filter((p) => {
    const paraWords = p.split(/\s+/).filter((w) => w.length > 0);
    return paraWords.length > 150;
  });

  if (longParagraphs.length > paragraphs.length * 0.3) {
    issues.push({
      id: "paragraphs-too-long",
      title: "Đoạn văn quá dài",
      description: "Nhiều đoạn văn quá dài. Nên giữ dưới 150 từ/đoạn.",
      severity: "warning",
      score: 70,
    });
  } else {
    issues.push({
      id: "paragraphs-good-length",
      title: "Độ dài đoạn văn tốt",
      description: "Các đoạn văn có độ dài hợp lý.",
      severity: "info",
      score: 100,
    });
  }

  return issues;
}

/**
 * 10. Internal Links Check
 */
function checkInternalLinks(content: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  // Extract internal links (relative URLs)
  const internalLinkMatches = content.match(/<a[^>]*href=["'](?!http|\/\/|mailto|tel)[^"']*["'][^>]*>/gi) || [];

  if (internalLinkMatches.length === 0) {
    issues.push({
      id: "no-internal-links",
      title: "Không có liên kết nội bộ",
      description: "Trang không có liên kết nội bộ. Thêm liên kết để cải thiện SEO.",
      severity: "warning",
      score: 60,
    });
  } else if (internalLinkMatches.length < 3) {
    issues.push({
      id: "few-internal-links",
      title: "Ít liên kết nội bộ",
      description: `Trang có ${internalLinkMatches.length} liên kết nội bộ. Nên có ít nhất 3 liên kết.`,
      severity: "warning",
      score: 75,
    });
  } else {
    issues.push({
      id: "good-internal-links",
      title: "Liên kết nội bộ tốt",
      description: `Trang có ${internalLinkMatches.length} liên kết nội bộ.`,
      severity: "info",
      score: 100,
    });
  }

  return issues;
}

/**
 * 11. Outbound Links Check
 */
function checkOutboundLinks(content: string): SEOIssue[] {
  const issues: SEOIssue[] = [];

  // Extract outbound links (absolute URLs)
  const outboundLinkMatches = content.match(/<a[^>]*href=["'](https?:\/\/[^"']*)["'][^>]*>/gi) || [];

  if (outboundLinkMatches.length === 0) {
    issues.push({
      id: "no-outbound-links",
      title: "Không có liên kết ra ngoài",
      description: "Trang không có liên kết ra ngoài. Thêm liên kết đến nguồn uy tín.",
      severity: "warning",
      score: 80,
    });
  } else {
    issues.push({
      id: "has-outbound-links",
      title: "Có liên kết ra ngoài",
      description: `Trang có ${outboundLinkMatches.length} liên kết ra ngoài.`,
      severity: "info",
      score: 100,
    });
  }

  return issues;
}

/**
 * Generate Recommendations
 */
function generateRecommendations(issues: SEOIssue[]): string[] {
  const recommendations: string[] = [];
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (errors.length > 0) {
    recommendations.push(`Sửa ${errors.length} lỗi nghiêm trọng trước để cải thiện SEO.`);
  }

  if (warnings.length > 0) {
    recommendations.push(`Xem xét ${warnings.length} cảnh báo để tối ưu hóa thêm.`);
  }

  // Specific recommendations based on common issues
  const issueIds = issues.map((i) => i.id);

  if (issueIds.includes("keyphrase-not-in-title")) {
    recommendations.push("Thêm từ khóa chính vào tiêu đề SEO, tốt nhất là ở đầu tiêu đề.");
  }

  if (issueIds.includes("keyphrase-not-in-meta-desc")) {
    recommendations.push("Thêm từ khóa chính vào meta description.");
  }

  if (issueIds.includes("content-too-short")) {
    recommendations.push("Mở rộng nội dung lên ít nhất 300 từ để cải thiện SEO.");
  }

  if (issueIds.includes("keyphrase-density-low")) {
    recommendations.push("Tăng số lần xuất hiện của từ khóa chính trong nội dung.");
  }

  if (issueIds.includes("no-h2")) {
    recommendations.push("Thêm các tiêu đề H2 để cải thiện cấu trúc nội dung.");
  }

  if (issueIds.includes("images-without-alt")) {
    recommendations.push("Thêm alt text cho tất cả hình ảnh, bao gồm từ khóa nếu phù hợp.");
  }

  if (issueIds.includes("no-internal-links")) {
    recommendations.push("Thêm liên kết nội bộ đến các trang liên quan.");
  }

  return recommendations;
}
