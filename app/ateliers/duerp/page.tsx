import type { Metadata } from 'next';
import DuerpWorkshop from '../../duerp-workshop';

export const metadata: Metadata = {
  title: 'Construire une ligne DUERP — Les ateliers du CSE',
  description: 'Un atelier pédagogique guidé pour partir du travail réel, identifier le risque et le danger, puis calculer le risque brut et le risque résiduel.',
  openGraph: {
    title: 'Construire une ligne DUERP',
    description: 'Du travail réel au tableau DUERP : un parcours pas à pas pour les élus en formation.',
    images: [],
  },
  twitter: {
    title: 'Construire une ligne DUERP',
    description: 'Un atelier pratique pour comprendre l’identification, la cotation et le risque résiduel.',
    images: [],
  },
};

export default function DuerpWorkshopPage() {
  return <DuerpWorkshop />;
}
