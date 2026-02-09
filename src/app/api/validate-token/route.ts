import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔥 [GITHUB TOKEN CỦA CINEVERSE THÔNG BÁO] Đang kiểm tra biến môi trường github...");
    
    const githubToken = process.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return NextResponse.json({
        error: "GITHUB TOKEN không có",
        suggestion: "Thêm GITHUB TOKEN vào biến môi trường"
      }, { status: 500 });
    }

    // Check token format
    const isClassicToken = githubToken.startsWith('ghp_');
    const isFineGrainedToken = githubToken.startsWith('github_pat_');
    
    console.log("🔥 [GITHUB TOKEN CỦA CINEVERSE THÔNG BÁO] Xác minh mã:", {
      length: githubToken.length,
      startsWith: githubToken.substring(0, 10),
      isClassic: isClassicToken,
      isFineGrained: isFineGrainedToken,
      isValidFormat: isClassicToken || isFineGrainedToken
    });

    // Test token with different scopes
    const testResults = [];
    
    // Test 1: Basic user info
    try {
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CineVerse-App'
        }
      });
      
      testResults.push({
        test: 'User Info',
        status: userResponse.status,
        success: userResponse.ok,
        error: userResponse.ok ? null : await userResponse.text()
      });
    } catch (error: any) {
      testResults.push({
        test: 'User Info',
        status: 'ERROR',
        success: false,
        error: error.message
      });
    }

    // Test 2: Repo access
    try {
      const repoResponse = await fetch('https://api.github.com/repos/iamankun/CineVerse', {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'CineVerse-App'
        }
      });
      
      testResults.push({
        test: 'Repo Access',
        status: repoResponse.status,
        success: repoResponse.ok,
        error: repoResponse.ok ? null : await repoResponse.text()
      });
    } catch (error: any) {
      testResults.push({
        test: 'Repo Access',
        status: 'ERROR',
        success: false,
        error: error.message
      });
    }

    // Analyze results
    const allFailed = testResults.every(r => !r.success);
    const has401 = testResults.some(r => r.status === 401);
    const has403 = testResults.some(r => r.status === 403);

    let diagnosis = '';
    let solution = '';

    if (allFailed && has401) {
      diagnosis = 'TOKEN KHÔNG HỢP LỆ HOẶC HẾN';
      solution = 'Tạo token mới tại GitHub Settings > Developer settings > Personal access tokens';
    } else if (allFailed && has403) {
      diagnosis = 'TOKEN HẾN HẠN HOẶC KHÔNG ĐỦ QUYỀN';
      solution = 'Tạo token mới với đủ scopes (repo, user)';
    } else if (testResults.some(r => r.success)) {
      diagnosis = 'TOKEN VẪN HOẠT ĐỘNG';
      solution = 'Token hoạt động bình thường';
    }

    return NextResponse.json({
      tokenAnalysis: {
        length: githubToken.length,
        format: isClassicToken ? 'classic' : isFineGrainedToken ? 'fine-grained' : 'unknown',
        isValidFormat: isClassicToken || isFineGrainedToken
      },
      testResults: testResults,
      diagnosis: diagnosis,
      solution: solution,
      recommendations: {
        createNewToken: 'https://github.com/settings/tokens',
        requiredScopes: ['repo', 'user:email'],
        tokenTypes: {
          classic: 'ghp_...',
          fineGrained: 'github_pat_...'
        }
      }
    });

  } catch (error: any) {
    console.error("❌ [GITHUB TOKEN CỦA CINEVERSE THÔNG BÁO] Lỗi:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
