import { useState } from 'react';

export default function Home() {
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>LYVORIS GLOBAL ECOSYSTEM</h1>
      <p>Autonomna PWA platforma za globalni prenos novca i trgovinu</p>

      <div style={{ background: '#f0f4f8', padding: '20px', borderRadius: '8px', margin: '20px auto', maxWidth: '500px' }}>
        <h3>Pravna napomena</h3>
        <p style={{ fontSize: '12px', color: '#555' }}>
          Prihvatanjem uslova korišćenja potvrdjujete da nastupate kao nezavisan subjekt
          i snosite potpunu, samostalnu i isključivu pravnu, poresku i finansijsku
          odgovornost za sve transakcije i poslovanje putem platforme LYVORIS.
        </p>
      </div>
    </div>
  );
}
