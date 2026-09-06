import type { Metadata } from 'next';
import InspectionWorkshop from '../../inspection-workshop';

export const metadata: Metadata = {
  title: 'Préparer et réaliser une inspection — Les ateliers du CSE',
  description: 'Un atelier guidé pour préparer une inspection CSE en 2027, recueillir les observations de terrain et produire un rapport PDF.',
  openGraph: { title: 'Préparer et réaliser une inspection CSE', description: 'Préparez le terrain, consignez vos observations et créez un rapport professionnel.', images: [] },
  twitter: { title: 'Préparer et réaliser une inspection CSE', description: 'Préparez le terrain, consignez vos observations et créez un rapport professionnel.', images: [] },
};

export default function InspectionPage() {
  return <InspectionWorkshop />;
}
