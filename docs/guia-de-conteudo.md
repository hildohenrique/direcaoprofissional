# Guia de conteúdo

Como escrever paradas (aulas) para a Direção Profissional. O arquivo `src/conteudo/trechos/partida.ts` é o modelo: leia antes de escrever. Os tipos estão em `src/nucleo/tipos.ts`. O teste `testes/conteudo.test.ts` confere quase tudo o que está aqui.

## Para quem escrevemos

Pessoas de 14 a 70 anos, no Brasil, que querem ganhar o próprio dinheiro e estão começando do zero ou quase. Muitas leem pouco, estudam no celular, no ônibus ou no fim de um dia cansativo. Algumas nunca venderam nada. Outras trabalham há 20 anos e se sentem perdidas. Ninguém aqui é burro: falta informação e falta alguém que explique sem enrolar.

## A voz

- Fale com "você". Frases curtas. Uma ideia por frase.
- Palavra do dia a dia. Se um termo técnico for necessário, explique na mesma frase em que ele aparece ("faturamento, que é tudo o que entra").
- Concreto sempre: nome de pessoa, cidade, valor em reais, dia da semana. "Jéssica cobrava R$ 25" ensina mais do que "muitos profissionais cobram pouco".
- Respeito. Sem tom de coach, sem gritar, sem ponto de exclamação em série, sem diminutivo infantil, sem bronca. Quem erra uma pergunta recebe a explicação, nunca "errou!".
- Honestidade. Nada de promessa de dinheiro rápido ou garantido. Mostre o lado difícil junto com o lado bom. Os números dos exemplos precisam ser realistas para uma cidade média brasileira.
- Diga o que é, de forma direta. Evite a construção "não é X, é Y".
- Não use travessão (—). Use ponto, vírgula ou dois-pontos.
- Emoji só dentro de mensagens simuladas de WhatsApp, e pouco.

## Como uma parada ensina

Cada parada ensina **uma** ideia que muda uma ação. Leva de 5 a 7 minutos e tem de 9 a 14 batidas.

1. **Abra com gente ou com um palpite.** A primeira batida é uma `historia` ou uma `estimativa` ou `escolha`. Nunca uma definição. A pessoa precisa querer saber o que vem depois.
2. **Peça o palpite antes de dar a resposta.** A `estimativa` e a `escolha` vêm antes da explicação. Errar o palpite e ver a resposta é o que mais fixa. É essa surpresa que prende a atenção, e ela é honesta: vem de aprender algo de verdade.
3. **No máximo duas batidas de leitura seguidas** (`fala` ou `historia`). Depois, a pessoa age.
4. **Pelo menos 4 interações, de 3 tipos diferentes.** Varie.
5. **Use os números e as palavras da própria pessoa.** Sempre que fizer sentido, inclua uma `ferramenta` (ela calcula com os dados da pessoa) ou um `escrever` (ela produz algo que vai para a maleta).
6. **Todo retorno explica o porquê**, tanto da opção certa quanto das erradas. As opções erradas são erros que gente de verdade comete, nunca piadas.
7. **Feche com `resumo`** de 3 pontos, que são frases para a pessoa repetir para alguém.
8. **`hoje`**: uma ação de até 10 minutos, específica, que dá para fazer hoje sem gastar dinheiro.
9. **`revisao`**: 2 ou 3 perguntas sobre o essencial. Elas voltam dias depois (revisão espaçada). Pergunte o que importa lembrar daqui a um mês.

A história do personagem costuma ter duas batidas: o problema no começo e a virada no meio ou no fim. A virada é pequena e crível (R$ 120, três clientes), nunca um milagre.

## Tipos de batida

| tipo | para quê | cuidados |
|---|---|---|
| `historia` | abrir, dar rosto ao problema | até 300 caracteres; use o elenco fixo |
| `fala` | a ideia central, dita de forma direta | título de até 60 caracteres; texto de até 260; até 4 pontos |
| `escolha` | decidir em uma situação real | 2 a 4 opções, uma certa; `semCerta: true` para perguntas sobre a própria pessoa |
| `estimativa` | palpite numérico antes da conta | a resposta precisa ser exata e alcançável com o `passo`; mostre a conta no retorno |
| `ordenar` | sequência de passos | 3 a 5 itens, escritos **na ordem certa** (o app embaralha) |
| `separar` | distinguir dois conceitos | 4 a 6 itens em dois grupos; nomes de grupo com até 22 caracteres |
| `conversa` | treinar o que dizer no WhatsApp ou ao vivo | a outra pessoa começa; 1 a 3 decisões; cada decisão com uma resposta `boa`, e `ok` ou `ruim` realistas; `resposta` é o que a outra pessoa diz depois |
| `ferramenta` | calcular com os números da pessoa | veja a lista abaixo; use só onde o trecho pede |
| `escrever` | produzir uma frase ou lista própria | `chave` única em minúsculas com hífen; sempre com `exemplo` |
| `resumo` | fechar | exatamente 3 pontos |

