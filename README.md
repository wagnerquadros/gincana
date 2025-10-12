# Grupo 01

## Clonando o repositório

```
cd existing_repo
git remote add origin https://gitlab.unipampa.edu.br/ales/rp-vi-2025-2/grupo-01.git
git branch -M main
git push -uf origin main
```

## 📌 Fluxo de Branches e Commits

### Branches

- **main**: código de produção. Recebe apenas merges de release.
- **develop**: integração contínua. Base para novas funcionalidades.
- **feature/\***: implementações a partir de `develop`. Ex.: `feature/usuario-crud`
- **fix/\***: correções não críticas a partir de `develop`. Ex.: `fix/validacao-email`
- **hotfix/\***: correções urgentes a partir de `main`. Ex.: `hotfix/cors-500`

> Commits diretos em `main` e `develop` são proibidos. Use PR.

## 🧾 Commits Semânticos

**Formato:**

```
<type>(<scope>): <mensagem curta no imperativo>

[corpo opcional]
```

**Regras:**

- Use **imperativo** na mensagem curta (ex.: “adiciona”, “corrige”, “atualiza”).
- Máx. ~72 caracteres na primeira linha.
- O `scope` é **opcional**, mas recomendado (ex.: `api`, `auth`, `pontuacao`, `infra`).
- Uma linha em branco separa o título do corpo.

**Tipos:**

- `feat` – nova funcionalidade
- `fix` – correção de bug
- `docs` – apenas documentação (README, comentários)
- `style` – formatação/estilo (sem alterar lógica; ex.: lint, espaços)
- `refactor` – refatoração (sem nova feature/bugfix)
- `test` – testes (unitários, integração, mocks)
- `build` – mudanças de build/dep (Maven/Gradle, Docker, npm)

**Exemplos:**

- feat(pontuacao): adiciona endpoint para somar pontos por equipe
- fix(auth): corrige validação de token expirado no filtro
- docs(readme): documenta fluxo de branches e commits
- style(api): aplica formatador e organiza imports
- refactor(service): extrai cálculo de ranking para classe dedicada
- test(controller): adiciona testes GET /api/pontuacoes
- build(gradle): adiciona plugin jacoco para cobertura

## Estrutura de Pastas (início)

```text
meu-projeto/
│
├── frontend/              # Aplicação React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/        # Imagens, ícones, fontes...
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas principais (Home, Login, etc.)
│   │   ├── hooks/         # Custom hooks
│   │   ├── context/       # Context API (estado global)
│   │   ├── services/      # Conexão com API (axios/fetch)
│   │   ├── routes/        # Definições de rotas
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env               # Variáveis de ambiente (ex: URL da API)
│   ├── package.json
│   └── vite.config.js     # ou webpack.config.js, dependendo do bundler
│
├── backend/               # API Node.js
│   ├── src/
│   │   ├── config/        # Configurações (db, cors, auth...)
│   │   ├── controllers/   # Lógica dos endpoints
│   │   ├── data/          # Acesso a dados (mock ou queries)
│   │   ├── middlewares/   # Middlewares (auth, erros, logs...)
│   │   ├── models/        # Modelos de dados (caso use ORM)
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Lógica de negócio
│   │   └── server.js      # Arquivo principal
│   ├── .env
│   └── package.json
│
├── .gitignore
├── README.md
```
