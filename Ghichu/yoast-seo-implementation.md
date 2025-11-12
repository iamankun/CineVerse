# Yoast SEO Algorithm Implementation

## 📚 Tổng quan

CineVerse đã tích hợp các thuật toán SEO của Yoast SEO để phân tích và tối ưu hóa nội dung website. Hệ thống đánh giá 11 tiêu chí chính và cho điểm từ 0-100.

## 🎯 Các thuật toán đã triển khai

### 1. **SEO Title Check** ✅
- Kiểm tra độ dài tiêu đề (tối ưu: 30-60 ký tự)
- Kiểm tra từ khóa trong tiêu đề
- Kiểm tra vị trí từ khóa (nên ở đầu tiêu đề)

**Scoring:**
- Không có tiêu đề: 0 điểm
- Quá ngắn (< 30 ký tự): 50 điểm
- Quá dài (> 60 ký tự): 70 điểm
- Độ dài tốt: 100 điểm
- Từ khóa ở đầu: 100 điểm
- Từ khóa trong tiêu đề: 80 điểm
- Không có từ khóa: 30 điểm

### 2. **Meta Description Check** ✅
- Kiểm tra độ dài mô tả (tối ưu: 120-155 ký tự)
- Kiểm tra từ khóa trong mô tả

**Scoring:**
- Không có mô tả: 0 điểm
- Quá ngắn (< 120 ký tự): 50 điểm
- Quá dài (> 155 ký tự): 70 điểm
- Độ dài tốt: 100 điểm
- Có từ khóa: 100 điểm
- Không có từ khóa: 50 điểm

### 3. **Content Length Check** ✅
- Đếm số từ trong nội dung
- Tối thiểu: 300 từ
- Tốt: 600+ từ

**Scoring:**
- < 300 từ: 30 điểm
- 300-599 từ: 70 điểm
- 600+ từ: 100 điểm

### 4. **Keyphrase in Content** ✅
- Kiểm tra từ khóa có trong nội dung
- Kiểm tra từ khóa trong đoạn mở đầu

**Scoring:**
- Không có từ khóa: 0 điểm
- Có trong đoạn mở đầu: 100 điểm
- Có nhưng không ở đoạn đầu: 60 điểm

### 5. **Keyphrase Density Check** ✅
- Tính mật độ từ khóa (optimal: 0.5% - 2.5%)
- Công thức: (số lần xuất hiện * số từ trong keyphrase / tổng số từ) * 100

**Scoring:**
- Mật độ = 0: 0 điểm
- < 0.5%: 60 điểm
- > 2.5%: 50 điểm (spam)
- 0.5-2.5%: 100 điểm

### 6. **URL SEO Check** ✅
- Kiểm tra độ dài URL (nên < 75 ký tự)
- Kiểm tra stop words trong URL
- Kiểm tra từ khóa trong URL

**Scoring:**
- URL quá dài: 60 điểm
- Có stop words: 70 điểm
- Có từ khóa: 100 điểm
- Không có từ khóa: 50 điểm

### 7. **Heading Structure Check** ✅
- Kiểm tra thẻ H1 (chỉ nên có 1)
- Kiểm tra thẻ H2
- Kiểm tra từ khóa trong headings

**Scoring:**
- Không có H1: 30 điểm
- Nhiều H1: 60 điểm
- Đúng 1 H1: 100 điểm
- Không có H2: 70 điểm
- Có H2: 100 điểm
- Từ khóa trong heading: 100 điểm
- Không có từ khóa: 60 điểm

### 8. **Image SEO Check** ✅
- Kiểm tra có hình ảnh
- Kiểm tra alt text
- Kiểm tra từ khóa trong alt text

**Scoring:**
- Không có hình: 70 điểm
- Thiếu alt text: 50 điểm
- Tất cả có alt: 100 điểm
- Từ khóa trong alt: 100 điểm
- Không có từ khóa: 70 điểm

### 9. **Readability Check** ✅
- Kiểm tra độ dài câu (nên < 25 từ/câu)
- Kiểm tra độ dài đoạn văn (nên < 150 từ/đoạn)

**Scoring:**
- Câu quá dài (> 25 từ): 60 điểm
- Câu hơi dài (20-25 từ): 80 điểm
- Câu tốt (< 20 từ): 100 điểm
- Đoạn quá dài: 70 điểm
- Đoạn tốt: 100 điểm

### 10. **Internal Links Check** ✅
- Đếm số lượng liên kết nội bộ
- Tối thiểu: 3 liên kết

**Scoring:**
- Không có: 60 điểm
- < 3 liên kết: 75 điểm
- 3+ liên kết: 100 điểm

### 11. **Outbound Links Check** ✅
- Kiểm tra liên kết ra ngoài
- Nên có ít nhất 1 liên kết đến nguồn uy tín

**Scoring:**
- Không có: 80 điểm
- Có liên kết: 100 điểm

## 📊 Hệ thống điểm số

### Overall Score Calculation
```typescript
averageScore = sum(all_issue_scores) / number_of_issues
```

### Status Levels
- **Good** (80-100 điểm): ✅ Màu xanh
- **OK** (60-79 điểm): ⚠️ Màu vàng
- **Bad** (0-59 điểm): ❌ Màu đỏ

## 🛠️ Cách sử dụng

### 1. Import Algorithm
```typescript
import { analyzeSEO, type SEOConfig } from "@/utils/seo/yoast-algorithm";
```

### 2. Prepare Config
```typescript
const config: SEOConfig = {
  title: "Your SEO Title",
  description: "Your meta description",
  url: "/your-url-slug",
  content: "<h1>Your content with HTML tags</h1>",
  focusKeyphrase: "your focus keyword",
  images: [
    { src: "/image.jpg", alt: "Image alt text" }
  ]
};
```

