import type { Metadata } from 'next';
import DuerpWorkshop from '../../duerp-workshop';

export const metadata: Metadata = {
  title: 'Analyse différenciée et DUERP-CSE — Les ateliers du CSE',
  description: 'Un atelier guidé pour analyser les risques des femmes et des hommes et rédiger une proposition de DUERP-CSE.',
  openGraph: {
    title: 'Analyse différenciée et DUERP-CSE',
    description: 'De la situation de travail réelle au rapport PDF : identifiez, analysez, cotez et formalisez les risques.',
    images: [],
  },
  twitter: {
    title: 'Analyse différenciée et DUERP-CSE',
    description: 'Un atelier pratique en cinq étapes pour les élus du CSE.',
    images: [],
  },
};

export default function DuerpWorkshopPage() {
  return <DuerpWorkshop />;
}
