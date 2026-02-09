import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    title: "🚨 KHẨN CẤP: TOKEN HẾT HẠN 2027!",
    urgency: "CAO - CẦN CẦN UPDATE",
    currentDate: new Date().toLocaleDateString('vi-VN'),
    expirationDate: "2027",
    timeRemaining: "Khoảng 1 năm",
    impact: {
      avatarUpload: "❌ Sẽ thất bại",
      profileUpdate: "❌ Có thể lỗi",
      githubCommits: "❌ Không thể commit",
      vercelDeploy: "❌ Không thể auto-deploy"
    },
    immediateAction: {
      step1: "Tạo Personal Access Token mới",
      step2: "Quan trọng nhất: Chọn đúng scopes",
      step3: "Sao chép token mới",
      step4: "Cập nhật Vercel environment"
    },
    tokenSettings: {
      url: "https://github.com/settings/tokens",
      name: "CineVerse-Production-2026",
      expiration: "No expiration" as string,
      scopes: [
        {
          name: "repo",
          description: "Full control of private repositories",
          required: true
        },
        {
          name: "user:email",
          description: "Read user email address", 
          required: true
        },
        {
          name: "admin:repo_hook",
          description: "Manage repository hooks (for auto-deploy)",
          recommended: true
        }
      ]
    },
    verification: {
      endpoint: "https://cineverse.ankun.dev/api/validate-token",
      note: "Sau khi cập nhật token, test ngay tại đây"
    },
    warning: {
      message: "ĐỪNG ĐỂ TRÌ: Token sẽ hết hạn sớm hơn bạn nghĩ!",
      recommendation: "Luôn tạo token với expiration > 2 năm"
    }
  });
}
