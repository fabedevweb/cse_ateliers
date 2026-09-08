import type { Metadata } from 'next';
import PlanActionWorkshop from '../../plan-action-workshop';

export const metadata: Metadata = {
  title: 'Construire un plan d’action — Les ateliers du CSE',
  description: 'Un atelier pédagogique pour reprendre un risque du DUERP, examiner les neuf principes de prévention et organiser une action concrète, datée et vérifiable.',
  openGraph: {
    title: 'Construire un plan d’action de prévention',
    description: 'Du risque identifié au pilotage de l’action : responsable, moyens, échéances et indicateurs.',
    images: [],
  },
  twitter: {
    title: 'Construire un plan d’action de prévention',
    description: 'Un atelier pratique fondé sur les neuf principes généraux de prévention.',
    images: [],
  },
};

export default function PlanActionWorkshopPage() {
  return <PlanActionWorkshop />;
}
