-- Habilita a extensão pgcrypto para podermos usar a função uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Cria a tabela principal para armazenar os planos de aula
CREATE TABLE public.planos_de_aula (
  -- Colunas de Controle
  id uuid NOT NULL PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,

  -- Colunas de Input do Usuário
  tema_aula text NOT NULL,
  ano_escolar text NOT NULL,
  duracao_minutos integer,

  -- Colunas de Output da IA
  introducao_ludica text,
  objetivo_bncc text,
  passo_a_passo text,
  rubrica_avaliacao text
);

-- Adiciona a chave estrangeira para vincular o plano de aula ao usuário que o criou.
ALTER TABLE public.planos_de_aula
  ADD CONSTRAINT planos_de_aula_user_id_fkey FOREIGN KEY (user_id)
  REFERENCES auth.users (id) ON DELETE CASCADE;

-- Adiciona um comentário na tabela para documentação.
COMMENT ON TABLE public.planos_de_aula IS 'Armazena os planos de aula gerados pela IA, incluindo inputs do usuário e outputs da IA.';

--------------------------------------------------------------------------------
-- POLÍTICAS DE SEGURANÇA (ROW-LEVEL SECURITY)
--------------------------------------------------------------------------------

-- 1. Habilita a segurança de nível de linha na tabela.
ALTER TABLE public.planos_de_aula ENABLE ROW LEVEL SECURITY;

-- 2. Política de SELECT: Permite que um usuário veja APENAS os seus próprios planos de aula.
CREATE POLICY "Permitir que usuários leiam seus próprios planos"
ON public.planos_de_aula
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Política de INSERT: Permite que um usuário crie um plano de aula APENAS para si mesmo.
CREATE POLICY "Permitir que usuários criem seus próprios planos"
ON public.planos_de_aula
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Política de UPDATE: Permite que um usuário atualize APENAS os seus próprios planos.
CREATE POLICY "Permitir que usuários atualizem seus próprios planos"
ON public.planos_de_aula
FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Política de DELETE: Permite que um usuário delete APENAS os seus próprios planos.
CREATE POLICY "Permitir que usuários deletem seus próprios planos"
ON public.planos_de_aula
FOR DELETE
USING (auth.uid() = user_id);