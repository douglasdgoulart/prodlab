# ProdLab — Módulo 1: Previsão de Demanda

> Plano pedagógico e especificação da primeira etapa

---

## Objetivo pedagógico

Permitir que o aluno consolide os conceitos de previsão de demanda por séries temporais, praticando a análise visual de dados históricos, a identificação de padrões e a seleção fundamentada do método de previsão mais adequado — compreendendo o impacto da escolha por meio do erro de previsão.

---

## Escopo conceitual

Este módulo trabalha **exclusivamente com métodos de séries temporais**. Não são abordados modelos causais ou de regressão explicativa. O foco está na análise de séries históricas de demanda e na identificação de padrões temporais.

---

## Resultado esperado do aluno

Ao final do módulo, o aluno deve ser capaz de:

- Observar o comportamento histórico da demanda em um gráfico.
- Identificar o padrão da série (constante, tendência, sazonalidade ou combinações).
- Selecionar o método de previsão de séries temporais mais adequado.
- Interpretar o erro de previsão (MAD) e compreender que bons métodos tendem a produzir erro menor.
- Gerar uma previsão fundamentada para os próximos 6 meses.

---

## Fluxo do aluno

### Etapa 1 — Contexto do caso

O aluno recebe um cenário com:

- Nome da empresa fictícia.
- Família de produtos.
- Horizonte histórico (24 ou 36 meses).
- Unidade de medida.
- Contexto resumido do mercado.

> **Exemplo:** "Uma fábrica de ventiladores domésticos deseja planejar os próximos 6 meses com base no comportamento histórico da demanda da família VentMax."

O cenário evita que o aluno sinta que está olhando apenas para uma planilha sem contexto.

### Etapa 2 — Visualização da demanda

O sistema exibe:

- **Gráfico de linha** da demanda histórica.
- **Linha de tendência** por regressão linear.
- **Tabela** com os dados mensais.

Texto de apoio fixo na tela:
> "Observe o comportamento da demanda ao longo do tempo. Identifique se a série apresenta estabilidade, tendência ou sazonalidade."

Bloco lateral com dicas de interpretação:
- Há crescimento ou queda persistente ao longo do tempo?
- Existem repetições periódicas (picos nos mesmos meses)?
- A série oscila em torno de um nível estável?

### Etapa 3 — Classificação da série

O aluno deve classificar o padrão predominante da série:

| Opção | Descrição |
|-------|-----------|
| Constante | Demanda oscila em torno de um nível estável, sem crescimento nem sazonalidade. |
| Com tendência | Demanda apresenta crescimento ou queda persistente ao longo do tempo. |
| Sazonal com nível constante | Demanda apresenta repetição periódica, mas sem tendência de crescimento. |
| Sazonal com tendência | Demanda apresenta repetição periódica combinada com crescimento ou queda. |

> **Decisão de design:** Separar a classificação do padrão da escolha do método melhora a aprendizagem, porque o erro passa a ser diagnosticável em duas camadas.

### Etapa 4 — Escolha do método de previsão

Métodos de séries temporais disponíveis:

- Média móvel simples
- Média móvel ponderada
- Suavização exponencial simples
- Suavização exponencial com tendência (dupla)
- Método de Holt
- Método de Holt-Winters

**Compatibilidade didática esperada:**

| Padrão da série | Métodos adequados |
|-----------------|-------------------|
| Constante | Média móvel simples, média móvel ponderada, suavização exponencial simples |
| Com tendência | Suavização exponencial dupla, Holt |
| Sazonal sem tendência | Holt-Winters sazonal |
| Sazonal com tendência | Holt-Winters com tendência |

> **Nota:** Os métodos disponíveis no sistema devem refletir exatamente os métodos trabalhados em sala de aula pela docente. A lista acima é uma referência inicial e deve ser validada.

### Etapa 5 — Feedback com MAD

#### Se o aluno acertar

O sistema exibe:

1. Confirmação de que o método é adequado ao comportamento da série.
2. Valor do **Desvio Absoluto Médio (MAD)** obtido.
3. Mensagem: *"O desvio absoluto médio (MAD) mede o tamanho médio do erro da previsão. Quanto mais próximo de zero, melhor o ajuste do método aos dados históricos."*
4. Previsão gerada para os próximos 6 meses.
5. Gráfico com histórico + previsão futura.

