/**
 * Safe Promise utilities to avoid chaining cycles
 */

export function createDelayedPromise<T>(delay: number, value: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delay);
  });
}

export function createDelayedPromiseWithCallback<T>(
  delay: number, 
  executor: (resolve: (value: T) => void, reject: (reason?: any) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        executor(resolve, reject);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

export function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> {
  return operation().catch(error => {
    console.error(errorMessage || 'Async operation failed:', error);
    throw error;
  });
}

/**
 * Safe image loading utility
 */
export function loadImageSafely(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve(img);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    // Set src after attaching event handlers
    img.src = src;
  });
}

/**
 * Safe timeout utility
 */
export function createSafeTimeout(callback: () => void, delay: number): NodeJS.Timeout {
  return setTimeout(callback, delay);
}

/**
 * Safe requestAnimationFrame utility
 */
export function requestSafeAnimationFrame(callback: () => void): number {
  return requestAnimationFrame(callback);
}
