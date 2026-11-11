import { useState } from 'react';
import { confirmarCodigo, pedirCodigo, sair, useConta } from '@/nucleo/nuvem';
import { Icone } from '@/ui/Icone';

/** O bloco de conta do perfil: entrar com e-mail e código, e o estado da cópia na nuvem. */
export function Conta() {
  const conta = useConta();
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  if (conta.situacao === 'desligada') {
    return <p className="pequeno suave">Tudo o que você faz aqui fica guardado neste aparelho. Se você limpar os dados do navegador ou trocar de celular, o progresso não vai junto.</p>;
  }
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

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setOcupado(true);
    setAviso(null);
    if (etapa === 'email') {
      const erro = await pedirCodigo(email);
      if (erro) setAviso(erro);
      else setEtapa('codigo');
    } else {
      const erro = await confirmarCodigo(email, codigo);
      if (erro) setAviso(erro);
    }
    setOcupado(false);
  };

  return (
    <form className="pilha" onSubmit={enviar}>
      <p>
        <b>Guarde o seu progresso em uma conta.</b>
      </p>
      <p className="pequeno suave">Hoje ele está só neste aparelho. Com a conta, você troca de celular sem perder nada. Só pedimos o e-mail.</p>
      {etapa === 'email' ? (
        <input id="conta-email" className="campo" type="email" inputMode="email" autoComplete="email" required placeholder="seu@email.com" value={email} onChange={(ev) => setEmail(ev.target.value)} aria-label="Seu e-mail" />
      ) : (
        <>
          <p className="pequeno">
            Mandei um código para <b>{email}</b>. Digite os números aqui, ou toque no link do e-mail.
          </p>
          <input id="conta-codigo" className="campo numero" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6,8}" placeholder="000000" value={codigo} onChange={(ev) => setCodigo(ev.target.value.replace(/\D/g, '').slice(0, 8))} aria-label="Código recebido por e-mail" />
        </>
      )}
      {aviso && <p className="norte-falha">{aviso}</p>}
      <button className="botao fino" type="submit" disabled={ocupado}>
        {ocupado ? 'Um instante…' : etapa === 'email' ? 'Receber o código' : 'Entrar'}
      </button>
      {etapa === 'codigo' && (
        <button type="button" className="botao-texto" onClick={() => { setEtapa('email'); setCodigo(''); setAviso(null); }}>
          Usar outro e-mail
        </button>
      )}
    </form>
  );
}
