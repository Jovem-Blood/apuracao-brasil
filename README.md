# Apuração Brasil

Mapa interativo da apuração presidencial brasileira de 2026, primeiro turno. Interface em português e responsiva, com as 27 UFs, ranking nacional e por UF, margem entre os líderes, votos brancos/nulos e atualização a cada 30 segundos enquanto a página está visível.

## Executar

Node.js 22.13 ou superior. O projeto usa Next.js, React e TypeScript, com a API executada em Node.js na Vercel. Nenhum serviço pago, chave do TSE ou banco de dados é necessário.

```sh
corepack enable
pnpm install
pnpm dev
```

Em ambientes fora do ChatGPT, `pnpm dev` inicia o servidor local. `pnpm build` produz a versão de produção em `.next/`; `pnpm start` serve essa versão.

## Arquivos principais

- `app/page.tsx`: interface e polling, seleção de estado, mapa SVG e ranking.
- `app/globals.css`: tema escuro e layouts responsivos.
- `app/api/results/route.ts`: proxy HTTP do TSE, cache de 25 segundos por instância e na CDN da Vercel, até seis buscas simultâneas, timeout e fallback por UF.
- `lib/election.ts`: normalização tipada, URLs e apresentação numérica.
- `data/map.json`: geometria simplificada dos estados e posições de rótulos.
- `data/tse-snapshot.json`: leitura real dos 28 endpoints durante a construção, usada apenas quando a atualização não está disponível. A interface marca dados anteriores e mostra a data/hora da fonte.

## Dados oficiais

Eleição `6257`, cargo `0001`, primeiro turno de 2026. Para Brasil e cada UF:

```
https://resultados.tse.jus.br/oficial/ele2026/6257/dados/{uf}/{uf}-c0001-e006257-u.json
```

`uf` é `br`, `rj`, `sp` etc., em minúsculas. Os 28 endpoints foram consultados com sucesso durante a implementação. A fonte nacional é independente da soma das UFs e inclui o resultado nacional fornecido pelo TSE, inclusive votos contabilizados no exterior.

Os horários `dg`/`hg` são mostrados como publicados pelo TSE, em Brasília. A hora da consulta não substitui a hora da fonte. Uma resposta anterior não substitui uma versão mais recente já recebida. Resultados por UF não constituem um snapshot transacional único: cada região pode ter um horário de publicação diferente.

Campos utilizados: `s.pst`, `s.st`, `s.ts`; `v.vv`, `v.vb`, `v.tvn`, `v.tv`; candidatos em `carg[].agr[].par[].cand[]`, com `n`, `nmu`, `vap`, `pvapn`/`pvap` e `e`.

## Interpretação do mapa

A cor representa o candidato com mais votos contabilizados na UF. Empate no primeiro lugar ou ausência de votos fica neutro. A intensidade cresce com a diferença percentual entre primeiro e segundo, saturando em 35 pontos percentuais. Cores são convenções visuais do projeto; não indicam vitória projetada. Hachuras indicam falha na consulta mais recente da UF. A situação de eleito só aparece quando informada pelo campo `e` do TSE.

## Limites desta versão

Esta versão acompanha o estado atual. Não há coleta contínua de histórico, replay, dados municipais ou previsão de vencedor. Ao fechar o app, o polling para. O cache em memória não é armazenamento durável; o snapshot de construção é o último recurso caso não exista leitura mais recente em memória. Os endpoints são públicos, mas não há SLA de disponibilidade. Para outra eleição ou turno, atualize a URL e a validação do normalizador.

## Cartografia

Geometrias derivadas do conjunto `brazil-states.geojson` do projeto Click That 'Hood / Code for America, com simplificação para exibição. Fonte: https://github.com/codeforamerica/click_that_hood/blob/master/public/data/brazil-states.geojson . Uso ilustrativo, sem finalidade cadastral.

## Verificações

O projeto foi verificado com TypeScript e compilação de produção. A normalização foi confrontada com as 28 respostas reais do TSE, incluindo total de votos nominais, liderança, empates e estados sem votos.

## Publicação na Vercel

Projeto Next.js; Node.js 22; região gru1. Nenhuma variável de ambiente é necessária. Domínio desejado: `apuracao.opeixoto.com`.

```sh
pnpm dlx vercel login
pnpm dlx vercel --prod --scope thiagos-projects-5418414d
```

Depois de publicar, adicione o domínio nas configurações do projeto e configure o registro DNS exatamente como informado pela Vercel.

## Licença

Distribuído sob a licença [MIT](LICENSE).
