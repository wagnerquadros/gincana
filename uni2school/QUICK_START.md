# ⚡ Quick Start - Uni2School

## 🚀 Setup em 5 Minutos

### 1. Clone e Instale
```bash
git clone <url-do-repositorio>
cd uni2school
npm install
```

### 2. Configure Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative Authentication (Email/Password)
4. Ative Firestore Database
5. Copie as credenciais

### 3. Configure Credenciais
Edite `src/config/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  // ... outras credenciais
};
```

### 4. Execute
```bash
npm run dev
```

### 5. Acesse
Abra `http://localhost:5173` no navegador

## 👥 Criar Usuários de Teste

### Professor
1. Registre-se com email: `prof@teste.com`
2. No Firebase Console, vá para Firestore
3. Crie documento em `users`:
```json
{
  "uid": "ID_DO_USUARIO",
  "email": "prof@teste.com",
  "role": "professor",
  "displayName": "Professor Teste"
}
```

### Aluno
1. Registre-se com email: `aluno@teste.com`
2. No Firebase Console, vá para Firestore
3. Crie documento em `users`:
```json
{
  "uid": "ID_DO_USUARIO",
  "email": "aluno@teste.com",
  "role": "aluno",
  "displayName": "Aluno Teste"
}
```

## 🎯 Teste Rápido

### Como Professor
1. Faça login como professor
2. Crie uma equipe
3. Crie uma prova
4. Avalie submissões

### Como Aluno
1. Faça login como aluno
2. Escolha uma equipe
3. Participe de provas
4. Veja suas notas

## 📚 Documentação Completa

- **README.md** - Documentação principal
- **FIREBASE_SETUP.md** - Setup detalhado do Firebase
- **DEVELOPMENT_GUIDE.md** - Guia de desenvolvimento
- **FUNCIONALIDADES.md** - Lista de funcionalidades
- **DOCUMENTATION_INDEX.md** - Índice de navegação

## 🆘 Problemas Comuns

### Erro de Permissão
- Verifique as regras do Firestore
- Confirme se o usuário tem role correto

### Erro de Conexão
- Verifique as credenciais do Firebase
- Confirme se o projeto está ativo

### Erro de Timestamp
- Este erro foi corrigido na versão atual
- Se persistir, verifique a conversão de datas

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Linting
npm run lint

# Type Check
npm run typecheck

# Preview Build
npm run preview
```

---
