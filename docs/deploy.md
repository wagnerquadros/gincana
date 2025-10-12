## 🚀 Deploy

O deploy do projeto é realizado de forma **separada entre frontend e backend**, garantindo flexibilidade e melhor escalabilidade.

---

### ⚙️ Estrutura de Deploy

| Camada     | Plataforma        | Descrição                                                                 |
|-------------|------------------|---------------------------------------------------------------------------|
| Frontend    | **Vercel**       | Hospeda o aplicativo React + Vite, com build automático via Git.          |
| Backend     | **Render** (ou Railway) | Executa o servidor Express completo, responsável pelas rotas e autenticação JWT. |
| Banco de Dados | **Firebase (Firestore)** | Armazena dados do sistema e integra com Firebase Admin SDK. |

---

### 🔧 Processo

1. **Frontend (Vercel)**
   - Conecte o repositório ao painel da [Vercel](https://vercel.com).
   - Configure o diretório de build:  
     ```
     Diretório raiz: frontend
     Comando de build: npm run build
     Pasta de saída: dist
     ```
   - As variáveis de ambiente do frontend (ex: URLs da API e Firebase) são definidas no painel da Vercel.

2. **Backend (Render)**
   - Acesse [Render](https://render.com) e crie um novo serviço web.
   - Conecte o mesmo repositório e defina:
     ```
     Diretório raiz: backend
     Comando de inicialização: npm run start
     ```
   - Configure as variáveis de ambiente (Firebase, JWT_SECRET, etc).
   - O Render fornecerá uma URL pública da API (ex: https://backend-projeto.onrender.com).

3. **Integração**
   - No frontend (Vercel), defina a variável `VITE_API_URL` apontando para o backend hospedado no Render.
   - A comunicação ocorre via HTTPS entre os serviços.

---

### 📦 Ambientes

| Ambiente | Descrição |
|-----------|------------|
| **Dev** | Desenvolvimento local (`npm run dev`) |
| **Homolog** | Deploy temporário para testes internos |
| **Prod** | Versão estável publicada na Vercel e Render |

---

### 📊 Monitoramento e Logs

- **Frontend (Vercel):** Logs e histórico de builds acessíveis pelo painel.  
- **Backend (Render):** Logs em tempo real e monitoramento de uptime.  
- **Banco (Firebase):** Console do Firebase para verificar dados, autenticações e regras de segurança.  

---

### 🔐 Boas práticas
- Utilize variáveis de ambiente em vez de valores fixos no código.  
- Habilite HTTPS (padrão em Vercel e Render).  
- Mantenha a branch `main` como referência para deploys automáticos.  
