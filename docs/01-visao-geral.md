# ProdLab — Visão Geral do Projeto

> Laboratório Didático de Planejamento e Controle da Produção

---

## O que é o ProdLab

O ProdLab é uma plataforma educacional que simula, de forma guiada e didática, as principais etapas do planejamento e controle de um sistema produtivo no médio e curto prazo. O sistema funciona como um **MRPII didático**: o aluno recebe dados de demanda de uma família de produtos e percorre toda a cadeia de decisão do PCP, desde a previsão de demanda até o sequenciamento final das operações no chão de fábrica.

A proposta não é replicar a complexidade de um ERP industrial real, mas sim **tornar visível o raciocínio de PCP** — mostrando que cada etapa alimenta a próxima e que uma decisão ruim no início contamina todo o restante do planejamento.

---

## Público-alvo

Alunos de graduação em Engenharia de Produção da Unimax, cursando a disciplina de Planejamento e Controle da Produção.

---

## Uso didático

A ferramenta será utilizada como **projeto final da disciplina**, para consolidação dos aprendizados. O fluxo de uso previsto é:

1. **Demonstração guiada:** A professora percorre toda a plataforma com os alunos em sala.
2. **Prática em duplas:** Após a demonstração, o acesso é liberado para os alunos trabalharem em duplas de forma autônoma.

---

## Proposta de valor

O principal diferencial pedagógico do ProdLab é o **encadeamento das decisões**. A plataforma mostra que previsão, planejamento e controle não são tópicos isolados:

- A previsão de demanda alimenta o planejamento agregado.
- O planejamento agregado orienta o desagregado.
- O desagregado alimenta o Programa Mestre de Produção.
- O PMP aciona o MRP.
- O MRP gera ordens.
- As ordens são sequenciadas no scheduling.

O sistema une **leitura de dados, interpretação gerencial, escolha de método, cálculo, tomada de decisão e impacto operacional** em um fluxo único e contínuo.

---

## Resultado esperado do aluno

Ao final da atividade, o aluno deve ser capaz de:

- Interpretar o comportamento de uma série histórica de demanda.
- Selecionar e justificar um método de previsão.
- Transformar a previsão em decisões agregadas e desagregadas.
- Elaborar um Programa Mestre de Produção.
- Explodir necessidades de materiais via MRP.
- Programar ordens em recursos produtivos.

---

## Cadeia de módulos do sistema

O ProdLab é composto por 6 módulos sequenciais, onde cada etapa consome a saída da anterior:

```
Previsão de Demanda → Planejamento Agregado → Planejamento Desagregado → PMP → MRP → Scheduling
```

### Módulo 1 — Previsão de Demanda

Análise de séries temporais históricas, identificação de padrões (constante, tendência, sazonalidade) e seleção do método de previsão adequado. Feedback com Desvio Absoluto Médio (MAD). Geração de previsão para os próximos 6 meses.

### Módulo 2 — Planejamento Agregado da Produção

Transformação da previsão consolidada em decisões agregadas de produção, estoque, horas extras, subcontratação e força de trabalho em horizonte de médio prazo. O aluno escolhe entre estratégias de acompanhamento, nivelamento ou mista e compara custos.

**Entrada:** previsão dos próximos meses, capacidade e custos agregados, estoques iniciais, políticas da empresa.
**Saída:** plano mensal agregado, custo total, impactos em capacidade e estoque.

### Módulo 3 — Planejamento Desagregado

Desdobramento do plano agregado para itens, modelos ou subfamílias. O aluno distribui o volume agregado conforme mix percentual de produtos e restrições de capacidade.

**Entrada:** plano agregado, mix percentual, restrições de capacidade.
**Saída:** plano por item/subfamília, volumes por período.

### Módulo 4 — Programa Mestre de Produção (PMP / MPS)

Definição do que deve ser produzido e em que período para itens finais. O aluno monta o PMP equilibrando demanda, estoque e capacidade.

**Entrada:** plano desagregado, estoques, pedidos firmes, políticas de lote.
**Saída:** tabela do PMP, necessidades por item final.

### Módulo 5 — MRP

Explosão de necessidades de materiais com base no PMP e na estrutura de produto (BOM). O aluno calcula necessidades brutas e líquidas e determina liberações de ordens.

**Entrada:** PMP, BOM, lead times, estoques, recebimentos programados, lotes.
**Saída:** ordens planejadas de compra e produção, cronograma de liberações.

### Módulo 6 — Scheduling

Sequenciamento de ordens nas máquinas ou centros de trabalho no curto prazo. O aluno escolhe regras de sequenciamento, monta a sequência e analisa atrasos, fila e utilização.

**Entrada:** ordens liberadas, roteiros, tempos de processamento, recursos disponíveis, regras de prioridade.
**Saída:** quadro de programação, sequência das ordens, métricas de desempenho.

---

## Estratégia de construção

O projeto segue uma abordagem de **MVP por módulo**, priorizando qualidade sobre abrangência.

| Fase | Escopo |
|------|--------|
| **Fase 1** | Módulo de Previsão de Demanda completo (MVP pedagógico) |
| **Fase 2** | Dashboard da professora, controle de acesso por dupla, pontuação e relatórios |
| **Fase 3** | Planejamento Agregado |
| **Fase 4** | Planejamento Desagregado e PMP |
| **Fase 5** | MRP |
| **Fase 6** | Scheduling |

---

## Riscos conhecidos e mitigações

| Risco | Mitigação |
|-------|-----------|
| Complexidade excessiva logo no começo | Entregar um módulo de previsão muito bem feito, com arquitetura pronta para crescer. |
| Excesso de cálculo e pouca interpretação | Sempre exigir interpretação antes do cálculo em cada módulo. |
| Ambiguidade entre métodos de previsão | Usar casos didáticos construídos para deixar o padrão da série bem evidente. |
| Aluno decorar resposta | Ter múltiplos casos didáticos com perfis diferentes de demanda. |
| Interface técnica demais | Usar linguagem clara, visual didático e foco no raciocínio, não na aparência de ERP. |

---

## Stack técnica

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase Cloud (Auth, Postgres, Edge Functions)
- **Estado:** Zustand
- **Dispositivo primário:** Desktop (PC), com responsividade para mobile.

---

## Design System

Referência completa de cores, tipografia, tokens e especificações visuais disponível em [`prd-design-system.md`](./prd-design-system.md).
