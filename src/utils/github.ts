/**
 * GitHub API utilities for committing JSON files
 */

interface GitHubCommitOptions {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
  token: string;
}

// Commit file to GitHub
export async function commitToGitHub(options: GitHubCommitOptions): Promise<any> {
  const {
    owner,
    repo,
    path,
    content,
    message,
    branch = 'main',
    token,
  } = options;

  try {
    // Get current file SHA (if exists)
    let sha: string | undefined;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }
    } catch {
      // File doesn't exist, will create new
      console.log('Tệp không tồn tại, tạo tệp mới');
    }

    // Create or update file
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content).toString('base64'),
          branch,
          ...(sha && { sha }),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi API GitHub: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Lỗi khi ủy thác lên GitHub:', error);
    throw error;
  }
}

// Trigger Vercel deployment
export async function triggerVercelDeploy(
  deployHookUrl: string
): Promise<void> {
  try {
    const response = await fetch(deployHookUrl, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Không thể kích hoạt triển khai Vercel');
    }
    
    console.log('Kích hoạt triển khai Vercel thành công');
  } catch (error) {
    console.error('Lỗi khi kích hoạt triển khai Vercel:', error);
    throw error;
  }
}
