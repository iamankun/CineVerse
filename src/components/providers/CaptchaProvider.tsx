"use client";

import { env } from "@/utils/env";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

export default function CaptchaProvider({ children }: { children: React.ReactNode }) {
  const siteKey = env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.warn("Google reCAPTCHA site key is not configured. Captcha will be disabled.");
    return <>{children}</>;
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      {children}
    </GoogleReCaptchaProvider>
  );
}
