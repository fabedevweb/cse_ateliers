import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Les ateliers du CSE | Rédiger un avis',
  description: 'Un atelier pédagogique en ligne pour analyser un cas fictif et rédiger un avis du CSE sur la mise à jour du DUERP.',
  openGraph: { title: 'Les ateliers du CSE | Rédiger un avis', description: 'Analysez un cas fictif et construisez un avis CSE clair et argumenté.', type: 'website', images: [{ url: '/og.png', width: 1760, height: 920, alt: 'Les ateliers du CSE — Construire un avis clair et argumenté' }] },
  twitter: { card: 'summary_large_image', title: 'Les ateliers du CSE | Rédiger un avis', description: 'Analysez un cas fictif et construisez un avis CSE clair et argumenté.', images: ['/og.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
