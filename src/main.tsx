import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import './estilo/base.css';
import './estilo/telas.css';
import './estilo/mapa.css';
import './estilo/aula.css';
import { App } from './App';
import { iniciarNuvem } from './nucleo/nuvem';

/* No arquivo único (prévia sem servidor) as rotas ficam só na memória: não há servidor para devolver o index,
   e o arquivo pode estar dentro de uma moldura que não deixa mexer no endereço. */
const Roteador = import.meta.env.MODE === 'unico' ? MemoryRouter : BrowserRouter;

void iniciarNuvem();

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <Roteador>
      <App />
    </Roteador>
  </StrictMode>,
);
