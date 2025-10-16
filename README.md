Gerador de Planos de Aula com IA

📖 Visão Geral do Projeto

Este projeto é a implementação de um sistema completo (backend e frontend) para um gerador de planos de aula personalizados, desenvolvido como parte de um teste técnico. A aplicação utiliza o Supabase para a infraestrutura de banco de dados e autenticação, a API do Google Gemini para a geração de conteúdo com Inteligência Artificial, e uma interface simples em HTML puro para a interação com o usuário.

A solução permite que um usuário autenticado forneça um tema, ano escolar e duração, e receba um plano de aula completo e estruturado, que é então salvo em seu perfil.

📚 Índice

    Funcionalidades

    Stack de Tecnologias

    Arquitetura e Decisões Técnicas

    Escolha do Modelo de IA

    Desafios Encontrados e Soluções

    Configuração e Execução do Projeto

    Como Testar a Aplicação

    Acessos ao Projeto

    Estrutura do Banco de Dados

✨ Funcionalidades

    Autenticação segura de usuários (professores) com confirmação por e-mail.

    Interface de usuário reativa que gerencia os estados de login e logout.

    Formulário para inserção de parâmetros para o plano de aula (tema, ano escolar, duração).

    Geração de planos de aula com quatro componentes principais via IA:

        Introdução lúdica

        Objetivo de aprendizagem da BNCC

        Passo a passo da atividade

        Rubrica de avaliação

    Armazenamento seguro e individual dos planos de aula gerados para cada usuário.

    Exibição do plano de aula gerado na interface após a conclusão.

🛠️ Stack de Tecnologias

    Backend & Banco de Dados: Supabase (PostgreSQL, Auth, Edge Functions)

    Inteligência Artificial: Google Gemini API

    Frontend: HTML, CSS & JavaScript (Vanilla JS), utilizando a biblioteca supabase-js via CDN.

    Linguagem da Função Serverless: TypeScript (Deno Runtime)

📐 Arquitetura e Decisões Técnicas

A arquitetura foi baseada na filosofia "PostgreSQL-first" do Supabase, priorizando a segurança e a integridade dos dados.

    Banco de Dados (Modelagem):

        Decisão: Utilizar uma única tabela planos_de_aula para armazenar tanto os inputs do usuário quanto os outputs da IA.

        Por quê? Simplifica a arquitetura e mantém todos os dados relacionados a um plano de aula em um único registro. A tabela foi vinculada diretamente a auth.users para garantir a posse dos dados.

    Segurança (Row-Level Security - RLS):

        Decisão: Habilitar RLS na tabela planos_de_aula desde sua criação, com uma política de "negação por padrão".

        Por quê? Esta é a abordagem mais segura. Foram criadas políticas explícitas de SELECT, INSERT, UPDATE e DELETE baseadas na função auth.uid(), garantindo que um usuário só possa visualizar e gerenciar seus próprios planos de aula.

    Lógica de Geração (Edge Function):

        Decisão: Centralizar toda a lógica de geração de conteúdo em uma única Edge Function (gerador-plano-aula).

        Por quê? Mantém a separação de responsabilidades. O banco de dados armazena os dados, e a função serverless stateless cuida da orquestração: autenticação, comunicação com a API do Gemini, tratamento da resposta e salvamento no banco.

    Frontend (Interface do Usuário):

        Decisão: Desenvolver uma aplicação de página única (SPA) em um único arquivo index.html com HTML, CSS e JavaScript puros.

        Por quê? Atende ao requisito de simplicidade ("pode ser um html puro") e demonstra a capacidade de construir uma interface funcional sem a necessidade de frameworks complexos. Essa abordagem não exige nenhum processo de build ou instalação de dependências (npm install), permitindo que a aplicação seja testada simplesmente abrindo o arquivo em um navegador. A comunicação com o backend é feita através da biblioteca supabase-js, importada via CDN.

    Integração com a IA:

        Decisão: Construir um prompt estruturado que instrui o Gemini a retornar a resposta em um formato JSON válido.

        Por quê? Garante a consistência da resposta da IA. O código da Edge Function foi preparado para extrair o conteúdo JSON de dentro de blocos de código Markdown (```json ... ```), um comportamento comum de LLMs, tornando a solução mais robusta.

🤖 Escolha do Modelo de IA

    Modelo Escolhido: gemini-2.5-flash (ou o último que funcionou, ex: gemini-1.5-flash-latest).

    Justificativa: O requisito era utilizar um modelo do Google AI Studio com acesso gratuito. Após depuração, foi identificado que este era o modelo mais recente disponível que respondia corretamente às chamadas da API. Ele oferece um excelente equilíbrio entre velocidade, qualidade na geração de texto para este caso de uso e está disponível no tier gratuito.

