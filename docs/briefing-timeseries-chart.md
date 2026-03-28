# Briefing para o Designer — Componente `TimeSeriesChart`

## O que é

Um componente de gráfico de linhas para séries temporais. Ele será o componente-base de visualização de dados do ProdLab, usado no módulo de Previsão de Demanda e reutilizado nos módulos seguintes.

## Contexto de uso

O aluno recebe dados históricos de demanda mensal de uma empresa fictícia. Ele precisa **ler** o gráfico para identificar padrões (estabilidade, tendência, sazonalidade) e depois tomar decisões. O gráfico não é decorativo — é a principal ferramenta de análise do aluno.

## O que o gráfico precisa mostrar (camadas visuais)

O componente tem **4 camadas** que podem ser combinadas:

| Camada | Quando aparece | O que representa |
|---|---|---|
| **Histórico** | Sempre | Linha principal com pontos de demanda real (ex: 12 meses) |
| **Tendência** | Opcional | Linha tracejada sobreposta ao histórico mostrando a direção geral |
| **Previsão** | Após acerto do aluno | Extensão do gráfico com 6 meses futuros, visualmente distinta do histórico |
| **Erro (MAD)** | Após tentativa | Indicador numérico do desvio absoluto médio — pode ser badge, tooltip ou bloco ao lado |

## Estados do componente

1. **Somente histórico** — estado inicial, aluno ainda não interagiu
2. **Histórico + tendência** — tendência visível para ajudar a análise
3. **Histórico + previsão (acerto)** — aluno acertou, gráfico se expande com a projeção futura + MAD baixo
4. **Histórico + previsão (erro)** — aluno errou, MAD alto em destaque, feedback visual de que o ajuste é ruim

## Decisões de design necessárias

### 1. Paleta de cores para as camadas

Hoje o design system tem 5 chart tokens (`--chart-1` a `--chart-5`) que são grayscale. Precisam ser redefinidos com cores funcionais para:

- Linha de histórico (sugestão: primary `#0B2046`)
- Linha de tendência (sugestão: muted, tracejada)
- Linha de previsão (sugestão: accent `#FDB913` ou success `#10B981`)
- Área/destaque de erro (sugestão: error `#EF4444` quando MAD alto)

### 2. Como diferenciar histórico de previsão

Opções:

- Cor diferente
- Linha tracejada vs sólida
- Fundo sombreado na região de previsão
- Separador vertical entre passado e futuro

### 3. Como mostrar o MAD

Opções:

- Badge no canto do gráfico
- Bloco abaixo do gráfico
- Tooltip no hover
- Barra lateral com o valor + frase explicativa

### 4. Responsividade

O gráfico será usado em:

- Desktop (tela principal do módulo)
- Potencialmente mobile (consultar se necessário)

### 5. Interatividade

Definir:

- Tooltip no hover dos pontos? (mostra mês + valor)
- Animação na transição entre estados?
- Zoom/scroll horizontal? (provavelmente não, série curta)

### 6. Anatomia do componente

Sugestão de composição:

```
┌─────────────────────────────────────────┐
│  Título do gráfico          [MAD: 12.4] │
│─────────────────────────────────────────│
│                                         │
│   📈 Área do gráfico                    │
│   (eixo Y: unidades, eixo X: meses)    │
│                                         │
│─────────────────────────────────────────│
│  ● Histórico  --- Tendência  ● Previsão│
└─────────────────────────────────────────┘
```

## Variantes a entregar

| Variante | Descrição |
|---|---|
| `default` | Histórico apenas, linha + pontos |
| `with-trend` | Histórico + linha de tendência tracejada |
| `with-forecast` | Histórico + previsão (6 meses futuros) |
| `full` | Todas as camadas: histórico + tendência + previsão + MAD |

## Constraints técnicos

- **Stack**: React + Tailwind + Recharts (lib de gráficos baseada em SVG)
- **Tokens disponíveis**: `--chart-1` a `--chart-5`, `--primary`, `--accent`, `--success`, `--error`, `--muted`
- **Pattern de componente**: segue o padrão shadcn (compound components, `cn()` para classes, `className` prop)
- **Fonte dos labels**: Outfit (body) ou JetBrains Mono (valores numéricos)

## Dados de exemplo para prototipar

```
Mês:    Jan  Fev  Mar  Abr  Mai  Jun  Jul  Ago  Set  Out  Nov  Dez
Valor:  120  135  128  142  155  148  162  170  165  178  185  192
Trend:  125  130  135  140  145  150  155  160  165  170  175  180

Previsão (6 meses futuros):
Mês:    Jan  Fev  Mar  Abr  Mai  Jun
Valor:  188  195  200  207  212  218
```

## O que eu preciso de volta

- Definição visual das 4 variantes
- Paleta de cores para os chart tokens
- Decisão sobre como separar histórico/previsão
- Decisão sobre onde/como mostrar o MAD
- Specs de espaçamento, tamanhos de fonte para labels/eixos
