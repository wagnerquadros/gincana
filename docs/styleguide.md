## 🎨 Style Guide

### 🧹 Lint e formatação 
- A definir:
- **ESLint** para padronização de código JS/TS  
- **Prettier** para formatação consistente  
- **EditorConfig** para unificar indentação e quebras de linha entre editores  
- **Husky + lint-staged** para executar lint/format no pre-commit   ------------------  confirmar

### 📁 Organização de pastas
```
gincana/
├─ backend/       → API e lógica do servidor
│  └─ src/
└─ frontend/      → Interface React
   └─ src/
```

### 📜 Convenções de escrita
- **Identação:** 2 espaços  
- **Aspas:** simples `'`  
- **Ponto e vírgula:** omitido (config Prettier)  
- **Imports:** absolutos quando possível (ex.: `@/components/Button`)  
- **Nomes de arquivos:** `kebab-case.js` no frontend, `PascalCase.ts` para componentes React  

### 🗂️ Nomes de branches
- `feature/` – novas features  
- `fix/` – correções leves  
- `hotfix/` – correções urgentes  

---