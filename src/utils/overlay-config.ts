/**
 * Overlay timing configuration
 * Read from chuyendong.json file
 */

interface OverlayConfig {
  ageRating: {
    initialDelay: number;
    expandDuration: number;
    repeatInterval: number;
    description: string;
  };
  watchingWithBrand: {
    initialDelay: number;
    showDuration: number;
    repeatInterval: number;
    animationDuration: number;
    description: string;
  };
  brandLogo: {
    alwaysVisible: boolean;
    logoPath: string | null;
    scale: number;
    description: string;
  };
  descriptions: {
    initialDelay: string;
    showDuration: string;
    expandDuration: string;
    repeatInterval: string;
    animationDuration: string;
  };
}

// Import the JSON config
import configData from '@/app/admin/chuyendong.json';

const config = configData as OverlayConfig;

export const ageRatingConfig = {
  initialDelay: config.ageRating.initialDelay,
  expandDuration: config.ageRating.expandDuration,
  repeatInterval: config.ageRating.repeatInterval,
};

export const watchingWithBrandConfig = {
  initialDelay: config.watchingWithBrand.initialDelay,
  showDuration: config.watchingWithBrand.showDuration,
  repeatInterval: config.watchingWithBrand.repeatInterval,
  animationDuration: config.watchingWithBrand.animationDuration,
};

export const brandLogoConfig = {
  alwaysVisible: config.brandLogo.alwaysVisible,
  logoPath: config.brandLogo.logoPath,
  scale: config.brandLogo.scale,
};

export default config;