Em `estimativa`, escolha `min`, `max` e `passo` de modo que a régua tenha de 8 a 80 posições e a resposta não fique no meio exato nem nas pontas.

## Cenas

A cena é o desenho que acompanha a batida. Use quando ajuda a entender, não em todas. Opções: `pessoa` (personagem com balão de até 60 caracteres), `numero`, `barras` (2 a 5), `fatias` (o que tem dentro de um valor, 2 a 5 partes, com `tom` custo, voce, lucro ou neutro), `escada` (3 a 5 degraus), `balanca`, `comparar` (dois cartões, tom bom ou ruim), `celular` (até 4 linhas; app zap, insta ou nota), `lista` (até 5), `trilha` (3 a 5 pontos), `calendario`, `icone`.

Batidas interativas normalmente não precisam de cena.

## Elenco

Use sempre as mesmas pessoas (em `src/conteudo/personagens.ts`). Mantenha os fatos já contados.

- **Dona Cida**, 58, Feira de Santana (BA). Ex-cozinheira de restaurante, vende marmitas. Começou com 5 para os pedreiros de uma obra. Vende 12 por dia a R$ 20.
- **Rafa**, 19, Campina Grande (PB). Edita vídeos curtos para lojas, no celular. Primeiro dinheiro: R$ 120 da loja de açaí.
- **Jéssica**, 27, Frutal (MG). Manicure. Tinha vergonha de oferecer. Mandou a frase para 20 conhecidas e 4 marcaram.
- **Seu Antônio**, 46, Londrina (PR). 20 anos de fábrica, demitido. Faz pequenos reparos, R$ 60 a visita simples. A filha divulgou no grupo do bairro.
- **Bia**, 16, Belém (PA). Estudante. Vende brigadeiro na escola e procura vaga de Jovem Aprendiz.
- **Marcos**, 34, Guarulhos (SP). Carteira assinada em um depósito há 8 anos, salário de R$ 2.300. Controla estoque, usa planilha, treina os novatos.
- **Luciana**, 41, Goiânia (GO). Vende roupas pela internet, começou com desapego do próprio armário.
- **Dona Neuza**, 63, Pelotas (RS). Costureira aposentada, dá aulas de costura.
- **Davi**, 23, Fortaleza (CE). Estuda programação à noite e trabalha de dia em uma loja.

## Ferramentas

- `custo-do-mes`: a pessoa soma os gastos do mês por categoria.
- `valor-da-hora`: (custo do mês + quanto quer que sobre) ÷ (dias de trabalho × horas com cliente por dia).
- `preco-minimo`: serviço = tempo × valor da hora + material; produto = custo + margem.
- `meta-de-clientes`: meta do mês ÷ valor médio por cliente = clientes por mês e por semana.
- `lista-quente`: lista de até 20 conhecidos para oferecer, com o estado de cada um.
- `oferta`: monta a oferta em uma frase (para quem, qual resultado, como, por quanto).
- `plano-da-semana`: uma ação pequena para cada dia da semana.

## Fatos do Brasil (conferidos em novembro de 2026)

Valores mudam todo ano. Ao citar, diga o ano e mande conferir na fonte oficial.

- Salário mínimo em 2026: R$ 1.621.
- MEI: limite de faturamento de R$ 81 mil por ano (média de R$ 6.750 por mês). Boleto mensal (DAS) entre R$ 82 e R$ 87 em 2026. Abrir é gratuito e feito no Portal do Empreendedor (gov.br/mei). Sites que cobram para abrir são intermediários. Dá acesso a aposentadoria por idade, auxílio por incapacidade e salário-maternidade, com carência. Quem recebe seguro-desemprego, BPC ou outro benefício deve conferir antes de abrir, porque pode perder o benefício.
- Trabalho de menores: proibido antes dos 16, exceto como aprendiz a partir dos 14. Jovem Aprendiz: 14 a 24 anos. Estágio: a partir dos 16, para quem está estudando.
- Golpes comuns: comprovante de Pix falso (só entregue depois de o dinheiro aparecer na conta), vaga que cobra taxa, curso ou exame, "renda extra" que paga por recrutar pessoas, boleto falso de MEI.
- Não cite estatísticas que você não possa provar. Prefira contas feitas com os números do exemplo.
- Não dê conselho jurídico, médico ou de investimento. Para regras que variam por cidade (vigilância sanitária, alvará), diga para conferir na prefeitura.

## Antes de entregar

```bash
npx vitest run testes/conteudo.test.ts
```

```bash
npx tsc --noEmit
```

Depois leia cada parada em voz alta, do começo ao fim, como se fosse a pessoa do outro lado. Corte o que não muda uma ação.
