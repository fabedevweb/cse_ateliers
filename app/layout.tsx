import type { Metadata } from 'next';
import './globals.css';
import PageTransitionLoader from './page-transition-loader';

export const metadata: Metadata = {
  title: 'Les ateliers du CSE | Formation pratique',
  description: 'Des ateliers pédagogiques en ligne pour analyser des situations de travail et accompagner les élus du CSE.',
  openGraph: { title: 'Les ateliers du CSE | Formation pratique', description: 'Des cas pratiques et des activités interactives pour les élus du CSE.', type: 'website', images: [{ url: '/og.png', width: 1760, height: 920, alt: 'Les ateliers du CSE — Construire un avis clair et argumenté' }] },
  twitter: { card: 'summary_large_image', title: 'Les ateliers du CSE | Formation pratique', description: 'Des cas pratiques et des activités interactives pour les élus du CSE.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><PageTransitionLoader />{children}</body></html>;
}
