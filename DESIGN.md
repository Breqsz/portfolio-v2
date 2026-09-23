# Design — Portfólio V2

Sistema visual do conceito **Evidência**: um portfólio que prova com trabalho, não com adjetivos. Estratégia e público em `PRODUCT.md`.

## Cena

Um recrutador abre o link numa tarde de escritório, num monitor claro, entre reuniões, e decide em oito segundos se encaminha. Por isso o fundo é claro e a primeira tela é declaração e resumo ao mesmo tempo. A noite, quando o engenheiro lê com calma, está no capítulo escuro do Carga.

## Cor

Estratégia **comprometida com um sinal**: papel quase neutro, tinta grafite e um laranja-vermelhão que marca ação, destaque e o bloco de contato (drench). Tokens em `app/globals.css` (`@theme`), todos em OKLCH.

| Token | Valor | Papel |
|---|---|---|
| `bg` | oklch(0.975 0.003 45) | Papel |
| `surface` | oklch(0.945 0.004 45) | Faixas alternadas, painéis |
| `line` | oklch(0.87 0.005 45) | Filetes |
| `ink` / `ink-2` / `ink-3` | 0.20 / 0.44 / 0.54 | Texto: principal, apoio, metadado (≥ 4,5:1) |
| `signal` | oklch(0.62 0.186 42) · #dd5403 | Destaque grande, drench, marcas. **Nunca texto pequeno sobre papel** (3,7:1) |
| `signal-strong` | oklch(0.52 0.156 42) | Texto e links em laranja sobre papel (5,5:1) |
| `night` / `night-2` / `night-line` | 0.17 / 0.215 / 0.32 | Capítulo escuro e simulador |
| `plate` | #030302 | Preto medido nos cantos do retrato — o topo do crachá é essa placa, e a foto sai dela sem borda |
| `badge` | oklch(0.992 0.002 45) | O cartão do crachá: um passo mais claro que o papel, para ler como objeto sobre a página |
| `state-*` | verde / âmbar / laranja | Só os estados do simulador (cabe · apertada · sem margem), sempre com ícone e rótulo |

Colisões evitadas de propósito: navy + azul elétrico + menta (dsguilherme), preto puro + amarelo #F5B400 (Prumo), navy + crimson #AE251C (Hold). O laranja fica a 13° de matiz do crimson da Hold e a 22° do laranja da Amazon.

## Tipografia

- **Sofia Sans Extra Condensed 800** — display: título da Hero (maiúsculas), ganchos dos capítulos, nome do case, números de validação, 404. Condensada porque a massa visual de uma grotesca a 6rem cabe em duas palavras sem estourar no celular.
- **Sofia Sans** — todo o resto. Mesma superfamília: contraste por largura e peso, não por gênero.
- Escala: `xs` 13 · `sm` 15 · `base` 17 · `lg` 19→23 · `xl` 24→34 · `2xl` 36→60 · `3xl` 44→84 · `hero` 76→152 (px). Números sempre com `tabular-nums`.
- Títulos de seção (Trajetória, Capacidades, O trabalho) em Sofia Sans bold 2xl; ganchos em condensada 3xl. Nenhum eyebrow em caixa alta por seção.

## Layout

Grade de 12 colunas, `max-width` 90rem, calha `clamp(1.25rem, 4vw, 4rem)`. Cada capítulo tem direção própria:

1. **Hero** — papel. À esquerda (8 col.), declaração, os três fatos numa linha corrida e as ações — tudo dentro da primeira dobra a 900 px de altura, com a faixa dos 4 cases logo abaixo; à direita (4 col.), o **crachá de acesso** pendurado no cordão, que desce do cabeçalho: topo em placa preta com o retrato, corpo em cartão com nome, função, "nível de acesso: a definir por você" e um Code 39 real (`lib/code39.ts`). No celular o texto vem primeiro e o crachá desce depois, com cordão curto.
2. **Carga** — noite; texto fixo à esquerda, simulador à direita.
3. **Hold** — papel; capturas grandes, grade escalonada.
4. **NeuroRace** — superfície; invertido, captura mobile sobreposta.
5. **AutoFix** — papel; sem tela pública, o "teto" tipográfico é a imagem.
6. **Contato** — drench laranja, texto em tinta (4,6:1).

Capturas sem moldura de dispositivo: borda de 1 px e mais nada. Raio 0 em mídia e botões — a única exceção é o crachá, que é objeto físico e tem os cantos de um cartão (16 px).

## Movimento

Um único momento orquestrado: a entrada da Hero (linhas do título sobem dentro de máscara, o crachá cai do cordão e passa a balançar ±1,5° pelo topo do cordão). O resto é feedback (sublinhado que cresce, seta que desliza) e, onde há suporte nativo, mídia que se abre ao entrar na tela (`animation-timeline: view()`, sem JavaScript). Curvas ease-out expo/quart; saída mais rápida que entrada. `prefers-reduced-motion` desliga tudo. Sem biblioteca de motion — nenhuma animação aqui paga o peso de uma.

## Componentes

`SiteHeader` · `LangSwitch` (bandeira + sigla + nome para leitor de tela; links reais) · `Hero` · `Badge` (crachá) · capítulos em `components/home/chapters.tsx` · `CargaSimulator` (modelo em `lib/carga-model.ts`, testado por propriedade) · `FlowDiagram` (lista ordenada; tracejado = planejado) · `Ceiling` · `MediaFrame` · partes do case em `components/case/case-parts.tsx` · `Contact` · `SiteFooter`.
