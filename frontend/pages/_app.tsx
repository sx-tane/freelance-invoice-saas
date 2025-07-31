import type { AppProps } from 'next/app';

/**
 * Custom App component required for Next.js with TypeScript.  It simply
 * renders the current page.  Global styles could be imported here.
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}