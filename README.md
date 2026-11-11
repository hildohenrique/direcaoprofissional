# Direção Profissional

Um GPS para quem quer ganhar o próprio dinheiro começando do zero. A pessoa marca o ponto de partida, escolhe um caminho de renda e segue uma rota de aulas curtas e de ações no mundo real, com um mentor de inteligência artificial ao lado.

Feito para o Brasil, para o celular e para qualquer idade.

## Como a plataforma funciona

| Camada | O que é | Onde está no código |
|---|---|---|
| Ponto de partida | 10 perguntas sobre momento de vida, pressa, tempo, recursos e gostos. Ordena sete caminhos de renda e explica o porquê de cada um. | `src/telas/Diagnostico.tsx`, `src/nucleo/diagnostico.ts` |
| Rota | A mesma biblioteca de trechos em ordens diferentes. Quem precisa de dinheiro para já vai primeiro ao que gera o primeiro real; quem escolhe emprego não passa pelos trechos de clientes. | `src/nucleo/rota.ts`, `src/telas/Rota.tsx` |
| Parada | Aula de 5 a 7 minutos, feita de 9 a 14 batidas (telas). | `src/telas/Aula.tsx`, `src/aula/` |
| Missão | Ação fora da tela que fecha cada trecho, com relato do que aconteceu. | `src/telas/Missoes.tsx` |
| Maleta | Registro de ganhos, sete ferramentas com os números da pessoa, os textos que ela escreveu e as peças conquistadas. | `src/telas/Maleta.tsx`, `src/aula/ferramentas.tsx` |
| Norte | Mentor com Claude: conhece o perfil e o progresso, tira dúvidas, escreve mensagens e treina conversas. | `servidor/norte.ts`, `src/telas/Norte.tsx` |

### Por que as aulas são assim

A pergunta de origem era se vale a pena buscar "dopamina" enquanto a pessoa estuda. A resposta adotada: vale, desde que ela venha de progresso de verdade.

- **Palpite antes da resposta.** A pessoa chuta um número ou escolhe uma saída antes da explicação. A surpresa de errar por pouco é o que prende a atenção e o que mais fixa o conteúdo.
- **Agir a cada duas telas.** Nunca mais de duas batidas de leitura seguidas.
- **Os números e as palavras da própria pessoa.** Ferramentas e campos de escrita produzem algo que ela leva para a vida: o custo do mês, o preço mínimo, a frase de oferta.
- **Revisão espaçada.** Perguntas das paradas antigas voltam em 1, 3, 7, 16 e 35 dias.
- **Ritmo semanal, sem sequência diária.** A meta é aparecer alguns dias por semana. Quem falha um dia não perde nada.
- **A recompensa principal é fora do app.** O maior marco da plataforma é registrar o primeiro real ganho.

O que ficou de fora de propósito: pontos sem significado, recompensa aleatória, ranking, notificação de culpa.

As regras completas de escrita estão em [`docs/guia-de-conteudo.md`](docs/guia-de-conteudo.md), e o teste `testes/conteudo.test.ts` reprova a parada que não as segue.

## Conteúdo

13 trechos, 48 paradas, 13 missões.

- **Base:** Ponto de partida, Seu dinheiro, Primeiros clientes, Fazer crescer, Seguir em frente.
- **Caminhos:** Serviços com as mãos, Comida, Vender produtos, Trabalho digital, Ensinar o que sabe, Tecnologia, Emprego e carreira (dois trechos: Conseguir a vaga e Crescer no trabalho).

Para criar um trecho novo, adicione um arquivo em `src/conteudo/trechos/` exportando um `Trecho`. Ele entra na biblioteca sozinho; para aparecer em uma rota, inclua o id em `idsDaRota` (`src/nucleo/rota.ts`).

## Rodar

Precisa de Node 22 ou mais novo.

```bash
npm install
```

```bash
npm run dev
```

Abra o endereço que aparecer no terminal. Para o mentor Norte responder em desenvolvimento, copie `.env.example` para `.env` e preencha `ANTHROPIC_API_KEY`. Sem a chave, o resto do app funciona e o Norte avisa que está desligado.

