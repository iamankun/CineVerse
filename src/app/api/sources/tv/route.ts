import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { uploadToBlob } from "@/utils/storage";
import { commitToGitHub, triggerVercelDeploy } from "@/utils/github";
import { env } from "@/utils/env";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.tmdbId || !data.title || !data.seasons) {
      return NextResponse.json(
        { error: "Missing required fields: tmdbId, title, seasons" },
        { status: 400 }
      );
    }

    // Check if at least one season exists
    if (Object.keys(data.seasons).length === 0) {
      return NextResponse.json(
        { error: "At least one season is required" },
        { status: 400 }
      );
    }

    const fileName = `${data.tmdbId}.json`;
    const relativePath = `public/sources/ChuongTrinhTV/${fileName}`;
    const jsonContent = JSON.stringify(data, null, 2);

    // Strategy 1: Try Vercel Blob (Production)
    if (env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blobPath = `sources/ChuongTrinhTV/${fileName}`;
        const blobUrl = await uploadToBlob(
          blobPath,
          data,
          env.BLOB_READ_WRITE_TOKEN
        );
        console.log(`✅ Saved to Vercel Blob: ${blobUrl}`);

        // Strategy 2: Commit to GitHub (Backup)
        if (env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO) {
          try {
            await commitToGitHub({
              owner: env.GITHUB_OWNER,
              repo: env.GITHUB_REPO,
              path: relativePath,
              content: jsonContent,
              message: `Update TV show ${data.tmdbId}: ${data.title}`,
              token: env.GITHUB_TOKEN,
            });
            console.log(`✅ Committed to GitHub`);

            // Trigger Vercel rebuild (optional)
            if (env.VERCEL_DEPLOY_HOOK) {
              await triggerVercelDeploy(env.VERCEL_DEPLOY_HOOK);
              console.log(`✅ Triggered Vercel deployment`);
            }
          } catch (githubError) {
            console.error("GitHub commit failed:", githubError);
          }
        }

        return NextResponse.json({
          success: true,
          message: "Saved to Vercel Blob + GitHub",
          blobUrl,
          tmdbId: data.tmdbId,
        });
      } catch (blobError) {
        console.error("Vercel Blob failed:", blobError);
        // Fall through to file system
      }
    }

    // Strategy 3: Fallback to File System (Development)
    const sourcesPath = path.join(process.cwd(), "public", "sources", "ChuongTrinhTV");
    const filePath = path.join(sourcesPath, fileName);

    // Ensure directory exists
    await fs.mkdir(sourcesPath, { recursive: true });

    // Write JSON file
    await fs.writeFile(filePath, jsonContent, "utf-8");
    console.log(`✅ Saved to file system: ${filePath}`);

    // Also commit to GitHub if available
    if (env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO) {
      try {
        await commitToGitHub({
          owner: env.GITHUB_OWNER,
          repo: env.GITHUB_REPO,
          path: relativePath,
          content: jsonContent,
          message: `Update TV show ${data.tmdbId}: ${data.title}`,
          token: env.GITHUB_TOKEN,
        });
        console.log(`✅ Committed to GitHub`);
      } catch (githubError) {
        console.error("GitHub commit failed:", githubError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "TV show source saved successfully",
      tmdbId: data.tmdbId 
    });
  } catch (error) {
    console.error("Error saving TV show source:", error);
    return NextResponse.json(
      { error: "Failed to save TV show source" },
      { status: 500 }
    );
  }
}
