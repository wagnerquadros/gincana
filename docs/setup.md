## ⚙️ Setup do Projeto

O projeto utiliza **Node.js** e **Express** no backend, **React com Vite** no frontend, e **Firebase (Firestore)** como banco de dados principal.

---

### 📦 Dependências do Backend

| Pacote         | Versão  | Função no projeto                                       |
| -------------- | ------- | ------------------------------------------------------- |
| bcrypt         | 5.1.1   | Hash de senhas e comparação segura                      |
| dotenv         | 16.6.1  | Carrega variáveis de ambiente do arquivo `.env`         |
| express        | 4.21.2  | Servidor HTTP e roteamento de requisições               |
| firebase-admin | 11.11.1 | Integração com Firebase / Firestore                     |
| jsonwebtoken   | 9.0.2   | Geração e validação de tokens JWT                       |
| nodemon        | 2.0.22  | Reinício automático do servidor durante desenvolvimento |

---

### 📥 Pré-requisitos

- Node.js LTS (>= 18)
- npm ou yarn
- Git

### 🚀 Instalação

1.  Clonar o repositório
    ```bash
    git clone <URL>
    cd gincana
    ```
2.  Instalar dependências do backend:
    ```bash
    cd backend
    npm install
    ```
3.  Instalar dependências do frontend:
    ```bash
    cd ../frontend
    npm install
    ```

### ▶️ Execução em modo desenvolvimento

```bash
# Backend (Express.js)
cd backend
npm run dev

# Frontend (React + Vite)
cd frontend
npm run dev
```

---
