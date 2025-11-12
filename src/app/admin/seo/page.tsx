"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Input, Textarea, Button, Tabs, Tab } from "@heroui/react";
import SEOAnalyzer from "@/components/ui/seo/SEOAnalyzer";
import { type SEOConfig } from "@/utils/seo/yoast-algorithm";
import { IoAnalytics } from "react-icons/io5";

export default function SEOTestPage() {
  const [config, setConfig] = useState<SEOConfig>({
    title: "Xem phim Avengers: Endgame (2019) - Phim | CineVerse",
    description: "Xem phim Avengers: Endgame (2019) - Sau sự kiện tàn khốc, các Avengers tập hợp lần cuối để đảo ngược hành động của Thanos | Xem phim online chất lượng cao tại CineVerse.",
    url: "/movie/299534/avengers-endgame-2019",
    content: `<h1>Xem phim Avengers: Endgame (2019) Vietsub</h1>

<h2>Giới thiệu về Avengers: Endgame</h2>

<p>Sau sự kiện tàn khốc xảy ra trong Avengers: Infinity War, vũ trụ đang rơi vào tình trạng hỗn loạn. Các siêu anh hùng còn sống sót phải đoàn kết lại một lần nữa để đảo ngược hành động của Thanos và khôi phục sự cân bằng cho vũ trụ.</p>

<h2>Thông tin phim</h2>

<p>Tên phim: Avengers: Endgame</p>
<p>Năm phát hành: 2019</p>
<p>Đánh giá: 8.3/10 (25000 lượt)</p>
<p>Thể loại: Hành động, Khoa học viễn tưởng, Phiêu lưu</p>

<h2>Dàn diễn viên</h2>

<p>Bộ phim quy tụ dàn sao hùng hậu bao gồm Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson, và nhiều ngôi sao khác.</p>

<h2>Xem Avengers: Endgame tại CineVerse</h2>

<p>Truy cập CineVerse để xem phim Avengers: Endgame với chất lượng cao, phụ đề tiếng Việt đầy đủ. Trải nghiệm xem phim online mượt mà, không quảng cáo làm phiền. Đây là một trong những bộ phim siêu anh hùng hay nhất mọi thời đại.</p>

<h3>Tại sao nên xem tại CineVerse?</h3>

<p>CineVerse cung cấp trải nghiệm xem phim tốt nhất với chất lượng HD, giao diện thân thiện, và kho phim phong phú. Xem phim Avengers Endgame ngay hôm nay!</p>

<a href="/discover">Khám phá thêm phim hay</a>
<a href="https://www.themoviedb.org">Nguồn: TMDB</a>`,
    focusKeyphrase: "xem phim avengers endgame",
    images: [
      {
        src: "https://image.tmdb.org/t/p/original/poster.jpg",
        alt: "Poster Avengers: Endgame",
      },
      {
        src: "https://image.tmdb.org/t/p/original/backdrop.jpg",
        alt: "Hình nền Avengers: Endgame",
      },
    ],
  });

  const handleChange = (field: keyof SEOConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Card className="mb-6">
        <CardHeader className="flex-col items-start gap-2">
          <div className="flex items-center gap-2">
            <IoAnalytics size={32} className="text-primary" />
            <h1 className="text-3xl font-bold">SEO Analyzer - Yoast Algorithm</h1>
          </div>
          <p className="text-foreground-600">
            Test các thuật toán SEO của Yoast trên CineVerse. Nhập nội dung để phân tích SEO score.
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">📝 Nhập nội dung</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Focus Keyphrase (Từ khóa chính)"
                placeholder="ví dụ: xem phim avengers endgame"
                value={config.focusKeyphrase || ""}
                onChange={(e) => handleChange("focusKeyphrase", e.target.value)}
              />

              <Input
                label="SEO Title"
                placeholder="Tiêu đề SEO (50-60 ký tự)"
                value={config.title}
                onChange={(e) => handleChange("title", e.target.value)}
                description={`${config.title.length} ký tự`}
              />

              <Textarea
                label="Meta Description"
                placeholder="Mô tả SEO (120-155 ký tự)"
                value={config.description}
                onChange={(e) => handleChange("description", e.target.value)}
                description={`${config.description.length} ký tự`}
                minRows={3}
              />

              <Input
                label="URL Slug"
                placeholder="/movie/id/slug"
                value={config.url}
                onChange={(e) => handleChange("url", e.target.value)}
                description={`${config.url.length} ký tự`}
              />

              <Textarea
                label="Page Content (HTML)"
                placeholder="Nội dung trang với thẻ HTML"
                value={config.content}
                onChange={(e) => handleChange("content", e.target.value)}
                minRows={10}
                description={`${config.content.split(/\s+/).filter((w) => w.length > 0).length} từ`}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">🎨 Quick Presets</h3>
            </CardHeader>
            <CardBody className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setConfig({
                    title: "Good SEO Example - 50 chars perfect",
                    description:
                      "This is a good SEO description with exactly 150 characters which is perfect for search engines and contains the focus keyphrase properly.",
                    url: "/good-seo-example",
                    content: `<h1>Good SEO Example</h1>

<h2>Introduction</h2>
<p>This is a good SEO example with proper heading structure and content length. The focus keyphrase appears naturally throughout the content.</p>

<h2>Main Content</h2>
<p>Good SEO example content should be well-structured with clear headings, adequate length (over 300 words), and proper use of keywords. This example demonstrates best practices.</p>

<p>Additional paragraphs help reach the recommended word count. Each paragraph should be concise and focused on providing value to readers.</p>

<h3>Subheading</h3>
<p>More detailed information goes here with natural keyword usage.</p>

<a href="/related">Internal link</a>
<a href="https://example.com">External link</a>`,
                    focusKeyphrase: "good seo example",
                    images: [
                      { src: "/image1.jpg", alt: "Good SEO example image" },
                      { src: "/image2.jpg", alt: "Another good SEO example" },
                    ],
                  });
                }}
              >
                ✅ Good SEO
              </Button>

              <Button
                size="sm"
                color="danger"
                variant="flat"
                onClick={() => {
                  setConfig({
                    title: "Bad",
                    description: "Too short",
                    url: "/this-is-a-very-long-url-that-exceeds-the-recommended-75-character-limit-for-seo",
                    content: `<p>Not enough content and no headings.</p>`,
                    focusKeyphrase: "bad seo",
                    images: [],
                  });
                }}
              >
                ❌ Bad SEO
              </Button>

              <Button
                size="sm"
                color="warning"
                variant="flat"
                onClick={() => {
                  setConfig({
                    title: "OK SEO Example with Decent Length Title",
                    description:
                      "This description is okay but could be improved with better keyword placement and length optimization for better results.",
                    url: "/ok-seo-example",
                    content: `<h1>OK SEO Example</h1>
<p>Some content here but missing H2 tags. The content length is acceptable but structure could be better. No internal or external links included.</p>
<p>Additional paragraph to meet minimum word count requirements.</p>`,
                    focusKeyphrase: "ok seo",
                    images: [{ src: "/image.jpg", alt: "" }],
                  });
                }}
              >
                ⚠️ OK SEO
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* SEO Analysis Result */}
        <div>
          <SEOAnalyzer config={config} />
        </div>
      </div>
    </div>
  );
}
