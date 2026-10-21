Clube do Álbum
O Clube do Álbum é uma aplicação web desenvolvida para gerenciar audições musicais, avaliações e resenhas. A plataforma centraliza a indicação semanal de discos, o cálculo automático de médias e a manutenção do histórico de reuniões do grupo, substituindo o controle manual feito anteriormente por meio de planilhas.

Tecnologias Utilizadas
Backend (ClubeDoAlbum.Api)
.NET 10 / ASP.NET Core Web API: Estrutura principal da API REST.

Entity Framework Core 10 (Npgsql): ORM utilizado para o mapeamento objeto-relacional.

PostgreSQL (Supabase): Banco de dados relacional.

Spotify Web API: Integração no backend para busca de metadados e capas, utilizando Client Credentials.

JWT & BCrypt.Net: Autenticação stateless e hashing de senhas.

Memory Cache: Armazenamento em cache do token de acesso do Spotify para redução de requisições.

Frontend
React 19 & TypeScript: Desenvolvimento da interface de usuário.

Vite 8: Ferramenta de build e execução local.

Tailwind CSS v4: Estilização dos componentes da interface.

Lucide React: Biblioteca de ícones vetorizados.

Axios: Cliente HTTP para comunicação com a API.

Funcionalidades
Gestão de Semanas Temáticas: Criação de edições temáticas e controle de cotas de indicações por membro ativo.

Busca de Metadados: Integração com o Spotify para busca de álbuns por texto ou resolução via URL direta.

Sistema de Avaliações: Registro de notas (0.0 a 10.0) e resenhas textuais. Os álbuns recebem classificações em categorias pré-definidas com base na média final obtida.

Rankings e Estatísticas: Tabelas de classificação gerais para os álbuns avaliados e um ranking de curadores baseado na média das notas de suas respectivas indicações.

Histórico e Migração: Registro do histórico de edições concluídas e ferramenta de cadastro retroativo para importação de dados de reuniões anteriores.

Gerenciamento de Perfil: Área do usuário para atualização de credenciais, alteração de avatar e visualização do histórico pessoal de resenhas.

Como Executar Localmente
Pré-requisitos
.NET 10 SDK

Node.js 20+

Credenciais ativas e configuradas no Supabase e no Spotify Developer Dashboard.

Executando o Backend
Bash
cd ClubeDoAlbum.Api
dotnet restore
dotnet run --launch-profile http
A API estará disponível em: http://localhost:5046

Executando o Frontend
Bash
cd ClubeDoAlbum.Web
npm install
npm run dev
A aplicação Web estará disponível em: http://localhost:5173

Documentação Técnica
Para detalhes sobre a arquitetura dos módulos, descrição da estrutura de arquivos e especificação dos endpoints REST, consulte o arquivo DOCUMENTACAO.md.
