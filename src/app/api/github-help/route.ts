import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    title: "🔧 HƯỚNG DẪN SỬA TOKEN MỚI GITHUB",
    problem: "Token hiện tại trả về 401 Unauthorized - Bad credentials",
    solution: "Tạo Personal Access Token mới",
    steps: [
      {
        step: 1,
        title: "Đi đến GitHub Settings",
        description: "Truy cập https://github.com/settings/tokens",
        url: "https://github.com/settings/tokens"
      },
      {
        step: 2,
        title: "Tạo token mới",
        description: "Click 'Generate new token' > 'Generate new token (classic)'"
      },
      {
        step: 3,
        title: "Đặt tên và scopes",
        description: "Đặt tên: 'CineVerse-Production' và chọn scopes: repo, user:email"
      },
      {
        step: 4,
        title: "Sao chép token",
        description: "Sao chép token mới (bắt đầu bằng ghp_)"
      },
      {
        step: 5,
        title: "Cập nhật environment",
        description: "Thêm GITHUB_TOKEN mới vào Vercel environment variables"
      }
    ],
    requiredScopes: [
      {
        name: "repo",
        description: "Full control of private repositories"
      },
      {
        name: "user:email", 
        description: "Read user email address"
      }
    ],
    tokenFormat: {
      classic: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      fineGrained: "github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    verification: {
      endpoint: "https://cineverse.ankun.dev/api/validate-token",
      note: "Sau khi cập nhật token, truy cập endpoint này để verify"
    },
    troubleshooting: [
      {
        issue: "401 Bad credentials",
        fix: "Token không đúng hoặc đã hết hạn"
      },
      {
        issue: "403 Forbidden", 
        fix: "Token không đủ scopes"
      },
      {
        issue: "Token không hoạt động",
        fix: "Kiểm tra lại token có được copy đúng không"
      }
    ]
  });
}
