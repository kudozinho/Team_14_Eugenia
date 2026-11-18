'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Pendant la démo, la liste se met à jour seule : le jury voit l'annonce de l'agent apparaître.
export default function EnDirect({ secondes = 5 }: { secondes?: number }) {
  const router = useRouter();
  const [maj, setMaj] = useState<string>('');
  useEffect(() => {
    const tic = () => {
      if (document.visibilityState !== 'visible') return;
      router.refresh();
      setMaj(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    const id = window.setInterval(tic, secondes * 1000);
    return () => window.clearInterval(id);
  }, [router, secondes]);
  return (
    <span className="en-direct" title={maj ? `Dernière mise à jour : ${maj}` : undefined}>
      <span className="point" aria-hidden="true" /> En direct
    </span>
  );
}
