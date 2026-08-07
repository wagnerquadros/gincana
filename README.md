# 🏆 Gincana App — Grupo 01

> Um sistema para organizar gincanas escolares do jeito que elas merecem: com equipes, atividades, pontuação em tempo real e ranking sem discussão no pátio.

Projeto desenvolvido para a componente curricular **Resolução de Problemas VI**, do curso de Engenharia de Software da UNIPAMPA. A proposta é digitalizar a organização de uma gincana escolar: cadastro de alunos, pais e professores, formação de equipes, criação de atividades pontuáveis e cálculo automático do ranking.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=000)](https://firebase.google.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

---

## 🎯 O que o sistema resolve

Toda gincana escolar tem os mesmos problemas: planilha de pontos que ninguém atualiza, equipe que some no meio da atividade e discussão sobre quem ganhou o quê. O **Gincana App** ataca isso com quatro papéis bem definidos e um fluxo simples: organizador cria a gincana e as atividades, equipes disputam pontos, e o ranking é calculado automaticamente a partir das pontuações lançadas.

| Papel | O que faz |
|---|---|
| 🛡️ **ADM** | Administra o sistema como um todo |
| 🎪 **Organizador** | Cria gincanas, atividades e lança pontuações |
| 🎓 **Aluno** | Participa das equipes e atividades |
| 👨‍👩‍👧 **Pai** | Acompanha o desempenho do filho vinculado |

---

## 🗂️ Estrutura do repositório

```
gincana/
├── frontend/     → React 19 + Vite + TailwindCSS
├── backend/      → Node.js + Express + Firebase Firestore
└── docs/         → Arquitetura, setup, workflow, style guide, deploy
```

### 🖥️ Frontend (`frontend/`)

React 19 com Vite, TailwindCSS 4 e React Router 7. Estado global via Context API, ícones com `lucide-react`. A primeira tela funcional é a gestão de equipes (`EquipesGestor.jsx`), com modais de criação, edição, visualização e exclusão consumindo a API do backend.

### ⚙️ Backend (`backend/`)

API em Express organizada em camadas (`controllers → services → repositories/models`), com:

- **Autenticação JWT** — login, rota protegida (`/auth/me`) e logout via blacklist de token
- **Firebase Firestore** como banco principal, com **fallback para JSON local** (`data/local_users.json`) quando `USE_FIREBASE=false` — dá pra rodar o backend inteiro sem depender de credencial de Firebase
- **Cálculo de ranking** automático por gincana, somando pontos, bônus e penalidades de cada equipe

---

## 🧬 Modelo de domínio

```
Gincana ──< Atividade ──< Pontuacao >── Equipe ──< Aluno ── Usuario
                                                      └──< Pai
```

| Entidade | Papel no domínio |
|---|---|
| `Gincana` | O evento em si (nome, período, status: ATIVA / ENCERRADA / INATIVA) |
| `Atividade` | Uma prova/desafio da gincana, com pontos para 1º, 2º e 3º lugar e tipo (`COMPETICAO`, `QUIZ`, `ARRECADACAO`, `SOCIAL`, `ESPORTIVA`...) |
| `Equipe` | Grupo de alunos disputando a gincana, acumula pontuações |
| `Pontuacao` | Pontos obtidos por uma equipe em uma atividade, com bônus e penalidade |
| `Usuario` | Conta base (nome, e-mail, senha, `role`) usada por Aluno, Pai, Organizador e ADM |
| `Notificacao` | Avisos vinculados a uma gincana/atividade, com status de envio |

---

## 🔌 Principais endpoints

```
POST   /auth/login              → autentica e retorna token JWT
GET    /auth/me                 → dados do usuário autenticado
POST   /auth/logout             → invalida o token (blacklist)

GET    /equipes                 → lista equipes
POST   /equipes                 → cria equipe
GET    /equipes/:id             → detalhes de uma equipe
PUT    /equipes/:id             → atualiza equipe
DELETE /equipes/:id             → remove equipe

GET    /gincanas                → lista gincanas
POST   /gincanas                → cria gincana
GET    /gincanas/:id            → detalhes de uma gincana
PUT    /gincanas/:id            → atualiza gincana
PATCH  /gincanas/:id/encerrar   → encerra a gincana
DELETE /gincanas/:id            → remove gincana
GET    /gincanas/:id/ranking    → ranking calculado das equipes

PATCH  /atividades/:id/encerrar → encerra uma atividade
```

---

## 🚀 Rodando o projeto localmente

### Backend

```bash
cd backend
npm install
cp .env.example .env   # ajuste JWT_SECRET e USE_FIREBASE
npm start               # ou: npm run dev (com nodemon)
```

Sem Firebase configurado, o backend cai automaticamente para os usuários de `data/local_users.json` — ótimo para testar sem depender de credenciais externas. Para usar o Firestore de verdade, gere um Service Account no console do Firebase, salve como indicado em `backend/notes/PUT_SERVICE_ACCOUNT_HERE.txt` e defina `USE_FIREBASE=true`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentação

O projeto mantém documentação viva em `docs/`, incluindo:

- [`arquitetura.md`](docs/arquitetura.md) — visão geral das camadas e stack
- [`setup.md`](docs/setup.md) — dependências e configuração detalhada
- [`workflow.md`](docs/workflow.md) — fluxo de branches (`main`, `develop`, `feature/*`, `fix/*`, `hotfix/*`)
- [`styleguide.md`](docs/styleguide.md) — padrões de código e organização de pastas
- [`contributing.md`](docs/contributing.md) — como contribuir
- [`deploy.md`](docs/deploy.md) — estratégia de deploy (Vercel para o front, Render/Railway para o back, Firestore como banco)
- `Gincana_-_Documentação_Base.pdf` e diagramas de classes (`docs/classes/`)

---

## 🧾 Commits semânticos

```
<tipo>(<escopo>): <mensagem curta no imperativo>
```

`feat` · `fix` · `docs` · `style` · `refactor` · `test` · `build` — commits diretos em `main`/`develop` são proibidos, tudo passa por PR a partir de `feature/*`.

---

## 👥 Grupo 01

Repositório mantido pelo Grupo 01 da disciplina de Resolução de Problemas VI — Engenharia de Software, UNIPAMPA.
