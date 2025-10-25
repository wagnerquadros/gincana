# Sistema de Gincana Escolar

Sistema web completo para gerenciamento de gincanas escolares com funcionalidades de equipes, provas e avaliações. Desenvolvido com React, TypeScript e Firebase.

🌐 **Aplicação Online**: [https://rp-vi.vercel.app/](https://rp-vi.vercel.app/)

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Arquitetura](#arquitetura)
- [Execução Local](#execução-local)
- [Estrutura do Projeto](#estrutura-do-projeto)

## 🎯 Visão Geral

O Uni2School é uma plataforma web que permite a professores gerenciar gincanas escolares de forma completa e organizada. O sistema oferece funcionalidades para criação de equipes, elaboração de provas, avaliação de submissões e acompanhamento de resultados pelos alunos.

### Principais Benefícios

- **Gestão Completa**: Criação e administração de equipes e provas
- **Avaliação Flexível**: Sistema de notas com controle de visibilidade
- **Interface Intuitiva**: Design moderno e responsivo
- **Tempo Real**: Sincronização automática de dados
- **Segurança**: Controle de acesso baseado em roles

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** + **TypeScript** - Interface moderna e tipada
- **Tailwind CSS** - Framework de estilização
- **Lucide React** - Biblioteca de ícones
- **Vite** - Build tool e servidor de desenvolvimento

### Backend
- **Firebase Authentication** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL em tempo real
- **Vercel** - Hospedagem e deploy automático

### Ferramentas
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** + **Autoprefixer** - Processamento de CSS

## ✨ Funcionalidades Implementadas

### 👨‍🏫 Para Professores
- ✅ **Gestão de Equipes**: Criação, edição, visualização de membros e transferência
- ✅ **Gestão de Provas**: Criação de provas com instruções e pontuação
- ✅ **Sistema de Avaliação**: Avaliação de submissões com notas e feedback
- ✅ **Controle de Visibilidade**: Liberação de notas para alunos
- ✅ **Dashboard Completo**: Estatísticas em tempo real e navegação por abas

### 👨‍🎓 Para Alunos
- ✅ **Seleção de Equipe**: Interface para ingressar em equipes disponíveis
- ✅ **Participação em Provas**: Acesso às provas após ingressar em equipe
- ✅ **Sistema de Entrega**: Submissão de respostas para avaliação
- ✅ **Visualização de Resultados**: Notas e feedback quando liberados
- ✅ **Dashboard Aluno**: Informações da equipe e estatísticas pessoais

### 🔧 Funcionalidades Técnicas
- ✅ **Autenticação**: Sistema completo de login/registro com roles
- ✅ **Tempo Real**: Sincronização automática via Firestore
- ✅ **Interface Responsiva**: Design moderno com Tailwind CSS
- ✅ **Sistema de Revisão**: Solicitações de revisão de avaliações
- ✅ **Ranking de Equipes**: Sistema de pontuação e classificação

## 🏗 Arquitetura

### Frontend
- **React Components**: Arquitetura baseada em componentes reutilizáveis
- **Context API**: Gerenciamento de estado global (AuthContext, GameContext)
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Firebase Authentication**: Gerenciamento de usuários e autenticação
- **Firestore**: Banco de dados NoSQL com sincronização em tempo real
- **Estrutura de Dados**: Collections organizadas (users, teams, provas, reviews)

### Fluxo de Dados
```
React Components → Context Layer → Firebase SDK → Firebase Services
```

## 🚀 Execução Local

### Pré-requisitos
- **Node.js** (versão 16+)
- **npm** ou **yarn**
- **Conta Firebase** (para configuração)

### Instalação e Execução

1. **Clone e instale dependências**
   ```bash
   git clone <url-do-repositorio>
   cd uni2school
   npm install
   ```

2. **Configure o Firebase**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Crie um projeto e ative Authentication + Firestore
   - Copie as credenciais para `src/config/firebase.ts`

3. **Execute o projeto**
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:5173`

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview da build
- `npm run lint` - Verificação de código
- `npm run typecheck` - Verificação de tipos

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── dashboards/     # Dashboards por role (Aluno, Professor, Dev)
│   ├── modals/         # Modais do sistema (criar, editar, deletar)
│   └── tabs/           # Abas dos dashboards
├── contexts/           # Contextos React (Auth, Game)
├── config/             # Configurações (Firebase)
├── types/              # Definições TypeScript
└── App.tsx             # Componente principal
```

---
