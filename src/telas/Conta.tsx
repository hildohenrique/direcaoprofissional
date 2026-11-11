import { useState } from 'react';
import { confirmarCodigo, entrarComSenha, pedirCodigo, sair, useConta } from '@/nucleo/nuvem';
import { Icone } from '@/ui/Icone';

/** O bloco de conta do perfil: entrar com senha ou com código por e-mail, e o estado da cópia na nuvem. */
export function Conta() {
  const conta = useConta();
  const [modo, setModo] = useState<'senha' | 'codigo'>('codigo');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const soNoAparelho = 'Tudo o que você faz aqui fica guardado neste aparelho. Se você limpar os dados do navegador ou trocar de celular, o progresso não vai junto.';
  if (conta.situacao === 'desligada') return <p className="pequeno suave">{soNoAparelho}</p>;
  if (conta.situacao === 'carregando') return <p className="pequeno suave">Conferindo a sua conta…</p>;

  if (conta.situacao === 'dentro') {
    const texto = { parada: 'Cópia na nuvem ligada.', enviando: 'Salvando na sua conta…', 'em-dia': 'Progresso salvo na sua conta.', erro: 'Não consegui salvar agora. Tento de novo na próxima mudança.' }[conta.copia];
    return (
      <>
        <div className="linha-h">
          <span className={`conta-selo${conta.copia === 'erro' ? ' erro' : ''}`}>
            <Icone nome={conta.copia === 'erro' ? 'relogio' : 'escudo'} tamanho={20} />
          </span>
          <div>
            <b>{conta.email}</b>
            <p className="pequeno suave">{texto}</p>
          </div>
        </div>
        <p className="pequeno suave">Entre com o mesmo e-mail em outro aparelho para continuar de onde parou.</p>
        <button className="botao claro fino" onClick={() => void sair()}>
          Sair da conta
        </button>
      </>
    );
  }

  /* enquanto o cadastro não abre, só quem já tem conta consegue entrar */
  const fechado = conta.cadastroAberto === false;
  const comSenha = modo === 'senha' || fechado;

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setOcupado(true);
    setAviso(null);
    let erro: string | null;
    if (comSenha && !esperandoCodigo) erro = await entrarComSenha(email, senha);
    else if (!esperandoCodigo) {
      erro = await pedirCodigo(email);
      if (!erro) setEsperandoCodigo(true);
    } else erro = await confirmarCodigo(email, codigo);
    setAviso(erro);
    setOcupado(false);
  };

  return (
    <form className="pilha" onSubmit={enviar}>
      {fechado ? (
        <>
          <p className="pequeno suave">{soNoAparelho}</p>
          <p className="pequeno">
            <b>Já tem uma conta?</b> Entre para guardar o progresso nela. O cadastro de contas novas ainda não está aberto.
          </p>
        </>
      ) : (
        <>
          <p>
            <b>Guarde o seu progresso em uma conta.</b>
          </p>
          <p className="pequeno suave">Hoje ele está só neste aparelho. Com a conta, você troca de celular sem perder nada. Só pedimos o e-mail.</p>
        </>
      )}

      {!esperandoCodigo && <input id="conta-email" className="campo" type="email" inputMode="email" autoComplete="email" required placeholder="seu@email.com" value={email} onChange={(ev) => setEmail(ev.target.value)} aria-label="Seu e-mail" />}
      {comSenha && !esperandoCodigo && <input id="conta-senha" className="campo" type="password" autoComplete="current-password" required placeholder="Sua senha" value={senha} onChange={(ev) => setSenha(ev.target.value)} aria-label="Sua senha" />}
      {esperandoCodigo && (
        <>
          <p className="pequeno">
            Mandei um código para <b>{email}</b>. Digite os números aqui, ou toque no link do e-mail.
          </p>
          <input id="conta-codigo" className="campo numero" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6,8}" placeholder="000000" value={codigo} onChange={(ev) => setCodigo(ev.target.value.replace(/\D/g, '').slice(0, 8))} aria-label="Código recebido por e-mail" />
        </>
      )}
      {aviso && <p className="norte-falha">{aviso}</p>}
      <button className="botao fino" type="submit" disabled={ocupado}>
        {ocupado ? 'Um instante…' : esperandoCodigo || comSenha ? 'Entrar' : 'Receber o código'}
      </button>
      {esperandoCodigo ? (
        <button type="button" className="botao-texto" onClick={() => { setEsperandoCodigo(false); setCodigo(''); setAviso(null); }}>
          Usar outro e-mail
        </button>
      ) : (
        !fechado && (
          <button type="button" className="botao-texto" onClick={() => { setModo(modo === 'senha' ? 'codigo' : 'senha'); setAviso(null); }}>
            {modo === 'senha' ? 'Entrar com código por e-mail' : 'Já tenho senha'}
          </button>
        )
      )}
    </form>
  );
}
