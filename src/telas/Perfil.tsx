import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { acoes, useEstado } from '@/nucleo/estado';
import { CAMINHOS } from '@/conteudo/caminhos';
import { rotaDoEstado } from '@/conteudo';
import { andamento, nosDaRota } from '@/nucleo/rota';
import { diaLocal, reais } from '@/nucleo/formato';
import { semanaMarcada, semanasNoRitmo } from '@/nucleo/ritmo';
import { vozDisponivel } from '@/nucleo/som';
import { Icone } from '@/ui/Icone';
import { Conta } from './Conta';

function Chave({ rotulo, dica, ligada, aoMudar }: { rotulo: string; dica?: string; ligada: boolean; aoMudar: (v: boolean) => void }) {
  return (
    <button className="ajuste" role="switch" aria-checked={ligada} onClick={() => aoMudar(!ligada)}>
      <span>
        <b>{rotulo}</b>
        {dica && <small>{dica}</small>}
      </span>
      <i className={`chave${ligada ? ' ligada' : ''}`} />
    </button>
  );
}

export function Perfil() {
  const e = useEstado();
  const navegar = useNavigate();
  const [confirmar, setConfirmar] = useState(false);
  const hoje = diaLocal();
  const a = andamento(nosDaRota(rotaDoEstado(e), e), e.ajustes.metaSemanal);
  const semana = semanaMarcada(e.dias, hoje);
  const feitos = semana.filter((d) => d.feito).length;
  const p = e.perfil!;

  return (
    <div className="tela sem-barra">
      <div className="coluna pilha-g">
        <header className="pilha surge">
          <button className="botao-icone" onClick={() => navegar('/rota')} aria-label="Voltar para a rota">
            <Icone nome="voltar" />
          </button>
          <p className="rotulo">Você</p>
          <h1 className="titulo">{p.nome || 'Seu perfil'}</h1>
          {p.sonho && <p className="suave">“{p.sonho}”</p>}
        </header>

        <section className="cartao pilha surge-2">
          <div>
            <p className="rotulo">Ritmo desta semana</p>
            <b className="titulo-2">
              {feitos} de {e.ajustes.metaSemanal} dias
            </b>
          </div>
          <div className="dias claro larga">
            {semana.map((d, i) => (
              <i key={d.dia} className={`${d.feito ? 'feito' : ''}${d.hoje ? ' hoje' : ''}`}>
                {'STQQSSD'[i]}
              </i>
            ))}
          </div>
          <div className="campo-passos">
            <span className="cr-rotulo">
              <b>Minha meta por semana</b>
              <small>Quem falha um dia não perde nada. O que conta é fechar a semana.</small>
            </span>
            <span className="cp-controle">
              <button onClick={() => acoes.ajustar((x) => { x.metaSemanal = Math.max(1, x.metaSemanal - 1); })} aria-label="Diminuir a meta">
                −
              </button>
              <output className="numero">{e.ajustes.metaSemanal} dias</output>
              <button onClick={() => acoes.ajustar((x) => { x.metaSemanal = Math.min(7, x.metaSemanal + 1); })} aria-label="Aumentar a meta">
                +
              </button>
            </span>
          </div>
          <div className="rota-numeros">
            <div>
              <strong className="numero">{a.feitas}</strong>
              <span>paradas feitas</span>
            </div>
            <div>
              <strong className="numero">{a.missoesFeitas}</strong>
              <span>missões cumpridas</span>
            </div>
            <div>
              <strong className="numero">{semanasNoRitmo(e.dias, e.ajustes.metaSemanal, hoje)}</strong>
              <span>semanas no ritmo</span>
            </div>
          </div>
        </section>

        <section className="pilha surge-3">
          <h2 className="titulo-2">Sua rota</h2>
          <div className="cartao plano pilha">
            <div className="linha-h">
              <span className="caminho-icone">
                <Icone nome={e.caminho ? CAMINHOS[e.caminho].icone : 'mapa'} tamanho={24} />
              </span>
              <div>
                <b>{e.caminho ? CAMINHOS[e.caminho].nome : 'Sem caminho'}</b>
                <p className="pequeno suave">Destino: {reais(p.meta)} por mês</p>
              </div>
            </div>
            <Link className="botao claro fino" to="/caminhos">
              Trocar de caminho
            </Link>
            <Link className="botao claro fino" to="/partida">
              Refazer o ponto de partida
            </Link>
            <p className="pequeno suave">Trocar de caminho ou recalcular não apaga o que você já concluiu.</p>
          </div>
        </section>

        <section className="pilha">
          <h2 className="titulo-2">Ajustes</h2>
          <div className="cartao plano ajustes">
            <Chave rotulo="Sons" dica="Toques curtos de acerto e de chegada" ligada={e.ajustes.som} aoMudar={(v) => acoes.ajustar((x) => { x.som = v; })} />
            {vozDisponivel() && <Chave rotulo="Ouvir as aulas" dica="O aparelho lê cada tela em voz alta" ligada={e.ajustes.voz} aoMudar={(v) => acoes.ajustar((x) => { x.voz = v; })} />}
            <div className="ajuste">
              <span>
                <b>Aparência</b>
              </span>
              <div className="ferr-abas tres" role="radiogroup" aria-label="Aparência">
                {(['auto', 'claro', 'escuro'] as const).map((t) => (
                  <button key={t} role="radio" aria-checked={e.ajustes.tema === t} className={e.ajustes.tema === t ? 'ativa' : ''} onClick={() => acoes.ajustar((x) => { x.tema = t; })}>
                    {t === 'auto' ? 'Auto' : t === 'claro' ? 'Clara' : 'Escura'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pilha">
          <h2 className="titulo-2">Seus dados</h2>
          <div className="cartao plano pilha">
            <Conta />
            {confirmar ? (
              <>
                <p>
                  <b>Apagar tudo?</b> Paradas, missões, ganhos e a maleta somem deste aparelho. Não dá para desfazer.
                </p>
                <div className="linha-h">
                  <button className="botao claro fino" onClick={() => setConfirmar(false)}>
                    Cancelar
                  </button>
                  <button className="botao fino perigo" onClick={() => { acoes.recomecar(); navegar('/', { replace: true }); }}>
                    Apagar tudo
                  </button>
                </div>
              </>
            ) : (
              <button className="botao-texto perigo-texto" onClick={() => setConfirmar(true)}>
                Apagar tudo e recomeçar
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
