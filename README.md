**Clube do Álbum**
O Clube do Álbum é uma aplicação web desenvolvida para gerenciar audições musicais, avaliações e resenhas. A plataforma centraliza a indicação semanal de discos, o cálculo automático de médias e a manutenção do histórico de reuniões do grupo, substituindo o controle manual feito anteriormente por meio de planilhas.



**Tecnologias Utilizadas**
Backend (ClubeDoAlbum.Api)
-> .NET 10 / ASP.NET Core Web API: Estrutura principal da API REST.

-> Entity Framework Core 10 (Npgsql): ORM utilizado para o mapeamento objeto-relacional.

-> PostgreSQL (Supabase): Banco de dados relacional hospedado na nuvem na região de São Paulo (sa-east-1) via Connection Pooler IPv4.

-> Spotify Web API: Integração no backend para busca de metadados, capas em alta resolução e tracklist de faixas, utilizando Client Credentials.

-> MusicBrainz API: Integração para detecção e catálogo automático do país de origem e nacionalidade das bandas/artistas.

-> JWT & BCrypt.Net: Autenticação stateless e hashing de senhas.

-> Memory Cache: Armazenamento em cache de tokens de acesso, tracklists e consultas a APIs externas para redução de requisições.



**Frontend**
-> React 19 & TypeScript: Desenvolvimento da interface de usuário.

-> Vite 8: Ferramenta de build e execução local.

-> Tailwind CSS v4: Estilização dos componentes da interface com design system dark e efeitos visuais.

-> Lucide React: Biblioteca de ícones vetorizados.

-> Axios: Cliente HTTP para comunicação com a API.



**Funcionalidades**
-> Gestão de Semanas Temáticas: Criação de edições temáticas, controle de cotas de indicações por membro ativo (até 2 por semana) e ajuste flexível da data da reunião exclusivo para administradores sem afetar os dados da rodada.

-> Busca de Metadados & Faixas: Integração com o Spotify para busca de álbuns por texto ou resolução via URL direta, com listagem completa das faixas (tracklist) na página de detalhes.

-> País de Origem da Banda: Detecção automática da nacionalidade da banda via MusicBrainz com exibição de bandeira nacional (🇬🇧, 🇧🇷, 🇺🇸, 🇸🇪, 🇩🇪) e tooltip informativo.

-> Meu Checklist da Rodada & Avaliação Individual: Painel personalizado para cada membro logado com barra de progresso, filtro rápido ("Faltam Ouvir" vs "Avaliados"), badges com a nota individual já atribuída e atenuação visual elegante de discos concluídos.

-> Sistema de Avaliações: Registro de notas (0.0 a 10.0) e resenhas textuais. Os álbuns recebem classificações em categorias pré-definidas com base na média final obtida (Masterpiece, É o Aço, Bom, Meia Boca, Ruim, Absolute Porcaria).

-> Rankings e Estatísticas: Tabelas de classificação gerais para os álbuns avaliados e um ranking de curadores baseado na média das notas de suas respectivas indicações.

-> Perfil de Curador & Histórico de Indicações: Acesso ao perfil individual de qualquer membro com avatar destacado em proporção de capa de álbum, histórico completo de álbuns indicados com histórico completo de álbuns indicados ordenados por nota média, badges de colocação, estatísticas gerais (média do curador, melhor e pior indicação) e lista de resenhas dadas.

-> Histórico de Semanas: Registro cronológico de todas as edições e semanas concluídas, com temas, notas médias, álbuns ouvidos e histórico consolidado do clube.

-> Gerenciamento de Perfil: Área do usuário para atualização de credenciais, alteração de foto de perfil (com upload direto do computador ou link web) e visualização do histórico pessoal de resenhas.



**Como Executar Localmente**
Pré-requisitos
-> .NET 10 SDK

-> Node.js 20+

-> Credenciais ativas e configuradas no Supabase e no Spotify Developer Dashboard.



**Executando o Backend**
Bash
cd ClubeDoAlbum.Api
dotnet restore
dotnet run --launch-profile http
A API estará disponível em: http://localhost:5046



**Executando o Frontend**
Bash
cd ClubeDoAlbum.Web
npm install
npm run dev
A aplicação Web estará disponível em: http://localhost:5173



**Documentação Técnica**
Para detalhes sobre a arquitetura dos módulos, descrição da estrutura de arquivos e especificação dos endpoints REST, consulte o arquivo DOCUMENTACAO.md.
