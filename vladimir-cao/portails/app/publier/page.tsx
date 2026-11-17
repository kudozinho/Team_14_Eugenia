import { notFound } from 'next/navigation';
import { portailCourant, photoActive } from '@/lib/portail';
import FormulaireC from './FormulaireC';

export const metadata = { title: 'Publier un bien' };

// Site C (niveaux 3 et 4) : 2 étapes, menu déroulant, case à cocher obligatoire, envoi d'une photo.
// PHOTO_ACTIVE=0 retire la photo (niveau 3, ou plan B si l'envoi de fichier bloque l'agent).
export default function PublierC() {
  if (portailCourant().code !== 'C') notFound();
  return (
    <>
      <h1>Publier un bien</h1>
      <p className="sous-titre">Deux étapes : le bien, puis la mise en ligne.</p>
      <FormulaireC photo={photoActive()} />
    </>
  );
}
