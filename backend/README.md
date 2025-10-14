# Meu Backend (Express) - Scaffold

Estrutura exemplo com:

- Express.js
- Autenticação JWT (login, protected route, logout via blacklist)
- Suporte opcional a Firebase Firestore (via `serviceAccountKey.json`)
- Fallback para DB local (JSON) se o Firebase não estiver configurado

## Como usar

1. Instale dependências:
   ```bash
   npm install
   ```
2. Crie um `.env` (use o arquivo `.env.example` como modelo).
3. Se quiser usar Firebase:
   - Crie um projeto no Firebase Console
   - Gere um Service Account JSON e coloque como `serviceAccountKey.json` na raiz do projeto
   - Defina `USE_FIREBASE=true` no `.env`
4. Rodar:
   ```bash
   npm start
   ```

## Endpoints principais

- `POST /auth/login` → body `{ "username": "...", "password": "..." }` → retorna `{ token }`
- `GET /auth/me` → header `Authorization: Bearer <token>` → dados do usuário
- `POST /auth/logout` → header `Authorization: Bearer <token>` → faz blacklist do token

## Observações
- Se não usar Firebase, os usuários são carregados do arquivo `data/local_users.json`.
- Para criar um hash de senha use `npm run hashpw`.


## Teste rápido com DB local

Usuário padrão incluído em `data/local_users.json`:

```
email: diogo@example.com
username: diogo
password: 123456
```