> **Exemplo de feedback:**
> "Você escolheu um método adequado para uma série com tendência. O desvio absoluto médio obtido foi de 12,4 unidades. A seguir, veja a previsão para os próximos 6 meses."

#### Se o aluno errar

O sistema exibe:

1. Explicação de **por que** o método não é adequado ao padrão da série.
2. Indicação de em que tipo de série o método escolhido costuma ser usado.
3. Valor do **MAD** gerado pelo método incorreto, mostrando a magnitude do erro.
4. Mensagem: *"Quanto mais próximo de zero, melhor o ajuste."*
5. Permissão para nova tentativa.

> **Exemplo de feedback:**
> "Suavização exponencial simples não é a melhor escolha aqui porque esse método é mais indicado para séries sem tendência e sem sazonalidade marcada. Neste caso, a linha de tendência mostra crescimento ao longo do tempo, o que exige um método capaz de capturar tendência, como Holt. Aplicando esse método aos dados históricos, o desvio absoluto médio foi de 28,7 unidades. Tente novamente escolhendo um método capaz de capturar tendência."

### Etapa 6 — Projeção futura (após acerto)

Tela final do módulo com:

- Gráfico completo: histórico + 6 meses previstos.
- Valor do MAD do método escolhido.
- Resumo da etapa (método, justificativa, erro).
- Saída que alimentará o Módulo 2 (Planejamento Agregado).

---

## Mecânicas contra adivinhação

Para evitar que o aluno teste opções aleatoriamente até acertar, o módulo implementa:

### Pontuação por tentativa

| Tentativa | Pontuação |
|-----------|-----------|
| 1ª tentativa (acerto) | Nota máxima |
| 2ª tentativa | Nota reduzida |
| 3ª tentativa | Nota menor |
| 4ª em diante | Prática livre, sem pontuação cheia |

### Feedback obrigatório entre tentativas

Após erro, o aluno deve ler o feedback explicativo completo antes de poder realizar nova tentativa. O sistema não libera nova escolha imediatamente.

### Registro de tentativas

Todas as tentativas são registradas (classificação escolhida, método escolhido, acerto/erro, data/hora, número da tentativa) para acompanhamento pela docente.

---

## Assistente de IA didático

O módulo conta com um assistente de IA integrado para apoio durante a atividade.

### Função

O assistente pode:

- Explicar conceitos de séries temporais.
- Esclarecer diferenças entre métodos.
- Explicar o que é tendência, sazonalidade, nível e erro.
- Orientar a leitura do gráfico.
- Explicar o significado do MAD.
- Responder dúvidas sobre a lógica da etapa atual.

### Restrições pedagógicas

O assistente **deve**:

- Priorizar explicações conceituais.
- Oferecer pistas e perguntas orientadoras.
- Explicar o significado dos indicadores mostrados.

O assistente **não deve**:

- Fornecer a resposta correta diretamente (ex: "O método certo é Holt").
- Resolver a atividade sem esforço do aluno.

### Estratégia de resposta em níveis

1. **Explicação conceitual** — Definição do termo ou conceito.
2. **Pista orientadora** — Pergunta que direciona o raciocínio.
3. **Exemplo genérico** — Ilustração que não entrega a resposta do caso.
4. **Ajuda mais direta** — Somente se a regra pedagógica permitir.

### Exemplos de respostas do assistente

**Sobre tendência:**
> "Uma série com tendência apresenta crescimento ou queda persistente ao longo do tempo. Nesse caso, métodos que assumem estabilidade podem gerar erros maiores."

**Sobre sazonalidade:**
> "Sazonalidade ocorre quando o comportamento da demanda se repete em intervalos regulares, como meses, trimestres ou estações do ano."

**Sobre MAD:**
> "O desvio absoluto médio indica o tamanho médio do erro da previsão. Quanto mais próximo de zero, melhor o ajuste do método aos dados históricos."

**Sobre escolha do método:**
> "Antes de escolher o método, observe se a série parece estável, se cresce ao longo do tempo ou se repete padrões em determinados períodos."

---

## Requisitos funcionais