Outros comandos:

```bash
npm run verificar
```

confere os tipos e roda os testes (núcleo, conteúdo e servidor do Norte).

```bash
npm run build
```

gera o site em `dist/`, com o service worker que faz o app abrir sem internet.

```bash
npm run build:unico
```

gera `dist-unico/index.html`, um arquivo só, para mostrar o app sem servidor (o Norte fica desligado nessa versão).

## Arquitetura

- **React 19 + Vite + TypeScript.** Sem biblioteca de componentes: o CSS está em `src/estilo/`, com as cores definidas uma vez em `base.css`. O mapa é papel à luz do dia; a aula é um palco escuro (`.palco`), que redefine as mesmas cores.
- **Salvo no aparelho, com conta opcional.** O estado inteiro (`src/nucleo/estado.ts`) fica no `localStorage`, em um objeto só, e o app funciona sem cadastro. Com as variáveis do Supabase, o perfil ganha login por e-mail com código, e o estado é copiado para a nuvem (`src/nucleo/nuvem.ts`). Ao entrar em outro aparelho, as duas cópias são juntadas sem perder conquistas (`src/nucleo/mesclar.ts`).
- **Núcleo sem interface.** `src/nucleo/` tem as regras (diagnóstico, rota, revisão, ritmo, contas) como funções puras, cobertas por testes.
- **Conteúdo como dados.** Cada parada é um objeto tipado. Os tipos estão em `src/nucleo/tipos.ts`.
- **Norte.** `servidor/norte.ts` é uma função `Request -> Response` que chama a API da Anthropic em streaming e devolve uma linha JSON por pedaço. Roda como função da Netlify (`netlify/functions/norte.ts`, em `/api/norte`) e dentro do Vite em desenvolvimento. O navegador nunca vê a chave.

## Publicar

O repositório está pronto para a Netlify (`netlify.toml`): comando `npm run build`, pasta `dist`, função em `netlify/functions`.

Variáveis de ambiente do site:

| Variável | Para quê |
|---|---|
| `ANTHROPIC_API_KEY` | Liga o Norte. |
| `NORTE_MODELO` | Opcional. Modelo do Norte (padrão `claude-opus-5-5`). |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Opcional. Ligam a conta e a cópia do progresso na nuvem. |
| `NORTE_EXIGE_LOGIN`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Opcional. Fazem o Norte só responder a quem estiver logado. |

Para ligar as contas em um projeto Supabase:

1. Rode a migração `supabase/migrations/20261111000000_estados.sql` (cria a tabela `estados`, com uma linha por pessoa e acesso só à própria linha).
2. Em Authentication, Email Templates, inclua `{{ .Token }}` no modelo "Magic Link", para o e-mail levar o código de 6 números além do link.
3. Em Authentication, URL Configuration, coloque o endereço do site em "Site URL".
4. Preencha as duas variáveis `VITE_SUPABASE_*` no site e publique de novo.

## O que ainda não existe

Estado desta versão, para ninguém ser pego de surpresa:

- **Contas ainda sem teste real.** O login e a cópia na nuvem estão escritos e a junção de aparelhos tem testes, mas nada disso rodou contra um projeto Supabase de verdade. Sem as variáveis, o progresso fica só no aparelho, e trocar de celular ou limpar o navegador perde tudo.
- **Venda.** Não há pagamento nem controle de acesso. Falta decidir o modelo (o que é gratuito, preço, assinatura ou compra única) e ligar o Stripe.
- **Norte em produção.** O servidor do mentor foi testado nos caminhos de recusa (sem chave, pedido inválido, login exigido), e a chamada real ao modelo ainda não foi exercitada com uma chave. O freio de uso atual é por instância e por endereço; antes de abrir ao público, exija login e limite por usuário. A verificação de login pelo Supabase está escrita e também não foi exercitada.
- **Menores de idade.** O app avisa sobre as regras de trabalho, mas não pede consentimento de responsável. Antes de vender para menores, resolver isso com a LGPD em vista.
- **Vídeo e narração.** As aulas são texto, desenho animado e interação, com leitura em voz alta pelo próprio aparelho. Não há vídeo gravado.
