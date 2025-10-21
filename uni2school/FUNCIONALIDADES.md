# Uni2School - Sistema de Gincana

Sistema web para gerenciamento de gincanas escolares com funcionalidades de equipes e provas.

## Funcionalidades Implementadas

### 🎯 Para Professores

#### Criação de Equipes
- Interface intuitiva para criar novas equipes
- Seleção de cores personalizadas para cada equipe
- Descrição opcional para identificar a equipe
- Visualização de todas as equipes criadas
- Contagem de membros por equipe

#### Gestão de Provas
- **Criação de provas:** Formulário completo com título, descrição, instruções e pontuação
- **Visualização de provas:** Lista de todas as provas criadas
- **Avaliação de provas:** Sistema completo de avaliação das submissões dos alunos
- **Controle de visibilidade:** Decidir quando liberar as notas para os alunos
- **Feedback detalhado:** Inserir justificativas e comentários nas avaliações

#### Dashboard Professor
- Estatísticas em tempo real:
  - Total de alunos participantes
  - Número de provas criadas
  - Número de equipes ativas
- Lista de provas criadas com informações básicas
- Lista de equipes com contagem de membros e pontuação
- **Nova funcionalidade:** Sistema de navegação por abas
- **Nova funcionalidade:** Gestão completa de equipes

#### Gestão de Equipes (Nova Funcionalidade)
- **Visualização de todas as equipes:** Lista completa com cores distintivas
- **Edição de equipes:** Modificar nome, descrição e cor das equipes
- **Visualização de membros:** Ver todos os participantes de cada equipe
- **Transferência de membros:** Mover membros entre equipes com interface intuitiva
- **Exclusão de equipes:** Remover equipes com confirmação de segurança
- **Consistência de dados:** Atualização automática para todos os alunos
- **Interface intuitiva:** Ações organizadas com ícones e confirmações

### 👨‍🎓 Para Alunos

#### Seleção de Equipe
- Interface para escolher uma equipe disponível
- Visualização de todas as equipes com cores distintivas
- Informações sobre número de membros por equipe
- Processo simples de entrada na equipe

#### Participação em Provas
- Acesso às provas apenas após ingressar em uma equipe
- Interface clara para visualizar instruções das provas
- Sistema de entrega de respostas
- **Visualização de notas:** Acesso às notas quando liberadas pelo professor
- **Feedback do professor:** Leitura de comentários e justificativas das avaliações
- Confirmação visual de provas já entregues
- Pontuação máxima de cada prova
- **Status das avaliações:** Indicação se a prova foi avaliada e se a nota está visível

#### Dashboard Aluno
- Informações da equipe atual
- Pontuação total da equipe
- Cor distintiva da equipe
- Botão de atualização para sincronizar dados
- **Estatísticas de provas:** Contagem de provas submetidas e pontos obtidos
- **Notas visíveis:** Exibição das notas quando liberadas pelo professor

## Arquitetura Técnica

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Firebase** para autenticação e banco de dados

### Estrutura de Dados

#### Usuário (UserProfile)
```typescript
interface UserProfile {
  uid: string;
  email: string;
  role: 'aluno' | 'professor' | 'dev';
  displayName?: string;
  teamId?: string; // ID da equipe do aluno
}
```

