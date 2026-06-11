---
description: CineVerse
---

# Xây dựng trang:

- KKPhim, một trang trả về kết quả khi tìm phim và chương trình TV sẽ trả về các kết quả link-embed

- Cơ chế như sau:

Thông tin Phim & Danh sách tập phim
GET https://phimapi.com/phim/{slug}
Ví dụ: https://kkphim.com/phim/ngoi-truong-xac-song GET https://phimapi.com/phim/ngoi-truong-xac-song

Thông tin dựa theo TMDB ID
GET https://phimapi.com/tmdb/{type}/{id}
Ví dụ: GET https://phimapi.com/tmdb/tv & movie/280945
Thông số kỹ thuật:
- type = tv [dành cho các phim thuộc phim bộ, bao gồm hoạt hình + tv shows]. movie [tương tự type tv]
- Mục này chỉ dành cho những phim mà KKPhim có hỗ trợ TMDB ID.

Và cho phép tôi đọc qua các link-embed và cho phép tôi copy chúng