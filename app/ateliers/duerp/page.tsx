import type { Metadata } from 'next';
import DuerpWorkshop from '../../duerp-workshop';

export const metadata: Metadata = {
  title: 'Construire un DUERP et son plan d’action — Les ateliers du CSE',
  description: 'Un atelier pédagogique guidé pour construire une ligne DUERP, calculer le risque résiduel et bâtir un plan d’action à partir des neuf principes généraux de prévention.',
  openGraph: {
    title: 'Construire un DUERP et son plan d’action',
    description: 'Du risque librement choisi au plan d’action : un parcours pas à pas pour les élus en formation.',
    images: [],
  },
  twitter: {
    title: 'Construire un DUERP et son plan d’action',
    description: 'Un atelier pratique pour comprendre la cotation, le risque résiduel et les neuf principes de prévention.',
    images: [],
  },
};

export default function DuerpWorkshopPage() {
  return <DuerpWorkshop />;
}
