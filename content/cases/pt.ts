import { images } from "./media";
import type { CaseBook } from "./types";

// Fonte de cada afirmação: brief verificado contra a Wiki em 2026-09-10.
// Números só com data e condição; o que não está registrado não aparece.
export const casesPt: CaseBook = {
  carga: {
    slug: "carga",
    name: "Carga",
    kind: "Estudo autoral · dados sintéticos",
    status: "study",
    year: "2026",
    role: "Autor único: pesquisa, recorte de produto, especificação, modelo físico, algoritmo, testes e interface.",
    hook: "A rota cabe. E a bateria?",
    problem:
      "Antes de a frota elétrica sair da base, alguém precisa saber se cada rota cabe na bateria de cada moto — e qual moto mandar para qual rota.",
    summary: {
      what: "Uma camada de decisão sobre rotas prontas: diz se cada rota cabe na bateria de cada moto e distribui as motos pelas rotas deixando o menor número possível de rotas sem margem.",
      did: "Tudo, do recorte ao teste: pesquisa de mercado, especificação, modelo de energia, alocação pelo algoritmo húngaro e uma interface estática que roda sem servidor.",
      proves:
        "Sei recortar um problema para não competir com ferramentas maduras, escolher a solução mais simples que resolve e provar com testes que ela é a certa.",
    },
    home: {
      lead: "Roteirizadores resolvem a ordem das paradas e ignoram a bateria. Software de frota elétrica cuida da recarga e não olha a rota. O Carga fica no meio: recebe rotas prontas e responde se cada uma cabe na bateria de cada moto.",
      facts: [
        "Num cenário sintético de 40 rotas e 40 motos, distribuir pela bateria de cada moto reduz as rotas sem margem de 32 para 19 — e 15 não fecham com moto nenhuma.",
        "Alocação pelo algoritmo húngaro: ótimo exato, em milissegundos, conferido contra enumeração exaustiva.",
        "Núcleo em TypeScript puro, no navegador, sem servidor: 431 testes unitários e 23 e2e.",
      ],
    },
    context: [
      "O mercado brasileiro de roteirizadores é saturado e resolve a sequência de paradas, mas ignora o estado de carga da bateria. O software de frota elétrica cuida da recarga e não olha a rota. A interseção — dado um conjunto de rotas prontas e uma frota elétrica, quais cabem na bateria de cada moto — não tem dono.",
      "O Carga ocupa esse espaço como estudo independente de logística elétrica de última milha, a partir de como operadores do setor descrevem publicamente o próprio planejamento: rotas por janela, densidade e autonomia da frota. O cenário tem 40 rotas sintéticas sobre a geografia real de Sorocaba (SP), com relevo e traçado viário pré-calculados.",
    ],
    constraints: [
      "Tinha de ser um link autoexplicativo: quem recebe não vai clonar repositório nem subir servidor.",
      "Tinha de continuar funcionando meses depois, sem servidor que hiberna nem cota que expira.",
      "Sem dado real de operação — a premissa é declarada numa página própria, não escondida.",
      "Dois leitores com tempos diferentes: três minutos para quem decide, trinta para o técnico.",
      "Gate de realidade antes de qualquer interface: se o modelo não reproduzisse consumo conhecido (25–45 Wh/km, 80–120 km de autonomia), o projeto parava ali.",
    ],
    decision: {
      chosen: "Uma camada de decisão sobre rotas que já existem.",
      discarded: "Construir um roteirizador que gera a melhor sequência de paradas.",
      why: "Roteirização tem anos de P&D de mercado, e o algoritmo raramente é o gargalo da entrega. Uma camada sobre rotas prontas agrega valor seja qual for a ferramenta que gera as rotas. O custo aceito: o produto depende de alguém fornecer essas rotas.",
    },
    secondary: [
      {
        title: "Algoritmo húngaro, não metaheurística",
        body: "Atribuir moto a rota tem ótimo exato e barato — O(n³), milissegundos para 150 rotas. Complexidade desnecessária lê como insegurança técnica. A inteligência mora na matriz de custo, e a otimalidade é conferida contra enumeração exaustiva.",
      },
      {
        title: "Núcleo puro no navegador, sem backend",
        body: "Custo zero, nada expira e o núcleo fica testável por propriedade. A fronteira entre núcleo e interface é garantida por lint e por teste, não por disciplina. O custo aceito é um teto de escala perto de 150 rotas.",
      },
      {
        title: "Corrigir a régua antes de afrouxar o número",
        body: "Um teste de latência media o WebGL emulado do CI, não a página. Em vez de relaxar o limite, ele virou três gates — nenhum afrouxado.",
      },
    ],
    architecture: {
      caption: "Tudo acontece no navegador. Não existe servidor.",
      frame: "Navegador",
      nodes: [
        { title: "Cenário pré-calculado", detail: "40 rotas sintéticas, traçado viário real e relevo, empacotados no build" },
        { title: "Modelo de energia", detail: "Wh por trecho: massa que cai a cada entrega, relevo, custo por parada, regeneração" },
        { title: "Simulador de rota", detail: "Curva de carga por par rota × moto; saúde da bateria medida ou estimada" },
        { title: "Alocador", detail: "Matriz de custo resolvida pelo algoritmo húngaro" },
        { title: "Comparação", detail: "Ordem de chegada contra viabilidade energética" },
        { title: "Interface estática", detail: "Comparativo, bancada com alavancas, curva de carga, mapa e premissas" },
      ],
      loop: "As alavancas da interface recalculam a alocação ao vivo.",
    },
    validation: [
      {
        value: "32 → 19",
        label: "rotas sem margem de bateria, de 40, mudando só a atribuição moto↔rota",
        when: "09/2026",
        condition: "Cenário sintético. 15 rotas não fecham com moto nenhuma: o ótimo consertou 13 das 17 consertáveis.",
      },
      {
        value: "100/100",
        label: "sementes inéditas melhoram com a alocação ótima, sem nenhuma regressão",
        when: "09/2026",
        condition: "Cenários sintéticos gerados por semente",
      },
      {
        value: "36,9 Wh/km",
        label: "consumo do modelo, dentro da faixa fixada antes de implementar (25–45 Wh/km)",
        when: "09/2026",
        condition: "Perfil de scooter urbana; nenhum teste afrouxado",
      },
      {
        value: "431 + 23",
        label: "testes unitários (com property-based) e e2e verdes",
        when: "09/2026",
        condition: "Execução local; o CI ainda não rodou nesta branch",
      },
      {
        value: "24–40 ms",
        label: "de INP no fluxo por teclado, sem throttle — 96–120 ms com CPU 4× mais lenta",
        when: "09/2026",
        condition: "Medido em máquina local",
      },
    ],
    limits: [
      "Não gera rotas. Não é TMS, rastreamento nem app de motorista.",
      "Não é implantação nem parceria com empresa nenhuma, e não usa dado real de operação.",
      "A saída é uma margem determinística de carga. Saída probabilística e agendamento de recarga estão desenhados, não implementados.",
      "Temperatura não entra no modelo. Há um tipo de veículo só, e uma rota por moto por dia.",
      "“32 → 19” é contagem de rotas num cenário sintético — não é economia nem impacto real.",
    ],
    learning:
      "Ao deixar o cenário mais realista, com menos motos que rotas, abri sem perceber um caminho em que o algoritmo vencia descartando as rotas difíceis — que não contavam como falha. O teste passava 8 de 8 pelo motivo errado. Fechei contando rota não atendida como falha e rodando duas configurações; a tese sobreviveu às duas.",
    stack: ["TypeScript", "Next.js 16 (export estático)", "React 19", "Tailwind 4", "MapLibre + PMTiles", "Vitest + fast-check", "Playwright + axe", "Lighthouse CI"],
    links: [],
    linksNote: "Repositório privado e site ainda não publicado. As telas abaixo são capturas do build.",
    media: [
      {
        src: images.carga.comparativo,
        alt: "Primeira dobra do Carga: 32 rotas sem margem na ordem de chegada contra 19 na viabilidade energética, com a grade das 40 rotas.",
        caption: "A primeira dobra responde em 30 segundos: mesma frota, mesmas rotas, outra atribuição.",
        device: "desktop",
      },
      {
        src: images.carga.bancada,
        alt: "Bancada do Carga: alavancas de reserva e carga de saída, a rota 14 descrita em texto, mapa da rota e curva de carga da bateria.",
        caption: "A bancada: duas alavancas recalculam a alocação inteira, ao vivo, no navegador.",
        device: "desktop",
      },
      {
        src: images.carga.premissas,
        alt: "Página de premissas do Carga: todos os números vêm de literatura pública e dados de fabricante.",
        caption: "A premissa na cara: nenhum dado de operação real, e o que mudaria com 30 dias de telemetria.",
        device: "desktop",
      },
      {
        src: images.carga.mobile,
        alt: "O Carga no celular, com o comparativo 32 contra 19 em uma coluna.",
        device: "mobile",
      },
    ],
    seo: {
      title: "Carga — viabilidade energética de rota",
      description:
        "Estudo autoral: uma camada de decisão que diz se cada rota cabe na bateria de cada moto elétrica e aloca motos por algoritmo húngaro. Núcleo em TypeScript, sem servidor.",
    },
  },

  hold: {
    slug: "hold",
    name: "Hold Corretora",
    kind: "Cliente real · site em produção",
    status: "live",
    year: "2026",
    role: "Desenvolvimento do site e das decisões de interface e engenharia: componentes, mobile, acessibilidade, imagem, formulário para WhatsApp e SEO técnico. A marca foi fechada com o cliente.",
    hook: "Uma operação consultiva, traduzida para o digital.",
    problem:
      "Uma corretora com quatro linhas de negócio e dois tipos de cliente precisava de um site que levasse cada visitante até uma conversa com um consultor — sem parecer mais uma corretora genérica.",
    summary: {
      what: "O site institucional da Hold: saúde, seguros, consórcios e soluções financeiras, para pessoa física e empresa, em português e inglês.",
      did: "Construí o site e conduzi as rodadas com o cliente página a página — do sistema de componentes ao polish mobile, ao modal de detalhe e ao formulário que vira mensagem de WhatsApp.",
      proves: "Entrego para cliente real, em produção, e itero com feedback sem quebrar o que já foi aprovado.",
    },
    home: {
      lead: "Quatro frentes, dois públicos, um objetivo: uma conversa com um consultor. O conteúdo se bifurca entre “Para você” e “Para empresa” quando o argumento muda, e todo bloco termina em contato.",
      facts: [
        "Três modais de ~200 linhas viraram um componente com focus trap real — o PR removeu mais do que adicionou (+505 / −752).",
        "Polish mobile em quatro páginas sem mover um pixel do desktop que o cliente já tinha aprovado.",
        "Bilíngue, com uma regra simples: nenhuma chave de tradução sobe sem a outra.",
      ],
    },
    context: [
      "Site institucional com quatro frentes, sempre nesta ordem: Saúde, Seguros, Consórcios e Soluções Financeiras. O sucesso é medido em conversa qualificada — WhatsApp e formulário —, não em tempo de sessão. Por isso toda seção termina em contato.",
      "O site evoluiu por rodadas de feedback do cliente, página a página, com o desktop aprovado antes do mobile.",
    ],
    constraints: [
      "Desktop aprovado: nenhuma mudança no mobile podia alterar um pixel do desktop.",
      "Páginas compartilham componentes, e melhorar uma podia quebrar outra em silêncio. Regra: uma página por vez, e componente compartilhado só muda de forma aditiva.",
      "Textos do cliente intocáveis em várias entregas.",
      "Português e inglês no mesmo commit — uma chave faltando já tinha quebrado cards no ar.",
      "Tipografia com licença comercial adequada.",
    ],
    decision: {
      chosen: "Sobriedade premium: um navy por frente, vermelho só para ação e o WhatsApp como régua de conversão.",
      discarded: "O padrão do mercado — azul-claro, grade de cards iguais, foto de banco — e um visual expressivo e colorido.",
      why: "O primeiro apaga a marca; o segundo briga com a seriedade de saúde e seguros. Uma primeira versão com dourado e serifa editorial foi abandonada na execução porque diluía a distinção entre as frentes. A cor diz ao visitante em que frente ele está; o CTA leva sempre à conversa.",
    },
    secondary: [
      {
        title: "Mobile como polish cirúrgico, com gate",
        body: "Refazer mobile-first arriscava o desktop aprovado. A regra: qualquer valor mobile alterado num elemento que também aparece no desktop tem o valor desktop fixado de volta. Piso de texto de 13 px, alvos de toque de 44 px, uma página por branch.",
      },
      {
        title: "Um modal no lugar de três cópias",
        body: "Três forks de ~200 linhas viraram um componente, com Radix Dialog trazendo focus trap real — antes dava para sair do diálogo aberto com Tab. Três direções visuais comparadas lado a lado; a de vidro saiu pelo contraste e pelo custo de backdrop-filter em Android intermediário.",
      },
      {
        title: "O formulário que vira conversa",
        body: "O formulário deixou de depender de serviço de e-mail e passou a montar a mensagem direto para o WhatsApp, por um único builder compartilhado.",
      },
    ],
    architecture: {
      caption: "Todo caminho termina numa conversa.",
      nodes: [
        { title: "Visitante", detail: "Pessoa física ou empresa, a maioria no celular" },
        { title: "Home e quatro frentes", detail: "Cada frente com seu navy, em dois idiomas" },
        { title: "Para você / Para empresa", detail: "Bifurca o argumento quando ele muda" },
        { title: "Card → modal de detalhe", detail: "Um componente global sobre Radix Dialog" },
        { title: "Contato", detail: "WhatsApp ou formulário, montados por um builder único" },
        { title: "Conversa com um consultor" },
      ],
      loop: "Todo bloco tem um atalho direto para o contato.",
    },
    validation: [
      {
        value: "3 → 1",
        label: "modais duplicados consolidados num componente; +505 / −752 linhas em 15 arquivos",
        when: "07/2026",
        condition: "22/22 testes do componente; build com 9/9 páginas",
      },
      {
        value: "4 páginas",
        label: "com polish mobile, desktop idêntico e alvos de toque de pelo menos 44 px",
        when: "07/2026",
        condition: "4 PRs revisados e mergeados",
      },
      {
        value: "360 → 1280 px",
        label: "variante de imagem servida nos cards — antes esticada, agora nítida em tela retina",
        when: "06/2026",
        condition: "Conferido pelo currentSrc no navegador",
      },
      {
        value: "No ar",
        label: "modal global, correção da foto no mobile e fonte única verificados no HTML servido",
        when: "07/2026",
      },
    ],
    limits: [
      "Não há medição de conversão, leads ou tráfego registrada — por isso nenhum número de resultado aparece aqui.",
      "A identidade da marca foi fechada com o cliente. Tempo de mercado e número de parceiros são da Hold, não métricas minhas.",
    ],
    learning:
      "Três bugs de layout no modal novo passaram por revisão por tarefa, revisão da branch inteira e 22 testes verdes — e só apareceram quando abri a tela. O ambiente de teste não calcula layout. Desde então, mudança visual só está pronta depois de medida no navegador.",
    stack: ["Next.js (App Router)", "React", "TypeScript", "Tailwind", "Framer Motion", "Radix Dialog", "react-hook-form + zod", "Vitest + Testing Library", "Vercel"],
    links: [{ label: "holdcorretora.com", href: "https://www.holdcorretora.com" }],
    media: [
      {
        src: images.hold.home,
        alt: "Home da Hold: “Um ecossistema. Quatro frentes.” sobre a imagem de quatro mãos montando um quebra-cabeça vermelho.",
        caption: "A home apresenta as quatro frentes antes de pedir qualquer coisa.",
        device: "desktop",
      },
      {
        src: images.hold.saude,
        alt: "Página de Saúde da Hold, no navy da frente, com o argumento para famílias, MEI e empresas.",
        caption: "Cada frente tem seu navy: a cor diz ao visitante onde ele está.",
        device: "desktop",
      },
      {
        src: images.hold.contato,
        alt: "Formulário de contato da Hold em três passos — perfil, interesse e contato — que termina numa mensagem de WhatsApp.",
        caption: "O formulário monta a mensagem e entrega a conversa pronta no WhatsApp.",
        device: "desktop",
      },
      {
        src: images.hold.consorcios,
        alt: "Página de Consórcios da Hold: planos para construir, estratégias para crescer.",
        device: "desktop",
      },
    ],
    seo: {
      title: "Hold Corretora — site institucional",
      description:
        "Cliente real, em produção: o site da Hold Corretora, com quatro frentes, dois públicos e todo caminho terminando numa conversa com um consultor.",
    },
  },

  neurorace: {
    slug: "neurorace",
    name: "NeuroRace",
    kind: "Projeto em equipe · MVP web",
    status: "live",
    year: "2025–2026",
    role: "A plataforma web do projeto — corrida, desempenho, ranking e entrada por QR code — e a organização do código da equipe no GitHub.",
    hook: "Entre o sinal e a experiência.",
    problem: "Transformar a atenção medida por um sensor de EEG numa corrida que o público entenda na hora e queira repetir.",
    summary: {
      what: "Um jogo em que a concentração, lida por um sensor de EEG, controla a corrida — com ranking e retorno sobre o próprio desempenho. Finalista do Future Makers, competição de iniciação científica do Next FIAP 2025.",
      did: "A frente web: a experiência que o público vê e toca, em Next.js 16 e React 19, e a migração do código para a organização da equipe, com o histórico preservado.",
      proves: "Trabalho em equipe, em produto com hardware e dado sensível, fora do CRUD de sempre.",
    },
    home: {
      lead: "Um sensor de EEG lê a concentração do jogador; quanto maior o foco, melhor o desempenho na corrida. A web é onde isso vira experiência: corrida, desempenho pessoal e ranking.",
      facts: [
        "Finalista do Future Makers, competição de iniciação científica do Next FIAP 2025.",
        "MVP web em Next.js 16 e React 19, com estado em zustand, gráficos em recharts e entrada na corrida por QR code.",
        "Privacidade antes de persistência: nenhum dado de EEG real é armazenado antes de uma política de dados biométricos.",
      ],
    },
    context: [
      "Plataforma de experiência cognitiva: um jogo controlado pela atenção, medida por um sensor NeuroSky, com ranking e retorno sobre o desempenho. O projeto é de equipe e vive numa organização no GitHub, com repositórios separados para a web, o backend e o serviço de borda.",
      "A frente web é o MVP: telas de corrida, “minha corrida”, ranking e entrada por QR code, com a direção visual própria do projeto.",
    ],
    constraints: [
      "Dado biométrico é sensível: nada de persistir EEG real antes de uma decisão de privacidade escrita.",
      "Experiência demonstrável primeiro, sem travar em infraestrutura prematura.",
      "Hardware e tempo real trazem uma complexidade de infraestrutura que precisa ser validada antes de adotada.",
      "Código dividido entre a organização e contas pessoais.",
    ],
    decision: {
      chosen: "MVP web primeiro; EEG, tempo real e persistência entram por etapas.",
      discarded: "Montar a infraestrutura completa antes de existir uma experiência para mostrar.",
      why: "Uma experiência demonstrável vale mais cedo do que uma arquitetura completa sem usuário. E dado biométrico exige uma decisão de privacidade própria antes de guardar qualquer leitura real.",
    },
    secondary: [
      {
        title: "Repositório oficial na organização, histórico preservado",
        body: "A web migrou para a organização com a main inteira — sem squash, sem recomeço —, e o repositório pessoal ficou como backup. Antes do push, conferi que o arquivo de variáveis de ambiente nunca tinha entrado no histórico.",
      },
      {
        title: "Privacidade antes de persistência",
        body: "Regra escrita desde o início: nenhum dado de EEG real é armazenado enquanto a política de dados biométricos não existir.",
      },
    ],
    architecture: {
      caption: "Linha cheia: construído. Tracejada: planejado ou de outra frente da equipe.",
      nodes: [
        { title: "Sensor de EEG", detail: "Leitura de atenção", planned: true },
        { title: "Serviço de borda", detail: "Ponte entre o sensor e a nuvem", planned: true },
        { title: "Backend e tempo real", detail: "Ranking ao vivo e persistência", planned: true },
        { title: "Plataforma web", detail: "Corrida, desempenho, ranking, entrada por QR code" },
        { title: "IA Coach", detail: "Retorno sobre o desempenho", planned: true },
      ],
    },
    validation: [
      {
        value: "Finalista",
        label: "do Future Makers, competição de iniciação científica do Next FIAP 2025",
        when: "2025",
        condition: "Conforme o site público do projeto",
      },
      {
        value: "30 commits",
        label: "de histórico da web migrados para a organização, sem squash",
        when: "07/2026",
      },
    ],
    limits: [
      "Backend, serviço de borda e IA Coach são de outras frentes da equipe; o recorte aqui é a web.",
      "A integração de EEG ponta a ponta não está confirmada, e nenhum dado biométrico é armazenado.",
    ],
    learning:
      "Ser membro de uma organização no GitHub não dá permissão de escrita num repositório específico. Quando o push da migração voltou 403, diagnostiquei a permissão pela API em vez de sair trocando credencial.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Tailwind", "Framer Motion", "zustand", "recharts", "qrcode.react"],
    links: [
      { label: "Repositório da web", href: "https://github.com/NeuroRace/web-plataform" },
      { label: "Site do projeto", href: "https://neurorace-v2.vercel.app" },
    ],
    media: [
      {
        src: images.neurorace.home,
        alt: "Plataforma web do NeuroRace: “Sua mente, medida em tempo real”, com o gráfico de atenção e meditação em modo demonstração.",
        caption: "A plataforma hoje: o sinal do sensor vira gráfico ao vivo — aqui, em modo demonstração.",
        device: "desktop",
      },
      {
        src: images.neurorace.sobre,
        alt: "Página “O Projeto” do NeuroRace: “A atenção virou o recurso mais disputado.”",
        caption: "A página do projeto, redesenhada no conceito “Ruído → Sinal”.",
        device: "desktop",
      },
      {
        src: images.neurorace.mobile,
        alt: "A plataforma do NeuroRace no celular, com o gráfico de sinal ao vivo em modo demonstração.",
        device: "mobile",
      },
    ],
    seo: {
      title: "NeuroRace — plataforma web",
      description:
        "Projeto em equipe, finalista do Future Makers (Next FIAP 2025): um jogo controlado pela atenção medida por EEG. Recorte: a plataforma web, em Next.js 16 e React 19.",
    },
  },

  autofix: {
    slug: "autofix",
    name: "AutoFix AI",
    kind: "Cliente real · demo funcional em produção",
    status: "demo",
    year: "2026",
    role: "Ponta a ponta: discovery com o cliente, recorte de escopo, arquitetura, análise de custo e de LGPD, provisionamento, código, testes e o roteiro da apresentação.",
    hook: "Automação que sabe quando chamar alguém.",
    problem:
      "Depois do serviço, a oficina perde o cliente: ninguém pergunta se ficou tudo bem nem lembra da próxima revisão, e a base de clientes antigos fica parada.",
    summary: {
      what: "Um agente de pós-venda por WhatsApp para uma oficina mecânica: acompanha o cliente 48 horas depois do serviço, lembra a revisão no vencimento e passa para uma pessoa quando o assunto passa do limite.",
      did: "Do discovery ao deploy: recortei o escopo com o dono da oficina, desenhei a arquitetura, analisei custo e LGPD, provisionei WhatsApp, banco e hospedagem e escrevi a demo que roda em produção com base fictícia.",
      proves:
        "Construo automação com freios — o sistema sabe o que não pode dizer e quando chamar uma pessoa — e penso em risco real, como LGPD e banimento do número, antes de escrever código.",
    },
    home: {
      lead: "Um agente de pós-venda por WhatsApp para uma oficina mecânica. O limite do que ele pode fazer foi traçado com o cliente e está no código: todo fato vem do banco, e o que não está lá vai para uma pessoa.",
      facts: [
        "O banco é dono de todo o estado, e existe um único caminho de saída para o WhatsApp — onde vivem opt-out, janela de 24 horas, horário comercial e auditoria.",
        "Relógio injetável: o sistema nunca chama now(). O botão “avançar 48 h” da demo roda o mesmo motor de produção.",
        "512 de 512 testes contra banco real, nenhum pulado.",
      ],
    },
    ceiling: ["Não diagnostica.", "Não cita preço.", "Não promete prazo.", "Não inventa horário."],
    context: [
      "O cliente pediu começar pelo pós-venda. O sistema dispara um acompanhamento 48 horas depois do serviço, encerra ou escala o atendimento e lembra a revisão preventiva no vencimento, oferecendo horário.",
      "A primeira mensagem nunca é escrita pela IA: fora da janela de 24 horas, o WhatsApp só entrega template aprovado pela Meta. A conversa natural começa quando o cliente responde. A demo roda em produção com uma base fictícia e um palco em três cenas para apresentar ao dono da oficina.",
    ],
    constraints: [
      "Regras do WhatsApp: janela de 24 horas, templates aprovados e categoria de mensagem decidida pela Meta.",
      "Risco de banimento: o número principal da oficina não podia correr risco, então o agente usa um número dedicado.",
      "LGPD: a base histórica nunca deu opt-in explícito. Base legal escolhida: legítimo interesse, com opt-out em toda mensagem.",
      "O teto de automação foi traçado com o cliente.",
      "Orçamento zero na demo e duas semanas até a apresentação.",
      "Tudo depende de tempo — 48 horas, seis meses —, e é impossível testar esperando o relógio de verdade.",
    ],
    decision: {
      chosen: "O banco é dono de todo o estado, com um único caminho de saída para o WhatsApp.",
      discarded: "Um orquestrador visual guardando fluxo e estado — ou tudo em código, reescrevendo conectores prontos.",
      why: "A fila é uma função SQL, e todo envio passa por uma função única onde vivem opt-out, janela de 24 horas, horário comercial e auditoria. Dois caminhos de envio divergiriam — e, no dia em que divergissem, alguém receberia mensagem às 23 h ou depois de pedir para parar.",
    },
    secondary: [
      {
        title: "Só pós-venda, por enquanto",
        body: "Ficaram de fora a suíte completa do briefing — campanhas, triagem técnica, catálogo e preço — e uma plataforma multi-vertical desde o dia um. Abstrair antes de ter uma vertical em produção faz abstrair as coisas erradas. A fatia escolhida é também a mais segura juridicamente.",
      },
      {
        title: "Relógio injetável",
        body: "O sistema nunca chama now(): um deslocamento global de tempo no banco faz o botão “avançar 48 h” da demo rodar o mesmo motor de produção, e torna a regra de seis meses testável em segundos.",
      },
      {
        title: "Escalar por assunto, e a oficina responde pelo mesmo canal",
        body: "Pergunta de preço, prazo ou garantia abre uma pendência para a oficina, e a conversa continua. A triagem de sintoma segue só roteiro aprovado pela oficina, nunca palpite do modelo. A resposta humana sai pela mesma função de envio, com os mesmos controles.",
      },
    ],
    architecture: {
      caption: "Aplicação e banco na região de São Paulo.",
      nodes: [
        { title: "Serviço concluído", detail: "Evento na base de clientes" },
        { title: "Postgres", detail: "Estado, fila e relógio do domínio" },
        { title: "Envio único", detail: "Opt-out, janela de 24 h, horário comercial e auditoria" },
        { title: "WhatsApp", detail: "Cloud API da Meta até o celular do cliente" },
        { title: "Webhook assinado", detail: "Grava a resposta e renova a janela" },
        { title: "Agente com 10 ferramentas", detail: "Consulta o banco; um validador bloqueia preço, prazo e horário inventado" },
        { title: "Resolve, abre pendência ou escala", detail: "A oficina responde pelo mesmo canal" },
      ],
      loop: "A resposta da oficina volta pelo envio único, com os mesmos controles.",
    },
    validation: [
      {
        value: "512/512",
        label: "testes contra banco real, nenhum pulado",
        when: "09/2026",
        condition: "Com o ambiente de teste carregado",
      },
      {
        value: "7/7",
        label: "cenários reais no WhatsApp: elogio, pergunta mista, confirmação, triagem, reclamação e pedido para parar",
        when: "08/2026",
        condition: "Dentro da janela de 24 h; 3 a 8 s por turno",
      },
      {
        value: "401 / 200",
        label: "no webhook em produção: assinatura inválida recusada, válida aceita",
        when: "08/2026",
      },
      {
        value: "4,3 s × 50,5 s",
        label: "a mesma resposta com raciocínio baixo e alto do modelo — ficou o baixo",
        when: "08/2026",
        condition: "Texto final idêntico",
      },
    ],
    limits: [
      "É uma demo funcional com base fictícia; o piloto com clientes reais ainda não começou.",
      "Nenhum número de receita recuperada: os valores da demo são fictícios.",
      "O envio proativo real depende da aprovação dos templates pela Meta.",
      "Orquestração com n8n, integração com agenda e inbox multiusuário ficaram para o piloto.",
    ],
    learning:
      "O webhook comparava telefone por igualdade exata, e o WhatsApp entrega números de alguns DDDs sem o nono dígito. Nenhuma resposta de clientes dessas regiões teria sido processada no piloto — sem erro nenhum, porque “cliente não encontrado” era um caminho silencioso de propósito. Corrigi aceitando as duas formas e separando “não é cliente” de “o banco caiu”. Onde há descarte silencioso, o dado descartado precisa aparecer em algum lugar.",
    stack: ["Next.js (App Router)", "TypeScript", "Supabase (Postgres, RLS, Realtime)", "WhatsApp Cloud API", "LLM plugável com ferramentas", "Vitest com banco real", "Vercel"],
    links: [],
    linksNote: "Repositório privado e demo protegida: é projeto de cliente. O diagrama abaixo mostra como funciona.",
    media: [],
    seo: {
      title: "AutoFix AI — pós-venda por WhatsApp",
      description:
        "Cliente real: um agente de pós-venda por WhatsApp para oficina mecânica, com o estado no banco, um único caminho de envio e um teto de automação traçado com o cliente.",
    },
  },
};
