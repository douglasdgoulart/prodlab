/**
 * Fixed UUIDs for test data. Used by global-setup/teardown and test helpers.
 * These IDs are deterministic so teardown can safely delete ONLY test data.
 */

// Product family IDs (test-only, prefixed with aaaa)
export const PRODUCT_FAMILY_IDS = {
  cerveja: "aaaa0001-0000-0000-0000-000000000001",
  componentes: "aaaa0001-0000-0000-0000-000000000002",
  congelados: "aaaa0001-0000-0000-0000-000000000003",
  sorvetes: "aaaa0001-0000-0000-0000-000000000004",
  automotivas: "aaaa0001-0000-0000-0000-000000000005",
  panetones: "aaaa0001-0000-0000-0000-000000000006",
} as const

export const ALL_PRODUCT_FAMILY_IDS = Object.values(PRODUCT_FAMILY_IDS)

// Test user emails (used to look up auth user IDs at runtime)
export const TEST_EMAILS = {
  teacher: "prof.teste@prof.unieduk.com.br",
  aluno: "aluno.teste@al.unieduk.com.br",
  marina: "marina.silva@al.unieduk.com.br",
  joao: "joao.pedro@al.unieduk.com.br",
  mariana: "mariana.oliveira@al.unieduk.com.br",
  carlos: "carlos.souza@al.unieduk.com.br",
  ana: "ana.beatriz@al.unieduk.com.br",
} as const

export const ALL_TEST_EMAILS = Object.values(TEST_EMAILS)
