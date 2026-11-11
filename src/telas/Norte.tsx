import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { acoes, lerEstado, useEstado } from '@/nucleo/estado';
import { perguntarAoNorte, type FalhaNorte } from '@/ia/norte';
import { andamento, nosDaRota } from '@/nucleo/rota';
import { rotaDoEstado } from '@/conteudo';
import { primeiroNome } from '@/nucleo/formato';
import { fraseDaOferta } from '@/nucleo/contas';
import { Icone } from '@/ui/Icone';

const FALHAS: Record<FalhaNorte, string> = {
  'sem-ia': '',
  rede: 'Não consegui falar com o Norte. Confira a sua internet e tente de novo.',
  limite: 'Muitas mensagens em pouco tempo. Espere um minuto e mande de novo.',
  login: 'Entre na sua conta para conversar com o Norte.',
  falha: 'O Norte tropeçou agora. Tente de novo em instantes.',
  recusa: 'O Norte não pode ajudar com esse pedido. Tente perguntar de outro jeito, sobre a sua rota.',
};

export function Norte() {
  const e = useEstado();
  const local = useLocation();
  const veioDe = local.state as { pedido?: string; voltar?: string } | null;
  const pedidoInicial = veioDe?.pedido ?? '';
  const [texto, setTexto] = useState(pedidoInicial);
  const [rascunho, setRascunho] = useState<string | null>(null);
  const [falha, setFalha] = useState<FalhaNorte | null>(null);
  const fim = useRef<HTMLDivElement>(null);
  const aborto = useRef<AbortController | null>(null);
  const ocupado = rascunho !== null;

  const a = andamento(nosDaRota(rotaDoEstado(e), e), e.ajustes.metaSemanal);
  const nome = primeiroNome(e.perfil?.nome ?? '');
  const emprego = e.caminho === 'emprego';
  const sugestoes = [
    'O que eu faço hoje?',
    emprego ? 'Quero treinar uma entrevista de emprego. Faça o papel da entrevistadora.' : 'Quero treinar: faça o papel de um cliente que diz que está caro.',
    emprego ? 'Me ajuda a melhorar o meu currículo' : fraseDaOferta(e.maleta) ? 'O que você melhoraria na minha oferta?' : 'Me ajuda a escrever a minha oferta',
    'Estou travado e sem ânimo.',
  ];

  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' });
  }, [e.norte.length, rascunho]);
  useEffect(() => () => aborto.current?.abort(), []);

  const enviar = async (mensagem: string) => {
    const limpa = mensagem.trim();
    if (!limpa || ocupado) return;
    setTexto('');
    setFalha(null);
    acoes.falaNorte('voce', limpa);
    setRascunho('');
    let acumulado = '';
    aborto.current = new AbortController();
    const erro = await perguntarAoNorte(
      lerEstado().norte.map(({ de, texto: t }) => ({ de, texto: t })),
      lerEstado(),
      (pedaco) => {
        acumulado += pedaco;
        setRascunho(acumulado);
      },
      aborto.current.signal,
    );
    if (acumulado.trim()) acoes.falaNorte('norte', acumulado.trim());
    setRascunho(null);
    setFalha(erro);
  };

  return (
    <div className="tela norte">
      <div className="coluna norte-coluna">
        <header className="norte-topo surge">
          <span className="norte-avatar">
            <Icone nome="norte" tamanho={26} />
          </span>
          <div>
            <h1 className="titulo-2">Norte</h1>
            <p className="pequeno suave">Seu mentor na rota. Usa inteligência artificial e pode errar: confira números e regras.</p>
          </div>
          {e.norte.length > 0 && (
            <button className="botao-icone" onClick={() => acoes.limparNorte()} aria-label="Apagar a conversa">
              <Icone nome="lixeira" tamanho={20} />
            </button>
          )}
        </header>

        {veioDe?.voltar && (
          <Link className="faixa-revisao" to={veioDe.voltar}>
            <Icone nome="voltar" tamanho={18} />
            <span>
              <b>Voltar para a parada</b>, do ponto onde você parou
            </span>
          </Link>
        )}

        <div className="norte-conversa" aria-live="polite">
          {e.norte.length === 0 && !ocupado && (
            <div className="fala-norte surge-2">
              <p>
                {nome ? `Oi, ${nome}.` : 'Oi.'} Eu conheço a sua rota: você fez {a.feitas} de {a.total} paradas
                {a.proxima ? ` e a próxima é "${a.proxima.parada.titulo}"` : ''}.
              </p>
              <p>Posso tirar dúvidas, escrever mensagens com você e treinar conversas difíceis antes de elas acontecerem. Por onde começamos?</p>
            </div>
          )}
          {e.norte.map((m, i) => (
            <div key={`${m.em}-${i}`} className={m.de === 'voce' ? 'fala-voce' : 'fala-norte'}>
              {m.texto.split(/\n{2,}/).map((par, j) => (
                <p key={j}>{par}</p>
              ))}
            </div>
          ))}
          {ocupado && (
            <div className="fala-norte">
              {rascunho ? (
                rascunho.split(/\n{2,}/).map((par, j) => <p key={j}>{par}</p>)
              ) : (
                <p className="pensando" aria-label="O Norte está escrevendo">
                  <i />
                  <i />
                  <i />
                </p>
              )}
            </div>
          )}
          {falha === 'sem-ia' && (
            <div className="cartao plano norte-desligado">
              <b>O Norte ainda não está ligado aqui.</b>
              <p>Esta versão do aplicativo está rodando sem a conexão com a inteligência artificial. As paradas, as missões e a maleta funcionam normalmente.</p>
              {a.proxima && (
                <Link className="botao fino" to={`/parada/${a.proxima.id}`}>
                  Ir para a próxima parada
                </Link>
              )}
            </div>
          )}
          {falha && falha !== 'sem-ia' && <p className="norte-falha">{FALHAS[falha]}</p>}
          <div ref={fim} />
        </div>

        {e.norte.length === 0 && !ocupado && !pedidoInicial && (
          <div className="norte-sugestoes surge-3">
            {sugestoes.map((s) => (
              <button key={s} className="sugestao" onClick={() => enviar(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        className="norte-entrada"
        onSubmit={(ev) => {
          ev.preventDefault();
          void enviar(texto);
        }}
      >
        <div className="coluna norte-entrada-dentro">
          <textarea
            className="campo"
            rows={1}
            value={texto}
            maxLength={1500}
            placeholder="Escreva para o Norte"
            aria-label="Mensagem para o Norte"
            onChange={(ev) => setTexto(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' && !ev.shiftKey) {
                ev.preventDefault();
                void enviar(texto);
              }
            }}
          />
          <button className="botao enviar" type="submit" disabled={!texto.trim() || ocupado} aria-label="Enviar">
            <Icone nome="seta" tamanho={22} traco={2.4} />
          </button>
        </div>
      </form>
    </div>
  );
}
