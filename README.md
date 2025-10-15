Gerador de Planos de Aula com IA

📖 Visão Geral do Projeto

Este projeto é a implementação de um sistema de backend para um gerador de planos de aula personalizados, desenvolvido como parte de um teste técnico. A aplicação utiliza o Supabase para a infraestrutura de banco de dados e autenticação, e a API do Google Gemini para a geração de conteúdo com Inteligência Artificial.

A solução permite que um usuário autenticado forneça um tema, ano escolar e duração, e receba um plano de aula completo e estruturado, que é então salvo em seu perfil.

📚 Índice

    Funcionalidades

    Stack de Tecnologias

    Arquitetura e Decisões Técnicas

    Escolha do Modelo de IA

    Desafios Encontrados

    Configuração e Execução do Projeto

    Como Testar a Aplicação

    Acessos ao Projeto

    Estrutura do Banco de Dados

✨ Funcionalidades

    Autenticação segura de usuários (professores).

    Formulário para inserção de parâmetros para o plano de aula (tema, ano escolar, duração).

    Geração de planos de aula com quatro componentes principais via IA:

        Introdução lúdica

        Objetivo de aprendizagem da BNCC

        Passo a passo da atividade

        Rubrica de avaliação

    Armazenamento seguro e individual dos planos de aula gerados para cada usuário.

🛠️ Stack de Tecnologias

    Backend & Banco de Dados: Supabase (PostgreSQL, Auth, Edge Functions)

    Inteligência Artificial: Google Gemini API

    Linguagem da Função Serverless: TypeScript (Deno Runtime)

📐 Arquitetura e Decisões Técnicas

A arquitetura foi baseada na filosofia "PostgreSQL-first" do Supabase, priorizando a segurança e a integridade dos dados.

    Banco de Dados (Modelagem):

        Decisão: Utilizar uma única tabela planos_de_aula para armazenar tanto os inputs do usuário quanto os outputs da IA.

        Por quê? Simplifica a arquitetura e mantém todos os dados relacionados a um plano de aula em um único registro, facilitando consultas e a manutenção. A tabela foi vinculada diretamente a auth.users para garantir a posse dos dados.

    Segurança (Row-Level Security - RLS):

        Decisão: Habilitar RLS na tabela planos_de_aula desde sua criação, com uma política de "negação por padrão".

        Por quê? Esta é a abordagem mais segura. Foram criadas políticas explícitas de SELECT, INSERT, UPDATE e DELETE baseadas na função auth.uid(), garantindo que um usuário só possa visualizar e gerenciar seus próprios planos de aula.

    Lógica de Geração (Edge Function):

        Decisão: Centralizar toda a lógica de geração de conteúdo em uma única Edge Function (gerador-plano-aula).

        Por quê? Mantém a separação de responsabilidades. O banco de dados armazena os dados, e a função serverless stateless cuida da orquestração: autenticação do usuário via JWT, comunicação com a API externa do Gemini, tratamento da resposta e salvamento no banco. Isso cria um backend escalável e de fácil manutenção.

    Integração com a IA:

        Decisão: Construir um prompt estruturado que instrui o Gemini a retornar a resposta em um formato JSON válido.

        Por quê? Garante a consistência e a previsibilidade da resposta da IA. O código da Edge Function foi preparado para extrair o conteúdo JSON de dentro de blocos de Markdown (```json ... ```), um comportamento comum de LLMs, tornando a solução mais robusta.

🤖 Escolha do Modelo de IA

    Modelo Escolhido: gemini-2.5-flash.

    Justificativa: O requisito era utilizar um modelo do Google AI Studio com acesso gratuito. Após depuração, foi identificado que o modelo gemini-2.5-flash era o mais recente disponível que respondia corretamente às chamadas da API. Ele oferece um excelente equilíbrio entre velocidade, qualidade na geração de texto para este caso de uso e está disponível no tier gratuito, atendendo a todos os requisitos do projeto.

