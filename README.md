# 🎸 Clube do Álbum

> Plataforma web completa para audições semanais, notas, resenhas e leaderboards do **Clube do Álbum**. Desenvolvida no estilo *Letterboxd / RateYourMusic* com identidade visual escura voltada aos amantes de Heavy Metal e Rock.

---

## 📌 Visão Geral

O **Clube do Álbum** nasceu para substituir o gerenciamento manual por planilhas de um grupo de audição musical. Semanalmente, os membros definem um tema (ex: *"Semana do Nu Metal & Anos 2000"*, *"Clássicos do Metal Progressivo"*), indicam até **2 discos por membro**, ouvem na íntegra e avaliam com notas de **0.0 a 10.0** e resenhas críticas.

A aplicação calcula médias em tempo real, classifica os álbuns em faixas temáticas exclusivas (*Masterpiece*, *É o Aço*, *Bom*, *Meia Boca*, *Ruim*, *Absolute Porcaria*), ranqueia os melhores e piores curadores (*Hall da Fama* vs *Troféu Podrinho*) e mantém um arquivo histórico completo das reuniões.

---

## 🚀 Tecnologias Utilizadas

### Backend (`ClubeDoAlbum.Api`)
- **.NET 10 / ASP.NET Core Web API**: Alta performance, tipagem forte e suporte a microsserviços.
- **Entity Framework Core 10 (Npgsql)**: ORM robusto com migrações e mapeamento objeto-relacional.
- **PostgreSQL (Supabase)**: Banco de dados relacional hospedado na nuvem na região de São Paulo (`sa-east-1`), utilizando conexão via Connection Pooler IPv4.
- **Spotify Web API (Client Credentials)**: Proxy seguro no backend para busca de metadados, capas em alta resolução e links oficiais sem expor chaves secretas no cliente.
- **JWT (JSON Web Token) & BCrypt.Net**: Autenticação stateless segura com hash salgado de senhas.
- **Memory Cache**: Caching em memória do token de acesso do Spotify para redução de latência e cotas de requisição.

### Frontend (`ClubeDoAlbum.Web`)
- **React 19 & TypeScript**: Interface reativa, modular e orientada a componentes tipados.
- **Vite 8**: Ferramenta de build ultrarrápida com Hot Module Replacement (HMR).
- **Tailwind CSS v4**: Motor moderno de estilização utilitária com visual dark sóbrio (*obsidian, zinc, crimson, gold, emerald*).
- **Lucide React**: Biblioteca minimalista de ícones vetorizados.
- **Axios**: Cliente HTTP configurado com interceptors para injeção automática de tokens JWT.

---

## ✨ Principais Funcionalidades

1. **Semana Temática & Cotas de Curadoria:**
   - Gestão de edições temáticas (*Edição #1: Semana do Caos*, etc.) com data de reunião.
   - Validação da cota de **até 2 álbuns por membro** por rodada temática ativa.
   - Painel dinâmico na tela inicial mostrando em tempo real o status de indicação de cada amigo (ex: `Luiz: 1/2`, `Membro Fundador: 2/2`).

2. **Busca Integrada no Spotify com Múltiplas Opções:**
   - Digite o nome da banda (ex: `"Metallica"`, `"Iron Maiden"`) para visualizar até 10 opções de álbuns com capas e anos de lançamento para escolha direta.
   - Suporte a link direto (`open.spotify.com/album/...`) com resolução instantânea de metadados.

3. **Sistema de Avaliação & Tiers Customizados:**
   - Controle interativo numérico e slider contínuo de **0.0 a 10.0** (passo 0.1).
   - Selos temáticos:
     - `8.0` a `10.0`: **Masterpiece** *(dourado)*
     - `7.0` a `7.9`: **É o Aço** *(esmeralda)*
     - `6.0` a `6.9`: **Bom** *(azul aço)*
     - `4.0` a `5.9`: **Meia Boca** *(zinco neutro)*
     - `2.0` a `3.9`: **Ruim** *(laranja queimado)*
     - `0.0` a `1.9`: **Absolute Porcaria** *(carmesim escuro)*

4. **Leaderboards & Estatísticas:**
   - **O Grande Ranking:** Tabela consolidada com todos os álbuns avaliados, notas médias, contagem de reviews e filtros por tier.
   - **Ranking de Curadores:** *Hall da Fama* (maiores médias de indicação) e *Troféu Podrinho* (menores médias).
   - **Arquivo de Edições:** Histórico de reuniões anteriores, álbuns debatidos e o grande vencedor da semana com troféu comemorativo.

5. **Cadastro Retroativo (Migração de Planilhas):**
   - Importe encontros passados em lote preenchendo as notas dos membros de uma só vez direto para o acervo histórico (`JaOuvido`), sem poluir a semana ativa.

6. **Área do Membro:**
   - Diário pessoal (*Minhas Avaliações*) com edição de notas e resenhas em tempo real.
   - Customização de perfil: nome de exibição, foto de perfil (avatar) e alteração de senha.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
- [.NET 10 SDK](https://dotnet.microsoft.com/)
- [Node.js 20+](https://nodejs.org/)
- Conta e credenciais configuradas no Supabase e Spotify Developer.

### 1. Backend (.NET API)
```bash
cd ClubeDoAlbum.Api
dotnet restore
dotnet run --launch-profile http
```
> A API estará disponível em: `http://localhost:5046`

### 2. Frontend (React + Vite)
```bash
cd ClubeDoAlbum.Web
npm install
npm run dev
```
> A aplicação Web estará disponível em: `http://localhost:5173`

---

## 📖 Documentação Técnica Detalhada

Para conferir o passo a passo de desenvolvimento, explicações arquiteturais de cada módulo, descrição de cada arquivo e guia de endpoints REST, consulte a documentação técnica completa:

👉 **[DOCUMENTACAO.md](./DOCUMENTACAO.md)**

---

*Feito para e pelo Clube do Álbum 🤘*
