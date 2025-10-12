# 🏗️ Arquitetura do Projeto

A arquitetura segue o padrão de camadas, separando responsabilidades entre controle, serviço e repositório.
O backend foi desenvolvido em **Express.js**, escolhido pela leveza e simplicidade, com Firebase (Firestore) como banco de dados.

### 🖥️ Frontend

- **React + Vite**
- **Context API** para gerenciamento de estado global
- **TailwindCSS** para estilização
- **React Router** para roteamento

### ⚙️ Backend

- **Express.js** (alternativas consideradas: NestJS e Fastify)
- Estrutura modular: controllers, services e repositories
- Autenticação baseada em **JWT**
- Integração com **Firebase (Firestore)**

### 🗄️ Banco de Dados

- Banco principal: **Firebase (Firestore)**
- Estrutura de dados ainda em definição

### 🗂️ Estrutura do Projeto

Frontend e backend são organizados em pastas independentes dentro do mesmo repositório.

# 🗂️ Estrutura do Projeto (Frontend + Backend)

| Estrutura          | Descrição                               |
| ------------------ | --------------------------------------- |
| backend/           | Pasta raiz do backend                   |
| ├─ src/            | Código fonte principal do backend       |
| │ ├─ config/       | Configurações do app, banco, JWT, .env  |
| │ ├─ routes/       | Definição de endpoints                  |
| │ ├─ controllers/  | Entrada das requisições                 |
| │ ├─ services/     | Regras de negócio                       |
| │ ├─ repositories/ | Acesso ao banco de dados                |
| │ ├─ models/       | Entidades/ORM                           |
| │ ├─ middlewares/  | Auth, validações, tratamento de erros   |
| │ ├─ utils/        | Helpers, formatação, funções auxiliares |
| │ └─ app.js        | Inicialização do servidor               |
| ├─ tests/          | Testes unitários e de integração        |
| ├─ package.json    | Configurações do projeto e dependências |
| └─ .env            | Variáveis de ambiente                   |

| Estrutura      | Descrição                               |
| -------------- | --------------------------------------- |
| frontend/      | Pasta raiz do frontend (React + Vite)   |
| └─ src/        | Código fonte principal do frontend      |
| ├─ components/ | Componentes reutilizáveis               |
| ├─ pages/      | Páginas e rotas                         |
| ├─ hooks/      | Custom hooks                            |
| ├─ services/   | Chamadas à API / integração com backend |
| ├─ context/    | Context API para estado global          |
| └─ assets/     | Imagens, ícones, estilos                |

### 🔹 Boas práticas no frontend

- Componentes pequenos e reutilizáveis
- Pastas por funcionalidade quando necessário
- Padronização com ESLint + Prettier
- Versionamento de commits semântico (feat, fix, docs, etc.)

---
