# 🚀 Guia de Commit e Push - Uni2School

## 📋 Pré-requisitos

Antes de fazer o commit e push, você precisa ter:

1. **Git instalado** no seu sistema
2. **Conta no GitHub** (ou outro repositório remoto)
3. **Repositório criado** no GitHub

## 🔧 Instalação do Git (se necessário)

### Windows
1. Baixe o Git em: https://git-scm.com/download/win
2. Execute o instalador com as configurações padrão
3. Reinicie o terminal/PowerShell

### Verificar Instalação
```bash
git --version
```

## 📝 Passo a Passo Completo

### 1. Inicializar Repositório Git
```bash
# No diretório do projeto
cd C:\Users\SUPORTE\Desktop\uni2school

# Inicializar repositório Git
git init

# Configurar usuário (substitua pelos seus dados)'
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"
```

### 2. Criar Arquivo .gitignore
```bash
# Criar arquivo .gitignore
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "Thumbs.db" >> .gitignore
```

### 3. Adicionar Arquivos ao Staging
```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status
```

### 4. Fazer o Primeiro Commit
```bash
# Commit inicial com todas as funcionalidades
git commit -m "feat: implementa sistema semi-completo de gincana escolar

- ✅ Sistema de autenticação com roles (aluno, professor, dev)
- ✅ Gestão completa de equipes (criar, editar, excluir, transferir membros)
- ✅ Sistema de provas com submissão e avaliação
- ✅ Dashboard personalizado por role
- ✅ Sistema de avaliação com feedback e controle de visibilidade
- ✅ Interface responsiva com Tailwind CSS
- ✅ Documentação completa (8 arquivos)
- ✅ Arquitetura modular com React + TypeScript + Firebase

Funcionalidades implementadas:
- Criação e gestão de equipes
- Criação e avaliação de provas
- Transferência de membros entre equipes
- Sistema de pontuação e feedback
- Dashboards intuitivos para professores e alunos
- Documentação técnica completa"
```

### 5. Conectar com Repositório Remoto
```bash
# Adicionar repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/SEU_USUARIO/uni2school.git

# Verificar conexão
git remote -v
```

### 6. Push para o GitHub
```bash
# Push inicial
git push -u origin main
```

## 🔄 Comandos para Futuras Atualizações

### Adicionar Novas Funcionalidades
```bash
# Adicionar arquivos modificados
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona nova funcionalidade X"

# Push para o repositório
git push
```

### Correções de Bugs
```bash
git add .
git commit -m "fix: corrige bug na funcionalidade Y"
git push
```

### Atualizações de Documentação
```bash
git add .
git commit -m "docs: atualiza documentação"
git push
```

## 📋 Checklist Antes do Commit

- [ ] Git instalado e configurado
- [ ] Repositório GitHub criado
- [ ] Arquivo .gitignore criado
- [ ] Todos os arquivos importantes adicionados
- [ ] Mensagem de commit descritiva
- [ ] Testes básicos realizados
- [ ] Documentação atualizada

## 🚨 Problemas Comuns

### Erro: "git não é reconhecido"
- **Solução**: Instalar Git e reiniciar o terminal

### Erro: "fatal: not a git repository"
- **Solução**: Executar `git init` no diretório do projeto

### Erro: "Permission denied"
- **Solução**: Verificar credenciais do GitHub ou usar SSH

### Erro: "remote origin already exists"
- **Solução**: Usar `git remote set-url origin NOVA_URL` ou remover e adicionar novamente

## 📚 Estrutura do Repositório

Após o commit, seu repositório terá:

```
uni2school/
├── src/                    # Código fonte
├── public/                 # Arquivos públicos
├── README.md              # Documentação principal
├── FIREBASE_SETUP.md      # Configuração Firebase
├── DEVELOPMENT_GUIDE.md   # Guia de desenvolvimento
├── FUNCIONALIDADES.md     # Referência funcional
├── DOCUMENTATION_INDEX.md # Índice de documentação
├── EXECUTIVE_SUMMARY.md   # Resumo executivo
├── QUICK_START.md         # Início rápido
├── DOCUMENTATION_SUMMARY.md # Resumo da documentação
├── package.json           # Dependências
├── .gitignore            # Arquivos ignorados
└── [outros arquivos de config]
```

## 🎯 Próximos Passos

Após o commit e push:

1. **Verificar no GitHub** se todos os arquivos foram enviados
2. **Configurar GitHub Pages** (opcional) para hospedagem
3. **Criar releases** para versões importantes
4. **Configurar CI/CD** (opcional) para deploy automático
5. **Adicionar colaboradores** se necessário

---

**Siga este guia passo a passo para fazer o commit e push corretamente!**