| ID | Requisito |
|----|-----------|
| RF01 | O sistema deve apresentar uma série histórica de demanda (24 ou 36 meses) referente a uma família de produtos, dentro de um cenário contextualizado. |
| RF02 | O sistema deve exibir um gráfico da demanda histórica com linha de tendência por regressão linear. |
| RF03 | O sistema deve exibir uma tabela com os dados mensais da série. |
| RF04 | O sistema deve permitir que o aluno classifique o comportamento da série temporal (constante, tendência, sazonal, sazonal com tendência). |
| RF05 | O sistema deve fornecer feedback quando a classificação do padrão estiver incorreta. |
| RF06 | O sistema deve permitir que o aluno selecione um método de previsão entre os métodos de séries temporais trabalhados na disciplina. |
| RF07 | Quando o aluno selecionar um método incorreto, o sistema deve apresentar feedback explicativo indicando por que o método não é o mais adequado e em que tipo de série ele costuma ser aplicado. |
| RF08 | Quando o aluno selecionar um método incorreto, o sistema deve exibir o valor do Desvio Absoluto Médio (MAD) obtido por esse método aplicado à série. |
| RF09 | O sistema deve informar que, quanto mais próximo de zero for o MAD, melhor o ajuste do método aos dados históricos. |
| RF10 | Quando o aluno acertar o método, o sistema deve gerar a previsão para os próximos 6 meses. |
| RF11 | O sistema deve exibir o gráfico com histórico e previsão futura após o acerto, incluindo o MAD do método. |
| RF12 | O sistema deve registrar todas as tentativas do aluno (classificação, método, acerto/erro, data/hora, número da tentativa). |
| RF13 | O sistema deve implementar pontuação decrescente por número de tentativas. |
| RF14 | O sistema deve disponibilizar um assistente de IA para dúvidas didáticas durante a atividade. |
| RF15 | O assistente de IA deve priorizar explicações conceituais e orientação pedagógica, evitando fornecer diretamente a resposta correta. |

## Requisitos não funcionais

| ID | Requisito |
|----|-----------|
| RNF01 | A interface deve ser didática e visualmente simples, com foco em interpretação e aprendizagem. |
| RNF02 | O feedback do sistema deve ser imediato após cada tentativa. |
| RNF03 | O assistente de IA deve responder em linguagem acessível ao nível da disciplina. |
| RNF04 | A ferramenta deve permitir múltiplos casos didáticos com perfis de demanda diferentes para evitar memorização. |

---

## Estrutura de dados mínima

```
CasoDidatico
  id
  nome
  descricao
  familia_de_produtos
  horizonte_historico
  horizonte_de_previsao
  status

SerieDemanda
  id
  caso_id
  periodo
  demanda

RegraSerie
  caso_id
  padrao_correto          -- constante | tendencia | sazonal | sazonal_tendencia
  metodo_correto
  justificativa_pedagogica
  feedback_por_metodo_incorreto   -- mapa: método → texto de feedback

TentativaAluno
  id
  aluno_ou_dupla_id
  caso_id
  classificacao_escolhida
  metodo_escolhido
  acertou
  mad_calculado
  data_hora
  numero_da_tentativa

PrevisaoGerada
  id
  tentativa_id
  periodo_futuro
  valor_previsto
```

---

## Layout da tela do módulo

```
┌─────────────────────────────────────────────────────────────┐
│  Trilha: [● Previsão] → [○ Agregado] → [○ Desagregado] → …│
├──────────────┬──────────────────────────┬───────────────────┤
│              │                          │                   │
│  Como        │   Gráfico de demanda     │   Assistente      │
│  interpretar │   histórica + tendência  │   de IA           │
│  este        │                          │   didático        │
│  gráfico?    │   Tabela de dados        │                   │
│              │                          │   [campo de       │
│  • dicas     │   [Classificar série ▼]  │    pergunta]      │
│  • pistas    │   [Escolher método ▼]    │                   │
│              │   [Confirmar]            │                   │
│              │                          │                   │
├──────────────┴──────────────────────────┴───────────────────┤
│  Feedback / Resultado / MAD                                 │
└─────────────────────────────────────────────────────────────┘
```

- **Coluna esquerda:** Dicas de interpretação do gráfico.
- **Área central:** Gráfico, tabela, controles de classificação e método.
- **Coluna direita:** Assistente de IA didático.
- **Área inferior:** Feedback expandido após cada tentativa.
- **Barra superior:** Trilha visual das 6 etapas do ProdLab (etapas futuras visíveis, mas bloqueadas).