#### Equipe (Team)
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  color: string; // Cor hexadecimal
  createdAt: Date;
  createdBy: string; // UID do professor
  members: string[]; // Array de UIDs dos alunos
  totalPoints: number;
}
```

#### Prova (Prova)
```typescript
interface Prova {
  id: string;
  title: string;
  description: string;
  instructions: string;
  maxPoints: number;
  createdAt: Date;
  createdBy: string; // UID do professor
  isActive: boolean;
  submissions: ProvaSubmission[];
}
```

### Contextos React

#### AuthContext
- Gerenciamento de autenticação
- Perfil do usuário logado
- Funções de login/logout

#### GameContext
- Gerenciamento de equipes e provas
- Operações CRUD para equipes e provas
- Funções de entrada em equipe e submissão de provas
- **Novas funções:** `updateTeam`, `deleteTeam` e `transferMember` para gestão completa
- Sincronização com Firebase

### Componentes Criados

#### Modais de Gestão
- **`CreateTeamModal`:** Criação de novas equipes
- **`EditTeamModal`:** Edição de equipes existentes
- **`TeamMembersModal`:** Visualização de membros da equipe
- **`TransferMemberModal`:** Transferência de membros entre equipes
- **`DeleteTeamModal`:** Confirmação de exclusão de equipes
- **`CreateProvaModal`:** Criação de provas
- **`EvaluateSubmissionModal`:** Avaliação de provas submetidas pelos alunos

#### Componentes de Interface
- **`TeamSelection`:** Seleção de equipe para alunos
- **`TeamManagementList`:** Lista completa de gestão de equipes
- **`ProvaList`:** Exibição e submissão de provas
- **`SubmissionList`:** Lista de submissões para avaliação pelo professor

## Fluxo de Uso

### 1. Professor cria equipes
- Acessa o dashboard do professor
- Clica em "Nova Equipe"
- Preenche nome, descrição e escolhe cor
- Equipe fica disponível para alunos

### 2. Professor cria provas
- Clica em "Nova Prova"
- Define título, descrição, instruções e pontuação
- Prova fica ativa para alunos com equipe

### 3. Aluno escolhe equipe
- Aluno sem equipe vê interface de seleção
- Escolhe uma equipe disponível
- Confirma entrada na equipe

### 4. Aluno participa das provas
- Após entrar em uma equipe, vê lista de provas
- Lê instruções e entrega respostas
- Recebe confirmação de entrega

### 5. Professor gerencia equipes (Nova Funcionalidade)
- Acessa a aba "Gestão de Equipes"
- Visualiza todas as equipes criadas
- Edita informações das equipes (nome, descrição, cor)
- Visualiza membros de cada equipe
- **Transfere membros entre equipes** com interface intuitiva
- Exclui equipes quando necessário
- Sistema atualiza automaticamente para todos os alunos

### 6. Transferência de membros (Nova Funcionalidade)
- Professor clica em "Ver membros" de uma equipe
- Clica no botão de transferir ao lado de um membro
- Seleciona a equipe de destino
- Confirma a transferência
- Sistema atualiza automaticamente os dados do membro

### 7. Avaliação de provas (Nova Funcionalidade)
- Professor acessa a aba "Avaliações"
- Visualiza todas as provas com suas submissões
- Clica em "Avaliar" ou "Reavaliar" em uma submissão
- Atribui nota e escreve feedback detalhado
- Decide se a nota será visível imediatamente para o aluno
- Sistema registra a avaliação com data e hora
- Aluno visualiza nota e feedback quando liberados

### 8. Consulta de notas pelo aluno (Nova Funcionalidade)
- Aluno acessa suas provas submetidas
- Visualiza status da avaliação (pendente, avaliada oculta, avaliada visível)
- Quando liberada, vê sua nota e feedback do professor
- Dashboard mostra estatísticas de pontos obtidos

## Segurança e Validações

- Apenas professores podem criar equipes e provas
- Alunos só podem ver provas após ingressar em uma equipe
- Validação de formulários no frontend
- Controle de acesso baseado em roles
- Prevenção de submissões duplicadas

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Tecnologias Utilizadas

- React 18 + TypeScript
- Tailwind CSS
- Firebase (Auth + Firestore)
- Lucide React (ícones)
- Vite (build tool)

## 📚 Documentação do Projeto

### Arquivos de Documentação Criados

- **README.md**: Documentação principal do projeto
  - Visão geral do sistema
  - Instruções de instalação e configuração
  - Guia de execução
  - Arquitetura e estrutura de dados
  - Guia de contribuição

- **FIREBASE_SETUP.md**: Guia detalhado para configuração do Firebase
  - Configuração inicial do projeto
  - Setup de Authentication e Firestore
  - Regras de segurança
  - Troubleshooting comum
  - Configuração de produção

- **DEVELOPMENT_GUIDE.md**: Guia completo para desenvolvedores
  - Padrões de código e arquitetura
  - Processo de desenvolvimento
  - Debugging e troubleshooting
  - Workflow de contribuição
  - Recursos e ferramentas

- **FUNCIONALIDADES.md**: Este arquivo - referência completa das funcionalidades

### Como Usar a Documentação

1. **Para novos desenvolvedores**: Comece com README.md
2. **Para configuração**: Use FIREBASE_SETUP.md
3. **Para desenvolvimento**: Consulte DEVELOPMENT_GUIDE.md
4. **Para referência**: Use FUNCIONALIDADES.md

### Manutenção da Documentação

- Atualize a documentação sempre que adicionar novas funcionalidades
- Mantenha os exemplos de código atualizados
- Verifique links e referências regularmente
- Adicione troubleshooting para problemas comuns