🧗 Desafios Encontrados e Soluções

    Inconsistência nas Migrações do Supabase: Durante os testes, o estado do banco de dados remoto ficou dessincronizado com o histórico de migrações locais, impedindo novos pushes.

        Solução: A solução envolveu a limpeza manual dos objetos (tabelas, funções) e do histórico (supabase_migrations.schema_migrations) diretamente no banco remoto via SQL Editor, para então realizar um db push limpo e completo a partir da fonte da verdade local.

    Integração com a API do Gemini: A API retornava erros 404 Not Found para nomes de modelos aparentemente corretos e, posteriormente, um erro de parsing de JSON.

        Solução: O erro 404 foi resolvido ao forçar a importação da versão @latest da biblioteca do Google AI, que acessa a API v1 estável. O erro de parsing foi resolvido adicionando uma lógica para extrair o objeto JSON de dentro de blocos de código Markdown retornados pela IA, tornando a função mais resiliente.

🚀 Configuração e Execução do Projeto

Siga os passos abaixo para configurar e rodar este projeto.

Pré-requisitos

    Supabase CLI instalada.

    Deno instalado.

Instalação

    Clone o repositório:
    Bash

git clone https://github.com/alexdiasritter/teste-tecnico-2-escribo

Vincule ao seu projeto Supabase:

    Crie um novo projeto no Supabase.

    Copie a referência do seu projeto (Project Ref).

    Execute no terminal:
    Bash

    supabase link --project-ref <SUA_PROJECT_REF>

Configure as Variáveis de Ambiente (Secrets):
Você precisará de três chaves:

    SUPABASE_URL e SUPABASE_ANON_KEY (encontradas em Project Settings > API no seu dashboard Supabase).

    GEMINI_API_KEY (gerada no Google AI Studio).

Execute o comando abaixo no terminal, substituindo os placeholders:
Bash

    supabase secrets set \
      SUPABASE_URL=SUA_URL_DO_SUPABASE \
      SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE \
      GEMINI_API_KEY=SUA_CHAVE_DA_API_DO_GEMINI

Execução

    Envie as migrações do banco de dados:
    Este comando criará a tabela planos_de_aula e aplicará as políticas de segurança.
    Bash

supabase db push

Faça o deploy da Edge Function:
Bash

    supabase functions deploy gerador-plano-aula

A aplicação backend estará no ar e pronta para receber requisições.

🧪 Como Testar a Aplicação

A forma mais fácil de testar é usando uma ferramenta como o Postman.

    Cadastro: Faça um POST para [SUA_URL_SUPABASE]/auth/v1/signup com um JSON contendo email e password.

    Confirme o E-mail: Clique no link de confirmação enviado para o e-mail cadastrado.

    Login: Faça um POST para [SUA_URL_SUPABASE]/auth/v1/token?grant_type=password com as mesmas credenciais para obter um access_token (JWT).

    Gerar Plano de Aula: Faça um POST para [SUA_URL_SUPABASE]/functions/v1/gerador-plano-aula.

        Header Authorization: Bearer <SEU_JWT_TOKEN>

        Body (JSON):
        JSON

        {
          "tema_aula": "Fotossíntese",
          "ano_escolar": "6º ano do Ensino Fundamental",
          "duracao_minutos": 45
        }

🌐 Acessos ao Projeto

    URL da Função Principal: [COLE A URL DA SUA FUNÇÃO AQUI: .../functions/v1/gerador-plano-aula]

    Acesso ao Projeto Supabase: Um convite de Read Only foi enviado para o e-mail da avaliação.

    Credenciais de Teste:

        Email: professor.teste@escola.com

        Senha: senha-segura-e-longa-123

🗃️ Estrutura do Banco de Dados

Os scripts SQL para a criação da tabela planos_de_aula e suas políticas de segurança estão localizados no diretório supabase/migrations/.
