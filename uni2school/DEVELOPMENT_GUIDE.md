# Guia de Desenvolvimento - GameClass

Este guia fornece instruções detalhadas para desenvolvedores que desejam contribuir ou continuar o desenvolvimento do projeto GameClass.

## 🎯 Visão Geral do Desenvolvimento

O GameClass é um sistema modular construído com React, TypeScript e Firebase. A arquitetura foi projetada para ser escalável, manutenível e fácil de entender.

## 🏗 Arquitetura Detalhada

### Estrutura de Pastas Explicada

```
src/
├── components/           # Componentes React reutilizáveis
│   ├── dashboards/       # Dashboards específicos por role
│   ├── modals/          # Modais do sistema
│   └── [outros].tsx     # Componentes de interface
├── contexts/            # Contextos React para estado global
├── config/              # Configurações (Firebase, etc.)
├── types/               # Definições de tipos TypeScript
├── utils/               # Funções utilitárias (se necessário)
├── hooks/               # Custom hooks (se necessário)
└── [arquivos raiz]      # App.tsx, main.tsx, etc.
```

### Padrões de Arquitetura

#### 1. Component-Based Architecture
- Cada funcionalidade é encapsulada em componentes
- Componentes são reutilizáveis e modulares
- Separação clara de responsabilidades

#### 2. Context API Pattern
- Estado global gerenciado por contextos
- Separação entre AuthContext e GameContext
- Hooks customizados para acesso aos contextos

#### 3. TypeScript First
- Tipagem estática em todo o projeto
- Interfaces bem definidas
- Type safety em tempo de compilação

## 🔧 Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

```bash
# Node.js (versão 16+)
node --version

# npm (vem com Node.js)
npm --version

# Git
git --version
```

### Setup Inicial

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd GameClass

# Instale dependências
npm install

# Configure o Firebase (veja FIREBASE_SETUP.md)
# Edite src/config/firebase.ts

# Execute o projeto
npm run dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Servidor de desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview da build
npm run lint             # Verificação de linting
npm run typecheck        # Verificação de tipos
```

## 📝 Padrões de Código

### Estrutura de Componentes

```typescript
// Importações organizadas
import React, { useState, useEffect } from 'react';
import { SomeIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';

// Interface das props
interface ComponentProps {
  prop1: string;
  prop2?: number;
  onAction: () => void;
}

// Componente principal
export default function Component({ prop1, prop2, onAction }: ComponentProps) {
  // Estados locais
  const [localState, setLocalState] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Contextos
  const { userProfile } = useAuth();
  const { teams, createTeam } = useGame();

  // Efeitos
  useEffect(() => {
    // Lógica de efeito
  }, [dependency]);

  // Handlers
  const handleAction = async () => {
    setLoading(true);
    try {
      await onAction();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renderização condicional
  if (loading) {
    return <div>Carregando...</div>;
  }

  // JSX principal
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">{prop1}</h1>
      {/* Conteúdo */}
    </div>
  );
}
```

### Padrões de Contexto

```typescript
// Definição da interface
interface ContextType {
  data: DataType[];
  loading: boolean;
  error: string | null;
  action: () => Promise<void>;
}

// Criação do contexto
const Context = createContext<ContextType | undefined>(undefined);

// Hook customizado
export function useContext() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useContext must be used within Provider');
  }
  return context;
}

// Provider
export function ContextProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const action = async () => {
    setLoading(true);
    setError(null);
    try {
      // Lógica da ação
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const value: ContextType = {
    data,
    loading,
    error,
    action,
  };

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  );
}
```

### Padrões de Firebase

```typescript
// Operações CRUD padrão
export async function createDocument(collection: string, data: any) {
  try {
    const docRef = await addDoc(collection(db, collection), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar documento:', error);
    throw error;
  }
}

export async function updateDocument(collection: string, id: string, data: any) {
  try {
    await updateDoc(doc(db, collection, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Erro ao atualizar documento:', error);
    throw error;
  }
}

export async function deleteDocument(collection: string, id: string) {
  try {
    await deleteDoc(doc(db, collection, id));
  } catch (error) {
    console.error('Erro ao deletar documento:', error);
    throw error;
  }
}
```

## 🎨 Padrões de UI/UX

### Design System

#### Cores Padrão
```css
/* Cores principais */
--primary: #3B82F6 (blue-500)
--secondary: #6B7280 (gray-500)
--success: #10B981 (emerald-500)
--warning: #F59E0B (amber-500)
--error: #EF4444 (red-500)

/* Cores de equipes */
--team-red: #EF4444
--team-blue: #3B82F6
--team-green: #10B981
--team-yellow: #F59E0B
--team-purple: #8B5CF6
--team-pink: #EC4899
```

#### Componentes Padrão

```typescript
// Botão padrão
<button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Ação
</button>

// Card padrão
<div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
  {/* Conteúdo */}
</div>

// Modal padrão
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
    {/* Conteúdo do modal */}
  </div>
</div>
```

### Responsividade

```typescript
// Breakpoints do Tailwind
sm: 640px   // @media (min-width: 640px)
md: 768px   // @media (min-width: 768px)
lg: 1024px  // @media (min-width: 1024px)
xl: 1280px  // @media (min-width: 1280px)

// Exemplo de uso
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards responsivos */}
</div>
```

## 🧪 Testes e Qualidade

### Estrutura de Testes (Futuro)

```
src/
├── __tests__/
│   ├── components/
│   ├── contexts/
│   ├── utils/
│   └── setup.ts
├── components/
└── ...
```

### Padrões de Teste

```typescript
// Exemplo de teste de componente
import { render, screen, fireEvent } from '@testing-library/react';
import { Component } from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component prop1="test" onAction={jest.fn()} />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should call onAction when clicked', () => {
    const mockAction = jest.fn();
    render(<Component prop1="test" onAction={mockAction} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockAction).toHaveBeenCalledTimes(1);
  });
});
```

### Verificação de Qualidade

```bash
# Linting
npm run lint

