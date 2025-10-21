# Uni2School - Sistema de Gincana Escolar

Sistema web completo para gerenciamento de gincanas escolares com funcionalidades de equipes, provas e avaliações. Desenvolvido com React, TypeScript e Firebase.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades Implementadas](#funcionalidades-implementadas)
- [Configuração e Instalação](#configuração-e-instalação)
- [Execução do Projeto](#execução-do-projeto)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Estrutura de Dados](#estrutura-de-dados)
- [Componentes Principais](#componentes-principais)
- [Contextos React](#contextos-react)
- [Guia de Desenvolvimento](#guia-de-desenvolvimento)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

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
- **React 18** - Biblioteca para interface de usuário
- **TypeScript** - Linguagem de programação tipada
- **Tailwind CSS** - Framework de estilização
- **Lucide React** - Biblioteca de ícones
- **Vite** - Build tool e servidor de desenvolvimento

### Backend
- **Firebase Authentication** - Autenticação de usuários
- **Firestore** - Banco de dados NoSQL
- **Firebase Hosting** - Hospedagem (opcional)

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Processador de CSS
- **Autoprefixer** - Adiciona prefixos CSS automaticamente

## 📁 Estrutura do Projeto

```
uni2school/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── dashboards/
│   │   │   ├── AlunoDashboard.tsx
│   │   │   ├── ProfessorDashboard.tsx
│   │   │   └── DevDashboard.tsx
│   │   ├── modals/
│   │   │   ├── CreateTeamModal.tsx
│   │   │   ├── CreateProvaModal.tsx
│   │   │   ├── EditTeamModal.tsx
│   │   │   ├── TeamMembersModal.tsx
│   │   │   ├── TransferMemberModal.tsx
│   │   │   ├── DeleteTeamModal.tsx
│   │   │   └── EvaluateSubmissionModal.tsx
│   │   ├── AuthGate.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── TeamSelection.tsx
│   │   ├── TeamManagementList.tsx
│   │   ├── ProvaList.tsx
│   │   └── SubmissionList.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── GameContext.tsx
│   ├── config/
│   │   └── firebase.ts
│   ├── types/
│   │   └── user.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── FUNCIONALIDADES.md
```

## ✨ Funcionalidades Implementadas

### 👨‍🏫 Para Professores

#### Gestão de Equipes
- ✅ Criação de equipes com cores personalizadas
- ✅ Edição de informações das equipes
- ✅ Visualização de membros por equipe
- ✅ Transferência de membros entre equipes
- ✅ Exclusão de equipes com confirmação

#### Gestão de Provas
- ✅ Criação de provas com instruções detalhadas
- ✅ Definição de pontuação máxima
- ✅ Visualização de todas as provas criadas

#### Sistema de Avaliação
- ✅ Avaliação de provas submetidas pelos alunos
- ✅ Atribuição de notas e feedback detalhado
- ✅ Controle de visibilidade das notas
- ✅ Reavaliação de provas já avaliadas

#### Dashboard Professor
- ✅ Estatísticas em tempo real
- ✅ Navegação por abas (Visão Geral, Equipes, Provas, Avaliações)
- ✅ Interface intuitiva e responsiva

### 👨‍🎓 Para Alunos

#### Participação em Equipes
- ✅ Seleção de equipe disponível
- ✅ Visualização de informações da equipe
- ✅ Interface de escolha intuitiva

#### Participação em Provas
- ✅ Acesso às provas apenas após ingressar em equipe
- ✅ Interface clara para visualizar instruções
- ✅ Sistema de entrega de respostas
- ✅ Visualização de notas quando liberadas
- ✅ Leitura de feedback do professor
- ✅ Status das avaliações (pendente, avaliada, visível)

#### Dashboard Aluno
- ✅ Informações da equipe atual
- ✅ Estatísticas de provas submetidas
- ✅ Pontuação total obtida
- ✅ Botão de atualização

## 🚀 Configuração e Instalação

### Pré-requisitos

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Conta Firebase** (para configuração do backend)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd uni2school
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o Firebase**
   - Acesse o [Firebase Console](https://console.firebase.google.com/)
   - Crie um novo projeto ou use um existente
   - Ative Authentication e Firestore Database
   - Copie as credenciais do projeto

4. **Configure as credenciais**
   - Edite o arquivo `src/config/firebase.ts`
   - Substitua as credenciais pelas do seu projeto Firebase

## ▶️ Execução do Projeto

### Desenvolvimento
```bash
npm run dev
```
O projeto será executado em `http://localhost:5173`

### Build para Produção
```bash
npm run build
```
Os arquivos otimizados serão gerados na pasta `dist/`

### Preview da Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run typecheck
```

## 🏗 Arquitetura do Sistema

### Frontend Architecture

O sistema utiliza uma arquitetura baseada em componentes React com os seguintes padrões:

- **Component-Based Architecture**: Componentes reutilizáveis e modulares
- **Context API**: Gerenciamento de estado global (AuthContext, GameContext)
- **Custom Hooks**: Lógica reutilizável encapsulada
- **TypeScript**: Tipagem estática para maior segurança
- **Tailwind CSS**: Utility-first CSS framework

### Backend Architecture

- **Firebase Authentication**: Gerenciamento de usuários e autenticação
- **Firestore**: Banco de dados NoSQL para persistência
- **Real-time Updates**: Sincronização automática de dados

### Fluxo de Dados

```
User Interface (React Components)
    ↓
Context Layer (AuthContext, GameContext)
    ↓
Firebase SDK (Authentication, Firestore)
    ↓
Firebase Services (Auth, Database)
```

## 📊 Estrutura de Dados

### Collections do Firestore

#### `users`
```typescript
interface UserProfile {
  uid: string;
  email: string;
  role: 'aluno' | 'professor' | 'dev';
  displayName?: string;
  teamId?: string;
}
```

#### `teams`
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  createdBy: string;
  members: string[];
  totalPoints: number;
}
```

#### `provas`
```typescript
interface Prova {
  id: string;
  title: string;
  description: string;
  instructions: string;
  maxPoints: number;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  submissions: ProvaSubmission[];
}

interface ProvaSubmission {
  id: string;
  studentId: string;
  studentName: string;
  teamId: string;
  teamName: string;
  submittedAt: Date;
  content: string;
  points?: number;
  maxPoints: number;
  feedback?: string;
  evaluatedAt?: Date;
  evaluatedBy?: string;
  isGradeVisible: boolean;
}
```

## 🧩 Componentes Principais

### Dashboards
- **`AlunoDashboard`**: Interface principal para alunos
- **`ProfessorDashboard`**: Interface principal para professores
- **`DevDashboard`**: Interface para desenvolvedores

### Modais
- **`CreateTeamModal`**: Criação de equipes
- **`EditTeamModal`**: Edição de equipes
- **`TeamMembersModal`**: Visualização de membros
- **`TransferMemberModal`**: Transferência de membros
- **`DeleteTeamModal`**: Confirmação de exclusão
- **`CreateProvaModal`**: Criação de provas
- **`EvaluateSubmissionModal`**: Avaliação de provas

### Componentes de Interface
- **`TeamSelection`**: Seleção de equipe para alunos
- **`TeamManagementList`**: Lista de gestão de equipes
- **`ProvaList`**: Lista e submissão de provas
- **`SubmissionList`**: Lista de submissões para avaliação

## 🔄 Contextos React

### AuthContext
Gerencia autenticação e perfil do usuário:
- `currentUser`: Usuário logado
- `userProfile`: Perfil completo do usuário
- `signUp()`: Registro de novos usuários
- `signIn()`: Login de usuários
- `signOut()`: Logout

### GameContext
Gerencia dados da gincana:
- `teams`: Lista de equipes
- `provas`: Lista de provas
- `createTeam()`: Criação de equipes
- `updateTeam()`: Atualização de equipes
- `deleteTeam()`: Exclusão de equipes
- `transferMember()`: Transferência de membros
- `createProva()`: Criação de provas
- `submitProva()`: Submissão de provas
- `evaluateSubmission()`: Avaliação de provas
- `refreshData()`: Atualização de dados

## 👨‍💻 Guia de Desenvolvimento

### Adicionando Novas Funcionalidades

1. **Defina os tipos** em `src/types/user.ts`
2. **Atualize o contexto** em `src/contexts/GameContext.tsx`
3. **Crie os componentes** necessários
4. **Atualize os dashboards** conforme necessário
5. **Teste a funcionalidade** completamente

### Padrões de Código

#### Componentes
```typescript
// Estrutura padrão de componente
interface ComponentProps {
  // Props tipadas
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handleAction = () => {
    // Lógica
  };
  
  // Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### Contextos
```typescript
// Estrutura padrão de contexto
interface ContextType {
  // Estado e funções
}

const Context = createContext<ContextType | undefined>(undefined);

export function useContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within Provider');
  }
  return context;
}

export function ContextProvider({ children }: { children: ReactNode }) {
  // Lógica do contexto
  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
```

### Convenções de Nomenclatura

- **Componentes**: PascalCase (`UserProfile`)
- **Funções**: camelCase (`createTeam`)
- **Variáveis**: camelCase (`userProfile`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_POINTS`)
- **Arquivos**: PascalCase para componentes (`UserProfile.tsx`)

### Estrutura de Pastas

- **`components/`**: Componentes reutilizáveis
- **`components/dashboards/`**: Dashboards específicos por role
- **`components/modals/`**: Modais do sistema
- **`contexts/`**: Contextos React
- **`types/`**: Definições de tipos TypeScript
- **`config/`**: Configurações (Firebase, etc.)

## 🚀 Deploy

### Firebase Hosting

1. **Instale o Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Faça login no Firebase**
   ```bash
   firebase login
   ```

3. **Configure o projeto**
   ```bash
   firebase init hosting
   ```

4. **Build do projeto**
   ```bash
   npm run build
   ```

5. **Deploy**
   ```bash
   firebase deploy
   ```

### Outras Opções

- **Vercel**: Deploy automático via Git
- **Netlify**: Deploy com drag-and-drop
- **GitHub Pages**: Hospedagem gratuita

## 🤝 Contribuição

### Como Contribuir

1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra um Pull Request**

### Padrões de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Tarefas de manutenção

### Checklist para Pull Requests

- [ ] Código segue os padrões estabelecidos
- [ ] Funcionalidade testada manualmente
- [ ] Documentação atualizada
- [ ] Sem erros de linting
- [ ] Tipos TypeScript corretos

## 📞 Suporte

Para dúvidas ou problemas:

1. **Verifique a documentação** primeiro
2. **Consulte os issues** existentes
3. **Abra um novo issue** com detalhes do problema
4. **Inclua logs de erro** e passos para reproduzir

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Roadmap Futuro

### Funcionalidades Planejadas

- [ ] Sistema de ranking de equipes
- [ ] Relatórios de desempenho
- [ ] Notificações em tempo real
- [ ] Upload de arquivos nas provas
- [ ] Sistema de badges/medalhas
- [ ] Integração com calendário


### Melhorias Técnicas

- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Cache de dados
- [ ] Otimização de bundle
- [ ] PWA (Progressive Web App)

---

**Desenvolvido com ❤️ para facilitar o aprendizado e a gamificação na educação.**
A IA é foda!!