### 3. Analyze
```typescript
const result = analyzeSEO(config);
console.log(result.score); // 0-100
console.log(result.status); // "good" | "ok" | "bad"
console.log(result.issues); // Array of issues
console.log(result.recommendations); // Array of suggestions
```

### 4. Use React Component
```tsx
import SEOAnalyzer from "@/components/ui/seo/SEOAnalyzer";

<SEOAnalyzer config={config} />
```

### 5. Use Hook
```typescript
import { useSEOAnalysis } from "@/hooks/useSEOAnalysis";

const analysis = useSEOAnalysis(config);
```

## 🎬 Auto-generate SEO for Movies/TV

### Import Generator
```typescript
import { generateCompleteSEO } from "@/utils/seo/content-generator";
```

### Generate SEO Package
```typescript
const movie = { /* Movie data from TMDB */ };
const pathname = "/movie/123/movie-title";

const seo = generateCompleteSEO(movie, pathname);
// Returns: {
//   title, description, keywords, focusKeyphrase,
//   url, slug, content, images, structuredData
// }
```

### Individual Generators
```typescript
import {
  generateSEOTitle,
  generateSEODescription,
  generateSEOKeywords,
  generateFocusKeyphrase,
  generateSEOSlug,
  generateSEOContent,
  generateStructuredData,
  extractImagesForSEO
} from "@/utils/seo/content-generator";

// Use any generator individually
const title = generateSEOTitle(movie);
const description = generateSEODescription(movie);
```

## 📱 Test Page

Truy cập `/admin/seo` để test SEO analyzer với giao diện trực quan:
- Input form để nhập nội dung
- Real-time SEO analysis
- Quick presets (Good/OK/Bad examples)
- Visual score display

## 📈 Best Practices

### ✅ Nên làm:
1. **Title**: 50-60 ký tự, từ khóa ở đầu
2. **Description**: 120-155 ký tự, có từ khóa
3. **Content**: Tối thiểu 300 từ, lý tưởng 600+ từ
4. **Keyphrase Density**: 0.5-2.5%
5. **Headings**: 1 H1, nhiều H2/H3, có từ khóa
6. **Images**: Tất cả có alt text, ít nhất 1 alt có từ khóa
7. **Links**: Ít nhất 3 internal links, 1+ outbound links
8. **Readability**: < 25 từ/câu, < 150 từ/đoạn
9. **URL**: < 75 ký tự, có từ khóa, không có stop words
10. **First Paragraph**: Chứa từ khóa chính

### ❌ Không nên:
1. Bỏ trống title hoặc description
2. Spam từ khóa (mật độ > 2.5%)
3. Nhiều thẻ H1
4. Hình ảnh không có alt text
5. Không có internal/outbound links
6. Nội dung quá ngắn (< 300 từ)
7. Câu và đoạn văn quá dài
8. URL chứa stop words không cần thiết
9. Từ khóa không xuất hiện trong nội dung
10. Không có cấu trúc heading rõ ràng

## 🔧 Customization

### Adjust Thresholds
Edit `src/utils/seo/yoast-algorithm.ts` to modify:
- Character limits for title/description
- Word count thresholds
- Keyphrase density ranges
- Scoring weights

### Add New Checks
```typescript
function checkCustomSEO(content: string): SEOIssue[] {
  const issues: SEOIssue[] = [];
  
  // Your custom logic here
  
  return issues;
}

// Add to analyzeSEO function
issues.push(...checkCustomSEO(config.content));
```

## 📦 Files Structure

```
src/
├── utils/seo/
│   ├── yoast-algorithm.ts      # Core SEO analysis algorithms
│   └── content-generator.ts    # Auto-generate SEO for movies/TV
├── components/ui/seo/
│   └── SEOAnalyzer.tsx         # React component for display
├── hooks/
│   └── useSEOAnalysis.ts       # React hooks for SEO
└── app/admin/seo/
    └── page.tsx                # Test page
```

## 🎯 Integration Examples

### Example 1: Movie Page
```typescript
// In movie/[id]/page.tsx
import { generateCompleteSEO } from "@/utils/seo/content-generator";
import { analyzeSEO } from "@/utils/seo/yoast-algorithm";

const movie = await getMovieDetails(id);
const seo = generateCompleteSEO(movie, pathname);

// Check SEO score
const analysis = analyzeSEO({
  title: seo.title,
  description: seo.description,
  url: seo.url,
  content: seo.content,
  focusKeyphrase: seo.focusKeyphrase,
  images: seo.images
});

// Use in metadata
export const metadata = {
  title: seo.title,
  description: seo.description,
  keywords: seo.keywords.join(", ")
};

// Add structured data
<script type="application/ld+json">
  {JSON.stringify(seo.structuredData)}
</script>
```

### Example 2: Admin Dashboard
```typescript
// Show SEO scores for all pages
const pages = await getAllPages();
const scores = pages.map(page => ({
  page: page.url,
  score: analyzeSEO(page.seoConfig).score
}));

// Filter low scores
const needsImprovement = scores.filter(s => s.score < 80);
```

## 🚀 Performance

- **Fast Analysis**: < 10ms per page
- **No External APIs**: All calculations done locally
- **Memoized Results**: React hooks use useMemo
- **Type Safe**: Full TypeScript support

## 📝 Notes

- Thuật toán dựa trên best practices của Yoast SEO
- Điểm số chỉ mang tính tham khảo
- Cần kết hợp với Google Search Console để có kết quả tốt nhất
- Không thay thế cho việc viết nội dung chất lượng

## 🔗 References

- [Yoast SEO Documentation](https://yoast.com/wordpress/plugins/seo/)
- [Google SEO Guidelines](https://developers.google.com/search/docs)
- [Schema.org](https://schema.org)
