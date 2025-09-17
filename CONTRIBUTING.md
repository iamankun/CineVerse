# Hướng dẫn đóng góp cho CineVerse - Vũ Trụ Điện Ảnh

## Lời nói đầu

    Chào mừng bạn đến với CineVerse! Chúng tôi rất vui mừng khi bạn quan tâm đến việc đóng góp cho dự án này. CineVerse là một nền tảng mã nguồn mở dành cho những người yêu thích phim ảnh và chương trình truyền hình, giúp khám phá, xem và quản lý bộ sưu tập yêu thích của bạn. Là một dự án cộng đồng, chúng tôi luôn tìm kiếm những ý tưởng mới, sửa lỗi và cải tiến để làm cho nền tảng trở nên tốt hơn. Mọi đóng góp của bạn đều được đánh giá cao và sẽ giúp xây dựng một cộng đồng đam mê hơn!

    Chúng tôi hoan nghênh tất cả các loại đóng góp, từ báo cáo lỗi, đề xuất tính năng mới, cải thiện tài liệu, đến nâng cao mã nguồn. Hãy cùng nhau làm cho CineVerse trở thành nơi tuyệt vời cho mọi người yêu phim!

### Quy tắc ứng xử (Code of Conduct)

    Tôn chỉ, chỉ cần bạn hết lòng thì mình cũng hết giả
    Thiết lập môi trường phát triển
    Để bắt đầu đóng góp, bạn cần thiết lập môi trường phát triển cục bộ. Dưới đây là các bước:

1.Yêu cầu hệ thống:

Node.js phiên bản 18 trở lên
npm hoặc yarn (khuyến nghị yarn)
Git
Trình soạn thảo mã như VS Code
Tài khoản Stack Auth (để xác thực, xem src/lib/xac-minh.ts)
2.Clone kho lưu trữ:

git clone "<https://github.com/iamankun/cineverse.git>" //Hướng dẫn cd cineverse

3.Cài đặt dependencies:

yarn install
Hoặc npm install
4.Thiết lập biến môi trường:

Sao chép .env.example thành .env.local
Điền các giá trị như STACK_DU_AN_ID, STACK_KHOA_CONG_KHAI, STACK_API_URL, STACK_KHOA_BI_MAT từ dự án Stack Auth của bạn.
5.Chạy dự án:

yarn dev

Dự án sẽ chạy tại <http://localhost:3000>

6.Chạy kiểm tra:

yarn lint yarn test # Nếu có tests

Nếu bạn gặp vấn đề trong quá trình thiết lập, hãy mở một issue với chi tiết lỗi và hệ điều hành của bạn.

Cách đóng góp
Chúng tôi khuyến khích bạn đóng góp theo các cách sau:

Báo cáo lỗi (Reporting Bugs)
Tạo issue mới với nhãn "bug".
Mô tả vấn đề rõ ràng: Những gì bạn mong đợi? Những gì xảy ra thực tế? Bao gồm các bước tái hiện, ảnh chụp màn hình, và phiên bản trình duyệt/thiết bị.
Kiểm tra xem lỗi đã được báo cáo chưa để tránh trùng lặp.
Đề xuất tính năng (Suggesting Enhancements)
Tạo issue với nhãn "enhancement".
Mô tả ý tưởng chi tiết: Tại sao tính năng này hữu ích? Nó giải quyết vấn đề gì? Có ví dụ từ các nền tảng khác không (như IMDb hoặc Netflix)?
Chúng tôi sẽ thảo luận để ưu tiên.
Cải thiện tài liệu
Chỉnh sửa các file như README.md, docs/, hoặc ví dụ sử dụng.
Đảm bảo ngôn ngữ rõ ràng, thêm ví dụ mã nếu cần.
Đóng góp mã nguồn
Theo các bước sau:

🍴 Fork kho lưu trữ và clone fork của bạn về máy cục bộ.

➕ Tạo nhánh mới: Sử dụng tên mô tả như feature/new-search-filter hoặc fix/login-bug.

git checkout -b feature/your-feature-name

🧑‍💻 Thực hiện thay đổi:

Viết mã sạch, tuân thủ ESLint và Prettier (xem .eslintrc.json và cấu hình VS Code).
Thêm hoặc cập nhật tests nếu áp dụng (sử dụng Jest hoặc React Testing Library).
Đảm bảo mã không phá vỡ các tính năng hiện có – chạy yarn lint và yarn dev để kiểm tra.
Cập nhật tài liệu nếu thay đổi API hoặc UI.
🔍 Kiểm tra thay đổi:

Chạy dự án cục bộ và test trên các trình duyệt khác nhau (Chrome, Firefox, Safari).
Sử dụng công cụ như Lighthouse để kiểm tra hiệu suất và accessibility.
📩 Gửi Pull Request (PR):

Push nhánh lên fork: git push origin feature/your-feature-name.
Tạo PR trên GitHub, mô tả:
Thay đổi gì?
Tại sao cần thiết?
Các issue liên quan (sử dụng "Fixes #123").
Đảm bảo PR sạch sẽ, không có commit không liên quan (sử dụng git rebase nếu cần).
Tiêu chuẩn mã hóa
Sử dụng TypeScript cho tất cả mã mới.
Theo quy ước đặt tên: camelCase cho biến, PascalCase cho component.
Giữ file dưới 300 dòng nếu có thể; tách thành component nhỏ.
Thêm comment cho logic phức tạp.
Không commit dependencies hoặc file bí mật (xem .gitignore).
Quy trình xem xét Pull Request
Chúng tôi sẽ xem xét PR trong vòng 1-2 tuần.
Có thể yêu cầu thay đổi; hãy phản hồi nhanh chóng.
Sau khi hợp nhất, nhánh của bạn sẽ được cập nhật tự động nếu bạn thiết lập upstream.
Câu hỏi và hỗ trợ
Nếu bạn có câu hỏi, hãy:

Đọc README.md và tài liệu khác trước.
Tìm kiếm issues hiện có.
Tạo issue mới với nhãn "question" nếu cần.
Cảm ơn bạn đã đóng góp! 🌟 Mỗi nỗ lực đều giúp CineVerse trở nên tuyệt vời hơn. Nếu bạn muốn trở thành maintainer, hãy liên hệ với chúng tôi.
