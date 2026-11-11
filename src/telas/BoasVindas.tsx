import { Link } from 'react-router-dom';
import { useEstado } from '@/nucleo/estado';
import { Icone } from '@/ui/Icone';
import { Marca } from '@/ui/Marca';

function MapaCapa() {
  return (
    <svg className="capa-mapa" viewBox="0 0 360 250" role="img" aria-label="Uma rota do ponto de partida até a sua meta">
      <defs>
        <pattern id="capa-grade" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M30 0H0V30" fill="none" stroke="currentColor" strokeOpacity=".07" />
        </pattern>
      </defs>
      <rect width="360" height="250" rx="22" fill="var(--papel-2)" />
      <rect width="360" height="250" rx="22" fill="url(#capa-grade)" />
      <g fill="none" stroke="currentColor" strokeOpacity=".1" strokeWidth="1.2">
        <path d="M-10 70c60-30 110 20 170-6s120-50 210-18" />
        <path d="M-10 110c70-34 120 26 180-2s110-46 200-20" />
        <path d="M-10 196c80-22 130 24 190 4s100-40 190-22" />
      </g>
      <path className="capa-rota" d="M48 202C92 204 104 150 150 148s58 44 104 30 36-84 68-112" fill="none" stroke="var(--rota)" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12" />
      <g className="capa-ponto p1">
        <circle cx="48" cy="202" r="13" fill="var(--cartao)" stroke="var(--tinta)" strokeWidth="2.5" />
        <circle cx="48" cy="202" r="4.5" fill="var(--tinta)" />
        <text x="48" y="232" textAnchor="middle">Você hoje</text>
      </g>
      <g className="capa-ponto p2">
        <circle cx="150" cy="148" r="13" fill="var(--ouro-claro)" stroke="#8a651c" strokeWidth="2.5" />
        <text x="150" y="153" textAnchor="middle" className="cifra">R$</text>
        <text x="150" y="124" textAnchor="middle">Primeiro real</text>
      </g>
      <g className="capa-ponto p3">
        <circle cx="254" cy="178" r="11" fill="var(--cartao)" stroke="var(--tinta-3)" strokeWidth="2.5" />
        <text x="254" y="210" textAnchor="middle">Clientes fixos</text>
      </g>
      <g className="capa-ponto p4">
        <path d="M322 66V28" stroke="var(--tinta)" strokeWidth="3" strokeLinecap="round" />
        <path d="M322 29h-30l7 9-7 9h30Z" fill="var(--barro)" />
        <circle cx="322" cy="66" r="5" fill="var(--tinta)" />
        <text x="282" y="64" textAnchor="end">Sua meta</text>
      </g>
    </svg>
  );
}

export function BoasVindas() {
  const e = useEstado();
  return (
    <div className="tela sem-barra capa">
      <div className="coluna pilha-g">
        <header className="surge">
          <Marca />
        </header>
        <div className="surge-2">
          <MapaCapa />
        </div>
        <div className="pilha surge-2">
          <h1 className="titulo capa-titulo">Um GPS para você ganhar o seu próprio dinheiro.</h1>
          <p className="suave capa-sub">Você diz de onde está saindo. A gente traça a rota: uma parada curta por dia, do primeiro real até a sua meta.</p>
        </div>
        <ul className="capa-lista surge-3">
          <li>
            <span className="capa-icone"><Icone nome="relogio" /></span>
            <div>
              <b>Paradas de 5 minutos</b>
              <span>No celular, no seu tempo. Você age em cada uma, não fica só lendo.</span>
            </div>
          </li>
          <li>
            <span className="capa-icone"><Icone nome="bandeira" /></span>
            <div>
              <b>Missões no mundo real</b>
              <span>Cada trecho termina com uma ação fora da tela, com gente de verdade.</span>
            </div>
          </li>
          <li>
            <span className="capa-icone"><Icone nome="norte" /></span>
            <div>
              <b>Um mentor que conhece a sua rota</b>
              <span>O Norte tira dúvidas, treina conversas com você e revisa o que você escreve.</span>
            </div>
          </li>
        </ul>
        <div className="pilha surge-3">
          <Link className="botao" to={e.perfil ? '/caminhos' : '/partida'}>
            {e.perfil ? 'Continuar de onde parei' : 'Marcar meu ponto de partida'}
            <Icone nome="seta" tamanho={20} />
          </Link>
          <p className="pequeno suave capa-nota">Leva 3 minutos. Não precisa de cadastro para começar.</p>
        </div>
      </div>
    </div>
  );
}