🧗 Desafios Encontrados e Soluções

    Inconsistência nas Migrações do Supabase: Durante os testes, o estado do banco de dados remoto ficou dessincronizado com o histórico de migrações locais.

        Solução: A solução envolveu a limpeza manual dos objetos (tabelas, funções) e do histórico (supabase_migrations.schema_migrations) diretamente no banco remoto via SQL Editor, para então realizar um db push limpo e completo a partir da fonte da verdade local.

    Integração com a API do Gemini: A API retornava erros 404 Not Found para nomes de modelos e, posteriormente, um erro de parsing de JSON.

        Solução: O erro 404 foi resolvido ao forçar a importação da versão @latest da biblioteca do Google AI, que acessa a API v1 estável. O erro de parsing foi resolvido adicionando uma lógica para extrair o objeto JSON de dentro de blocos de código Markdown retornados pela IA.

🚀 Configuração e Execução do Projeto

Siga os passos abaixo para configurar e rodar este projeto.

Pré-requisitos

    Supabase CLI instalada.

    Deno instalado.

    Um navegador web moderno.

Instalação do Backend

    Clone o repositório:
    Bash

git clone https://github.com/alexdiasritter/teste-tecnico-2-escribo
cd teste-tecnico-2-escribo

Vincule ao seu projeto Supabase:

    Crie um novo projeto no Supabase.

    Copie a referência do seu projeto (Project Ref).

    Execute no terminal:
    Bash

    supabase link --project-ref <SUA_PROJECT_REF>

Configure as Variáveis de Ambiente (Secrets): Você precisará de três chaves: SUPABASE_URL, SUPABASE_ANON_KEY e GEMINI_API_KEY.
Bash

    supabase secrets set \
      SUPABASE_URL=SUA_URL_DO_SUPABASE \
      SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE \
      GEMINI_API_KEY=SUA_CHAVE_DA_API_DO_GEMINI

Execução

    Envie as migrações do banco de dados:
    Bash

supabase db push

Faça o deploy da Edge Function:
Bash

    supabase functions deploy gerador-plano-aula

O backend estará no ar. Para testar o frontend, simplesmente abra o arquivo index.html em um navegador.

🧪 Como Testar a Aplicação

Você pode testar a aplicação de duas formas:

1. Interface Gráfica (Recomendado)

    Abra o arquivo index.html no seu navegador. O arquivo já está pré-configurado com as chaves de API necessárias para se conectar ao projeto.

    Use o formulário para se cadastrar e depois clique no link de confirmação no seu e-mail.

    Faça login com suas credenciais.

    Preencha os campos do formulário de geração e clique em "Gerar Plano de Aula".

2. Via API (Postman)

    Cadastro: POST para [URL_DO_PROJETO]/auth/v1/signup com um JSON { "email": "...", "password": "..." }.

    Login: POST para [URL_DO_PROJETO]/auth/v1/token?grant_type=password para obter o access_token (JWT).

    Gerar Plano de Aula: POST para [URL_DO_PROJETO]/functions/v1/gerador-plano-aula.

        Header Authorization: Bearer <SEU_JWT_TOKEN>

        Body (JSON):
        JSON

        {
          "tema_aula": "Fotossíntese",
          "ano_escolar": "6º ano do Ensino Fundamental",
          "duracao_minutos": 45
        }

🌐 Acessos ao Projeto

Credenciais da API (Públicas)

    Supabase URL: https://tdivbqcveohuaokdlfku.supabase.co

    Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaXZicWN2ZW9odWFva2RsZmt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDk1ODAsImV4cCI6MjA3NjEyNTU4MH0.R5bUTxo67-c1PdalD5JPsIPIAYJBMLqOjzhwyP-avBI

Links e Credenciais de Teste

    URL da Aplicação (Frontend): Simplesmente abra o arquivo index.html deste repositório em seu navegador.

    Acesso ao Projeto Supabase: Um convite de Read Only foi enviado para o e-mail da avaliação.

    Credenciais de Teste:

        Email: alex.diasritter@gmail.com

        Senha: senha-segura-e-longa-123

🗃️ Estrutura do Banco de Dados

Os scripts SQL para a criação da tabela planos_de_aula e suas políticas de segurança estão localizados no diretório supabase/migrations/.

    Coluna	Tipo	Descrição
    id	uuid	Chave Primária, identificador único do plano.
    created_at	timestamptz	Data e hora da criação.
    user_id	uuid	Chave Estrangeira para auth.users, identifica o dono.
    tema_aula	text	Input do usuário: tema da aula.
    ano_escolar	text	Input do usuário: ano/série da turma.
    duracao_minutos	integer	Input do usuário: duração da aula.
    introducao_ludica	text	Output da IA: introdução criativa.
    objetivo_bncc	text	Output da IA: objetivo alinhado à BNCC.
    passo_a_passo	text	Output da IA: roteiro da atividade.
    rubrica_avaliacao	text	Output da IA: critérios de avaliação.
