import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔥 [GITHUB] Kiểm tra GitHub API...");
    
    // Test GitHub API with token
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return NextResponse.json({
        error: "GITHUB TOKEN không có trong biến môi trường",
        hasToken: false
      }, { status: 500 });
    }

    console.log("🔥 [GITHUB] Có biến môi trường:", githubToken.substring(0, 10) + "...");

    // Test GitHub API call
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CineVerse-App'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [GITHUB] Lỗi API:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      return NextResponse.json({
        error: "Lỗi khi gọi đến GitHub API",
        status: response.status,
        statusText: response.statusText,
        details: errorText,
        hasToken: !!githubToken
      }, { status: response.status });
    }

    const userData = await response.json();
    
    console.log("✅ [GITHUB] GitHub API hoàn thành gọi đến:", {
      login: userData.login,
      name: userData.name,
      id: userData.id
    });

    return NextResponse.json({
      message: "GitHub API đã hoạt động",
      user: {
        login: userData.login,
        name: userData.name,
        id: userData.id
      },
      hasToken: !!githubToken,
      tokenLength: githubToken.length
    });

  } catch (error: any) {
    console.error("❌ [GITHUB] Lỗi:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
      hasToken: !!process.env.GITHUB_TOKEN
    }, { status: 500 });
  }
}
