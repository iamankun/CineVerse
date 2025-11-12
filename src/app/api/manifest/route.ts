import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import packageJson from "@/../package.json";

export async function GET(request: NextRequest) {
  try {
    // Read the static manifest.json file
    const manifestPath = path.join(process.cwd(), "public", "manifest.json");
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    // Get version from package.json for cache busting
    const version = packageJson.version;

    // Add version query parameter to all icon URLs for cache busting
    if (manifest.icons && Array.isArray(manifest.icons)) {
      manifest.icons = manifest.icons.map((icon: any) => {
        // Remove existing version param to avoid duplication
        const baseSrc = icon.src.split('?')[0];
        // Ensure icon path starts with / to make it absolute
        const absoluteSrc = baseSrc.startsWith('/') ? baseSrc : `/${baseSrc}`;
        return {
          ...icon,
          src: `${absoluteSrc}?v=${version}`,
        };
      });
    }

    // Add version to manifest for tracking
    manifest.version = version;

    // Return manifest with proper headers
    return new NextResponse(JSON.stringify(manifest, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/manifest+json",
        // Force revalidation on every request
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error serving manifest:", error);
    return NextResponse.json(
      { error: "Failed to load manifest" },
      { status: 500 }
    );
  }
}
