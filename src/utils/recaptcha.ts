/**
 * reCAPTCHA v3 verification utilities
 * Only supports reCAPTCHA v3
 */

import { RECAPTCHA } from './constants';

export interface ReCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number; // v3 only
  action?: string; // v3 only
  'error-codes'?: string[];
}

export interface ReCaptchaVerificationOptions {
  secretKey: string;
  token: string;
  remoteIp?: string;
}

/**
 * Verify reCAPTCHA v3 token with Google API
 * Supports tokens up to 15,000 characters (v3)
 */
export async function verifyReCaptchaToken(options: ReCaptchaVerificationOptions): Promise<ReCaptchaVerifyResponse> {
  const { secretKey, token, remoteIp } = options;

  // Validate token length according to reCAPTCHA v3 requirements
  if (token.length < RECAPTCHA.MIN_TOKEN_LENGTH || token.length > RECAPTCHA.MAX_TOKEN_LENGTH) {
    return {
      success: false,
      'error-codes': ['invalid-input-response']
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const response = await fetch(RECAPTCHA.VERIFY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('reCAPTCHA v3 verification error:', error);
    return {
      success: false,
      'error-codes': ['network-error']
    };
  }
}

/**
 * Check if reCAPTCHA v3 token is valid based on length and format
 */
export function isValidReCaptchaToken(token: string | null | undefined): boolean {
  if (!token) return false;
  
  // Length validation according to reCAPTCHA v3 requirements
  return token.length >= RECAPTCHA.MIN_TOKEN_LENGTH && token.length <= RECAPTCHA.MAX_TOKEN_LENGTH;
}

/**
 * Get reCAPTCHA v3 token information
 */
export function getReCaptchaTokenInfo(token: string): {
  version: 'v3';
  isValid: boolean;
  length: number;
} {
  if (!token) {
    return {
      version: 'v3',
      isValid: false,
      length: 0
    };
  }
  
  const isValid = isValidReCaptchaToken(token);
  
  return {
    version: 'v3',
    isValid,
    length: token.length
  };
}

/**
 * Get reCAPTCHA version based on token characteristics
 * @deprecated Always returns 'v3' since we only support v3
 */
export function getReCaptchaVersion(token: string): 'v3' | 'unknown' {
  if (!token) return 'unknown';
  
  // v3 tokens are typically 1,000-3,000 characters
  if (token.length >= 1000 && token.length < 5000) return 'v3';
  
  return 'unknown';
}

/**
 * reCAPTCHA error codes mapping
 */
export const RECAPTCHA_ERROR_CODES = {
  'missing-input-secret': 'Secret key không được cung cấp',
  'invalid-input-secret': 'Secret key không hợp lệ',
  'missing-input-response': 'Token captcha không được cung cấp',
  'invalid-input-response': 'Token captcha không hợp lệ',
  'bad-request': 'Yêu cầu không hợp lệ',
  'timeout-or-duplicate': 'Token đã hết hạn hoặc đã được sử dụng',
  'network-error': 'Lỗi kết nối mạng',
} as const;

export type ReCaptchaErrorCode = keyof typeof RECAPTCHA_ERROR_CODES;
