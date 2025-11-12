import packageJson from "@/../package.json";

/**
 * Application version from package.json
 * Use this instead of hardcoding version numbers
 */
export const APP_VERSION = packageJson.version;

/**
 * Get formatted version string with prefix
 * @param prefix - Prefix to add before version (default: "v")
 * @returns Formatted version string (e.g., "v1.3.2")
 */
export function getVersionString(prefix: string = "v"): string {
  return `${prefix}${APP_VERSION}`;
}
