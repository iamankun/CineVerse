// Environment variables
const IS_BROWSER = typeof window !== "undefined";
const IS_SERVER = !IS_BROWSER;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const IS_TEST = process.env.NODE_ENV === "test";

// Storage keys
const DISCLAIMER_STORAGE_KEY = "disclaimer-agreed";
const ADS_WARNING_STORAGE_KEY = "ads-warning-seen";
const LIBRARY_STORAGE_KEY = "bookmarks";
const SEARCH_HISTORY_STORAGE_KEY = "search-histories";

// Others
const ITEMS_PER_PAGE = 20;
const SpacingClasses = {
  main: "px-3 py-8 sm:px-5",
  reset: "-mx-3 -my-8 sm:-mx-5",
};

// reCAPTCHA constants (2024-2025 requirements)
const RECAPTCHA = {
  MIN_TOKEN_LENGTH: 300, // Minimum for all reCAPTCHA versions
  MAX_TOKEN_LENGTH: 15000, // Support for v3 Enterprise (~12k chars)
  VERIFY_ENDPOINT: 'https://www.google.com/recaptcha/api/siteverify',
  TOKEN_EXPIRY_MS: 2 * 60 * 1000, // 2 minutes
} as const;

// Exports
export {
  IS_BROWSER,
  IS_SERVER,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
  DISCLAIMER_STORAGE_KEY,
  ADS_WARNING_STORAGE_KEY,
  LIBRARY_STORAGE_KEY,
  SEARCH_HISTORY_STORAGE_KEY,
  ITEMS_PER_PAGE,
  SpacingClasses,
  RECAPTCHA,
};
