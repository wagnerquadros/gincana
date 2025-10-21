# Configuração do Firebase - Uni2School

Este guia detalha como configurar o Firebase para o projeto Uni2School.

## 🔥 Configuração Inicial do Firebase

### 1. Criar Projeto no Firebase Console

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Digite o nome do projeto (ex: `uni2school-gincana`)
4. Aceite os termos e continue
5. Desabilite o Google Analytics (opcional)
6. Clique em "Criar projeto"

### 2. Configurar Authentication

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Vá para a aba "Sign-in method"
4. Habilite "Email/Password"
5. Clique em "Salvar"

### 3. Configurar Firestore Database

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (para desenvolvimento)
4. Selecione uma localização (recomendado: us-central1)
5. Clique em "Concluído"

### 4. Configurar Regras de Segurança do Firestore

Substitua as regras padrão pelas seguintes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Regras para equipes
    match /teams/{teamId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'professor' || request.auth.token.role == 'dev');
    }
    
    // Regras para provas
    match /provas/{provaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'professor' || request.auth.token.role == 'dev');
    }
  }
}
```

### 5. Obter Credenciais do Projeto

1. Clique no ícone de configurações (⚙️) ao lado de "Visão geral do projeto"
2. Clique em "Configurações do projeto"
3. Role para baixo até "Seus aplicativos"
4. Clique no ícone da Web (</>)
5. Digite um nome para o app (ex: `uni2school-web`)
6. **NÃO** marque "Também configure o Firebase Hosting"
7. Clique em "Registrar app"
8. Copie as credenciais do Firebase

### 6. Configurar o Arquivo de Configuração

Edite o arquivo `src/config/firebase.ts` e substitua as credenciais:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## 🔐 Configuração de Roles de Usuário

### Criando Usuários com Roles

Para criar usuários com roles específicos, você pode usar o Firebase Console ou criar um script de inicialização:

#### Método 1: Via Firebase Console
1. Vá para Authentication > Users
2. Adicione usuários manualmente
3. Para cada usuário, vá para Firestore Database
4. Crie um documento na collection `users` com:
   ```json
   {
     "uid": "ID_DO_USUARIO",
     "email": "usuario@email.com",
     "role": "professor", // ou "aluno" ou "dev"
     "displayName": "Nome do Usuário"
   }
   ```

#### Método 2: Via Código (Recomendado)
Crie um arquivo `src/utils/setupUsers.ts`:

```typescript
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export async function createUserWithRole(
  email: string, 
  password: string, 
  displayName: string, 
  role: 'aluno' | 'professor' | 'dev'
) {
  try {
    // Criar usuário
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar perfil
    await updateProfile(user, { displayName });

    // Criar documento do usuário no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      role: role,
      displayName: displayName
    });

    console.log('Usuário criado com sucesso:', user.uid);
    return user;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

// Exemplo de uso:
// createUserWithRole('prof@escola.com', 'senha123', 'Professor Silva', 'professor');
```

## 📊 Estrutura de Dados no Firestore

### Collections e Documentos

O sistema utiliza as seguintes collections:

#### `users`
```json
{
  "uid": "string",
  "email": "string",
  "role": "aluno" | "professor" | "dev",
  "displayName": "string (opcional)",
  "teamId": "string (opcional)"
}
```

#### `teams`
```json
{
  "id": "string",
  "name": "string",
  "description": "string (opcional)",
  "color": "string",
  "createdAt": "timestamp",
  "createdBy": "string (uid do professor)",
  "members": ["array de uids"],
  "totalPoints": "number"
}
```

#### `provas`
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "instructions": "string",
  "maxPoints": "number",
  "createdAt": "timestamp",
  "createdBy": "string (uid do professor)",
  "isActive": "boolean",
  "submissions": [
    {
      "id": "string",
      "studentId": "string",
      "studentName": "string",
      "teamId": "string",
      "teamName": "string",
      "submittedAt": "timestamp",
      "content": "string",
      "points": "number (opcional)",
      "maxPoints": "number",
      "feedback": "string (opcional)",
      "evaluatedAt": "timestamp (opcional)",
      "evaluatedBy": "string (opcional)",
      "isGradeVisible": "boolean"
    }
  ]
}
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de Permissão no Firestore
```
Error: Missing or insufficient permissions
```
**Solução**: Verifique se as regras de segurança estão configuradas corretamente e se o usuário tem o role apropriado.

#### 2. Erro de Autenticação
```
Error: Firebase: Error (auth/user-not-found)
```
**Solução**: Verifique se o usuário foi criado corretamente e se o email está correto.

#### 3. Erro de Configuração
```
Error: Firebase: No Firebase App '[DEFAULT]' has been created
```
**Solução**: Verifique se o Firebase foi inicializado corretamente no arquivo de configuração.

#### 4. Erro de Timestamp
```
Error: submission.evaluatedAt?.toLocaleDateString is not a function
```
**Solução**: Este erro foi corrigido no código, mas se persistir, verifique se os timestamps estão sendo convertidos corretamente.

### Logs de Debug

Para habilitar logs detalhados do Firebase, adicione no início do arquivo `main.tsx`:

```typescript
import { enableLogging } from 'firebase/firestore';

// Habilitar logs do Firestore (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  enableLogging(true);
}
```

## 🔄 Backup e Restauração

### Backup dos Dados

1. No Firebase Console, vá para Firestore Database
2. Clique em "Exportar dados"
3. Escolha o formato (JSON ou CSV)
4. Baixe o arquivo

### Restauração dos Dados

1. No Firebase Console, vá para Firestore Database
2. Clique em "Importar dados"
3. Selecione o arquivo de backup
4. Confirme a importação

## 📈 Monitoramento

### Firebase Analytics (Opcional)

Para habilitar analytics:

1. No Firebase Console, vá para Analytics
2. Clique em "Começar"
3. Configure as métricas desejadas
4. Adicione o código de tracking no projeto

### Performance Monitoring

Para monitorar performance:

1. Instale o Firebase Performance
2. Configure métricas customizadas
3. Monitore tempos de carregamento e operações

## 🛡 Segurança

### Boas Práticas

1. **Nunca exponha credenciais** em repositórios públicos
2. **Use variáveis de ambiente** para credenciais em produção
3. **Configure regras de segurança** adequadas
4. **Monitore logs** regularmente
5. **Mantenha dependências atualizadas**

### Configuração de Produção

Para produção, configure:

1. **Domínios autorizados** no Authentication
2. **Regras de segurança** mais restritivas
3. **Backup automático** do Firestore
4. **Monitoramento de performance**
5. **Alertas de segurança**

---

**Configuração concluída! O sistema está pronto para uso.**
