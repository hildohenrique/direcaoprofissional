import { useEffect } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEstado } from './nucleo/estado';
import { diaLocal } from './nucleo/formato';
import { pendentes } from './nucleo/revisao';
import { nosDaRota } from './nucleo/rota';
import { rotaDoEstado } from './conteudo';
import { Icone } from './ui/Icone';
import { BoasVindas } from './telas/BoasVindas';
import { Diagnostico } from './telas/Diagnostico';
import { Caminhos } from './telas/Caminhos';
import { Rota } from './telas/Rota';
import { Aula } from './telas/Aula';
import { Missoes, TelaMissao } from './telas/Missoes';
import { Revisao } from './telas/Revisao';
import { Norte } from './telas/Norte';
import { Maleta, TelaFerramenta } from './telas/Maleta';
import { Perfil } from './telas/Perfil';

function Casca() {
  const e = useEstado();
  const abertas = nosDaRota(rotaDoEstado(e), e).filter((n) => n.tipo === 'missao' && n.estado === 'livre').length;
  const revisar = pendentes(e.revisao, diaLocal()).length;
  const classe = ({ isActive }: { isActive: boolean }) => (isActive ? 'ativo' : '');
  return (
    <>
      <Outlet />
      <nav className="nav" aria-label="Principal">
        <div className="nav-dentro">
          <NavLink to="/rota" className={classe}>
            <Icone nome="mapa" />
            Rota
            {revisar > 0 && <span className="bolinha">{revisar}</span>}
          </NavLink>
          <NavLink to="/missoes" className={classe}>
            <Icone nome="bandeira" />
            Missões
            {abertas > 0 && <span className="bolinha">{abertas}</span>}
          </NavLink>
          <NavLink to="/norte" className={classe}>
            <Icone nome="norte" />
            Norte
          </NavLink>
          <NavLink to="/maleta" className={classe}>
            <Icone nome="maleta" />
            Maleta
          </NavLink>
        </div>
      </nav>
    </>
  );
}

/** Quem ainda não marcou o ponto de partida ou não escolheu o caminho volta para o começo. */
function SoComRota() {
  const e = useEstado();
  if (!e.perfil) return <Navigate to="/" replace />;
  if (!e.caminho) return <Navigate to="/caminhos" replace />;
  return <Outlet />;
}

export function App() {
  const e = useEstado();
  const local = useLocation();

  useEffect(() => {
    const raiz = document.documentElement;
    const aplicar = () => {
      /* quando o app está embutido em outra página, ela pode indicar o tema em data-theme */
      const deFora = raiz.getAttribute('data-theme');
      const tema = e.ajustes.tema !== 'auto' ? e.ajustes.tema : deFora === 'dark' ? 'escuro' : deFora === 'light' ? 'claro' : null;
      if (tema) raiz.setAttribute('data-tema', tema);
      else raiz.removeAttribute('data-tema');
    };
    aplicar();
    const olho = new MutationObserver(aplicar);
    olho.observe(raiz, { attributes: true, attributeFilter: ['data-theme'] });
    return () => olho.disconnect();
  }, [e.ajustes.tema]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [local.pathname]);

  return (
    <Routes>
      <Route path="/" element={e.perfil && e.caminho ? <Navigate to="/rota" replace /> : <BoasVindas />} />
      <Route path="/partida" element={<Diagnostico />} />
      <Route path="/caminhos" element={e.perfil ? <Caminhos /> : <Navigate to="/" replace />} />
      <Route element={<SoComRota />}>
        <Route element={<Casca />}>
          <Route path="/rota" element={<Rota />} />
          <Route path="/missoes" element={<Missoes />} />
          <Route path="/norte" element={<Norte />} />
          <Route path="/maleta" element={<Maleta />} />
        </Route>
        <Route path="/parada/:id" element={<Aula />} />
        <Route path="/missao/:id" element={<TelaMissao />} />
        <Route path="/revisao" element={<Revisao />} />
        <Route path="/maleta/:id" element={<TelaFerramenta />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
