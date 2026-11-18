import type { Classe } from '@/lib/catalogue';

const CLASSES: Classe[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const DPE = ['#009c6d', '#52b153', '#78bd76', '#f4e70f', '#f0b40f', '#eb8235', '#d7221f'];
const GES = ['#a4dbf8', '#8cb4d3', '#7792b1', '#5d6d90', '#4d5272', '#3a3955', '#281b35'];

// Étiquette énergie (DPE) ou climat (GES) : obligatoire dans une annonce immobilière.
export default function Energie({ type, classe }: { type: 'dpe' | 'ges'; classe?: Classe }) {
  const couleurs = type === 'dpe' ? DPE : GES;
  const titre = type === 'dpe' ? 'Performance énergétique (DPE)' : 'Émissions de gaz à effet de serre (GES)';
  return (
    <figure className="energie" aria-label={`${titre} : ${classe ? `classe ${classe}` : 'non renseignée'}`}>
      <figcaption>{titre}</figcaption>
      {classe ? (
        <ol>
          {CLASSES.map((c, k) => (
            <li key={c} className={c === classe ? 'actif' : ''} style={{ ['--c' as string]: couleurs[k], ['--w' as string]: `${38 + k * 9}%` }}>
              <span>{c}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="energie-vide">Non renseigné par l'agence</p>
      )}
    </figure>
  );
}
