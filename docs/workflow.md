## 🌀 Workflow

### 📌 Clonando o Repositório
```bash
cd existing_repo
git remote add origin https://gitlab.unipampa.edu.br/ales/rp-vi-2025-2/grupo-01.git
git branch -M main
git push -uf origin main
```

### 🌱 Fluxo de Branches

| Branch        | Finalidade                          | Origem   | Merge para |
|---------------|-------------------------------------|----------|------------|
| `main`        | Código de produção                  | —        | —          |
| `develop`     | Integração contínua                 | main     | release    |
| `feature/*`   | Novas funcionalidades               | develop  | develop    |
| `fix/*`       | Correções não críticas              | develop  | develop    |
| `hotfix/*`    | Correções urgentes em produção      | main     | main → develop |

⚠️ **Regra:** commits diretos em `main` e `develop` são **proibidos**. Sempre usar Pull Requests.

### 🧾 Commits Semânticos

Formato:
```
<type>(<scope>): <mensagem curta no imperativo>

[corpo opcional]
```

Regras:
- Mensagem curta no **imperativo** (ex.: "adiciona", "corrige", "atualiza").  
- Até ~72 caracteres na primeira linha.  
- `scope` é opcional, mas recomendado (ex.: api, auth, infra).  

Tipos aceitos:
- **feat** – nova funcionalidade  
- **fix** – correção de bug  
- **docs** – alterações de documentação  
- **style** – ajustes de formatação/estilo (sem alterar lógica)  
- **refactor** – refatoração de código  
- **test** – adição/ajuste de testes  
- **build** – mudanças de build/dep (npm, Docker, etc.)  

Exemplos:
```
feat(pontuacao): adiciona endpoint para somar pontos
fix(auth): corrige validação de token expirado
docs(readme): documenta fluxo de branches e commits
style(api): aplica formatador e organiza imports
refactor(service): extrai cálculo de ranking para classe dedicada
test(controller): adiciona testes GET /api/pontuacoes
build(gradle): adiciona plugin jacoco para cobertura
```

---