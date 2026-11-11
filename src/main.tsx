import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/manrope';
import './estilo/base.css';
import './estilo/telas.css';
import './estilo/mapa.css';
import './estilo/aula.css';
import { App } from './App';

/* No arquivo único (prévia sem servidor) as rotas vivem depois do #, porque não há servidor para devolver o index. */
const Roteador = import.meta.env.MODE === 'unico' ? HashRouter : BrowserRouter;

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <Roteador>
      <App />
    </Roteador>
  </StrictMode>,
);
