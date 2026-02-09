import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔥 [ENV-CHECK] Checking all environment variables...");
    
    // Check all GitHub related environment variables
    const envVars = {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? `${process.env.GITHUB_TOKEN.substring(0, 10)}...` : 'NOT_FOUND',
      GITHUB_OWNER: process.env.GITHUB_OWNER || 'NOT_FOUND',
      GITHUB_REPO: process.env.GITHUB_REPO || 'NOT_FOUND',
      VERCEL_DEPLOY_HOOK: process.env.VERCEL_DEPLOY_HOOK ? 'FOUND' : 'NOT_FOUND',
      NODE_ENV: process.env.NODE_ENV || 'NOT_FOUND',
      VERCEL: process.env.VERCEL || 'NOT_FOUND',
      VERCEL_ENV: process.env.VERCEL_ENV || 'NOT_FOUND'
    };

    console.log("🔥 [ENV-CHECK] Environment variables:", envVars);

    // Test GitHub token format
    const githubToken = process.env.GITHUB_TOKEN;
    let tokenValid = false;
    let tokenError = '';

    if (githubToken) {
      if (githubToken.startsWith('ghp_')) {
        tokenValid = true;
      } else if (githubToken.startsWith('github_pat_')) {
        tokenValid = true;
      } else {
        tokenError = 'Token format invalid - should start with ghp_ or github_pat_';
      }
    } else {
      tokenError = 'GITHUB_TOKEN not found';
    }

    // Test basic GitHub API call
    let apiTest = null;
    if (tokenValid && githubToken) {
      try {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'CineVerse-App'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          apiTest = {
            success: true,
            login: userData.login,
            name: userData.name
          };
        } else {
          const errorText = await response.text();
          apiTest = {
            success: false,
            status: response.status,
            error: errorText
          };
        }
      } catch (error: any) {
        apiTest = {
          success: false,
          error: error.message
        };
      }
    }

    return NextResponse.json({
      environment: envVars,
      tokenValidation: {
        hasToken: !!githubToken,
        isValid: tokenValid,
        error: tokenError,
        tokenLength: githubToken?.length || 0
      },
      apiTest: apiTest,
      recommendations: {
        tokenFormat: 'Should start with ghp_ (classic) or github_pat_ (fine-grained)',
        requiredVars: ['GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO'],
        optionalVars: ['VERCEL_DEPLOY_HOOK']
      }
    });

  } catch (error: any) {
    console.error("❌ [ENV-CHECK] Error:", error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