# Type checking
npm run typecheck

# Build verification
npm run build
```

## 🚀 Adicionando Novas Funcionalidades

### Processo Padrão

1. **Planejamento**
   - Defina a funcionalidade
   - Identifique os componentes necessários
   - Planeje a estrutura de dados

2. **Implementação**
   - Atualize tipos em `src/types/user.ts`
   - Implemente lógica no contexto apropriado
   - Crie componentes necessários
   - Atualize dashboards se necessário

3. **Teste**
   - Teste manualmente todas as funcionalidades
   - Verifique responsividade
   - Teste em diferentes roles de usuário

4. **Documentação**
   - Atualize README.md
   - Atualize FUNCIONALIDADES.md
   - Adicione comentários no código

### Exemplo: Adicionando Sistema de Notificações

#### 1. Atualizar Tipos
```typescript
// src/types/user.ts
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}
```

#### 2. Atualizar Contexto
```typescript
// src/contexts/GameContext.tsx
const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  // Implementação
};
```

#### 3. Criar Componentes
```typescript
// src/components/NotificationCenter.tsx
export default function NotificationCenter() {
  // Implementação
}
```

#### 4. Integrar nos Dashboards
```typescript
// Adicionar nos dashboards apropriados
<NotificationCenter />
```

## 🔍 Debugging

### Ferramentas de Debug

#### React DevTools
- Instale a extensão do navegador
- Use para inspecionar componentes e estado

#### Firebase Debug
```typescript
// Habilitar logs do Firebase
import { enableLogging } from 'firebase/firestore';
enableLogging(true);
```

#### Console Logging
```typescript
// Logs estruturados
console.group('Operação');
console.log('Dados:', data);
console.log('Erro:', error);
console.groupEnd();
```

### Problemas Comuns

#### 1. Estado não atualiza
- Verifique se o contexto está sendo usado corretamente
- Confirme se o estado está sendo atualizado no contexto

#### 2. Firebase não conecta
- Verifique as credenciais
- Confirme se o projeto está ativo
- Verifique as regras de segurança

#### 3. Componente não renderiza
- Verifique se há erros no console
- Confirme se as props estão sendo passadas corretamente
- Verifique se o componente está sendo importado

## 📦 Build e Deploy

### Build Local

```bash
# Build de produção
npm run build

# Verificar build
npm run preview
```

### Deploy Firebase

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init hosting

# Deploy
firebase deploy
```

### Variáveis de Ambiente

```bash
# .env.local (não commitado)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 🤝 Contribuição

### Workflow de Contribuição

1. **Fork** o repositório
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Implemente** a funcionalidade
5. **Teste** completamente
6. **Commit** com mensagem clara
7. **Push** para sua branch
8. **Abra** um Pull Request

### Padrões de Commit

```bash
# Formato
tipo(escopo): descrição

# Exemplos
feat(auth): adiciona sistema de recuperação de senha
fix(teams): corrige bug na transferência de membros
docs(readme): atualiza instruções de instalação
style(ui): melhora responsividade dos cards
refactor(context): simplifica lógica do GameContext
test(components): adiciona testes para ProvaList
chore(deps): atualiza dependências do projeto
```

### Code Review

#### Checklist para Pull Requests

- [ ] Código segue os padrões estabelecidos
- [ ] Funcionalidade testada manualmente
- [ ] Documentação atualizada
- [ ] Sem erros de linting
- [ ] Tipos TypeScript corretos
- [ ] Responsividade verificada
- [ ] Compatibilidade com diferentes roles

#### Checklist para Reviewers

- [ ] Código está limpo e legível
- [ ] Lógica está correta
- [ ] Performance está adequada
- [ ] Segurança está mantida
- [ ] Testes estão adequados

## 📚 Recursos Adicionais

### Documentação Oficial

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Ferramentas Recomendadas

- **VS Code** com extensões:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Importer
  - Tailwind CSS IntelliSense
  - Firebase
  - GitLens

- **Ferramentas de Debug**:
  - React Developer Tools
  - Redux DevTools (se usar Redux no futuro)
  - Firebase Emulator Suite

### Comunidade

- [React Community](https://reactjs.org/community/support.html)
- [TypeScript Community](https://www.typescriptlang.org/community)
- [Firebase Community](https://firebase.google.com/community)

---
