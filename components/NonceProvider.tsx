import { headers } from 'next/headers';
import { ReactNode } from 'react';

interface NonceProviderProps {
  children: ReactNode;
}

export async function NonceProvider({ children }: NonceProviderProps) {
  const headersList = await headers();
  const nonce = headersList.get('x-csp-nonce') || '';

  return (
    <>
      {children}
      {/* Inject nonce into window for client-side scripts */}
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `window.__CSP_NONCE__ = ${JSON.stringify(nonce)};`,
        }}
      />
    </>
  );
}

// Hook to get nonce (for client components)
export function getNonce(): string {
  if (typeof window !== 'undefined') {
    return (window as any).__CSP_NONCE__ || '';
  }
  return '';
}

export async function getServerNonce(): Promise<string> {
  const headersList = await headers();
  return headersList.get('x-csp-nonce') || '';
}
