-- ============================================================
-- Schema: App de Controle Financeiro Familiar
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Entidades (eu, irmao, pai, oficina)
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  type text NOT NULL CHECK (type IN ('person', 'workshop')),
  created_at timestamptz DEFAULT now()
);

-- Categorias de despesas
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entity_id uuid REFERENCES entities(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('income', 'expense')) DEFAULT 'expense',
  created_at timestamptz DEFAULT now()
);

-- Despesas
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  month date NOT NULL, -- sempre o primeiro dia do mês: 2024-01-01
  is_recurring boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Projetos / metas de aquisições
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  name text NOT NULL,
  target_amount numeric(10, 2) NOT NULL CHECK (target_amount > 0),
  saved_amount numeric(10, 2) NOT NULL DEFAULT 0,
  deadline date,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Dívidas (inicialmente do irmão, mas extensível)
CREATE TABLE IF NOT EXISTS debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  creditor text NOT NULL,
  total_amount numeric(10, 2) NOT NULL CHECK (total_amount > 0),
  paid_amount numeric(10, 2) NOT NULL DEFAULT 0,
  interest_rate numeric(5, 2) DEFAULT 0, -- percentual ao mês
  due_date date,
  priority int NOT NULL DEFAULT 2 CHECK (priority IN (1, 2, 3)), -- 1=alta, 2=média, 3=baixa
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Histórico de pagamentos das dívidas
CREATE TABLE IF NOT EXISTS debt_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id uuid NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  paid_at date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Seed: Entidades fixas
-- ============================================================
INSERT INTO entities (name, slug, color, type) VALUES
  ('Eu',      'eu',      '#6366f1', 'person'),
  ('Irmão',   'irmao',   '#f59e0b', 'person'),
  ('Pai',     'pai',     '#10b981', 'person'),
  ('Oficina', 'oficina', '#ef4444', 'workshop')
ON CONFLICT (slug) DO NOTHING;

-- Seed: Categorias comuns
INSERT INTO categories (name, entity_id, type) VALUES
  ('Aluguel',        NULL, 'expense'),
  ('Alimentação',    NULL, 'expense'),
  ('Combustível',    NULL, 'expense'),
  ('Energia',        NULL, 'expense'),
  ('Internet',       NULL, 'expense'),
  ('Saúde',          NULL, 'expense'),
  ('Educação',       NULL, 'expense'),
  ('Transporte',     NULL, 'expense'),
  ('Lazer',          NULL, 'expense'),
  ('Peças/Insumos',  NULL, 'expense'),
  ('Ferramentas',    NULL, 'expense'),
  ('Manutenção',     NULL, 'expense'),
  ('Outros',         NULL, 'expense')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Índices para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_expenses_entity_month ON expenses(entity_id, month);
CREATE INDEX IF NOT EXISTS idx_debts_entity ON debts(entity_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payments(debt_id);
