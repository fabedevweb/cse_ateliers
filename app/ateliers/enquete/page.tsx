import type { Metadata } from 'next';
import InvestigationWorkshop from '../../investigation-workshop';

export const metadata: Metadata = {
  title: 'Enquête après un accident du travail — Les ateliers du CSE',
  description: 'Un atelier guidé pour recueillir les faits après un accident du travail ou une maladie professionnelle, construire l’arbre des causes et produire un rapport PowerPoint.',
  openGraph: { title: 'Enquête AT/MP et arbre des causes', description: 'Recueillez les faits, reliez les causes et exportez le rapport de l’enquête.', images: [] },
  twitter: { title: 'Enquête AT/MP et arbre des causes', description: 'Recueillez les faits, reliez les causes et exportez le rapport de l’enquête.', images: [] },
};

export default function InvestigationPage() {
  return <InvestigationWorkshop />;
}
