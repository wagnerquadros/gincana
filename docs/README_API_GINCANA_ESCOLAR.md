# API Gincana Escolar

Guia prático de **requests** e **responses** da API, com exemplos em `curl`, cabeçalhos, status HTTP e observações de autenticação e datas.

> **Ambiente de desenvolvimento**
> - **Base URL**: `http://localhost:3000`
> - **Formato**: JSON (UTF-8)
> - **Auth**: JWT **Bearer** em rotas protegidas
> - **Timezone**: America/Sao_Paulo (recomenda-se enviar datas em ISO-8601 com offset; o backend pode responder normalizado em UTC `Z`)

---

## Sumário
- [Cabeçalhos padrão](#cabeçalhos-padrão)
- [Convenções de datas](#convenções-de-datas)
- [Coleção Postman](#coleção-postman)
- [Autenticação](#autenticação)
  - [Login](#login)
  - [Cadastro de Aluno (Signup)](#cadastro-de-aluno-signup)
- [Usuários](#usuários)
  - [Cadastrar Professor](#cadastrar-professor)
- [Gincanas](#gincanas)
  - [Cadastrar Gincana](#cadastrar-gincana)
- [Atividades](#atividades)
  - [Cadastrar Atividade](#cadastrar-atividade)
  - [Encerrar Atividade](#encerrar-atividade)
- [Ranking](#ranking)
  - [Consultar Ranking da Gincana](#consultar-ranking-da-gincana)
- [Códigos de Status](#códigos-de-status)
- [Modelo de erro sugerido](#modelo-de-erro-sugerido)

---

## Cabeçalhos padrão
```http
Content-Type: application/json
Authorization: Bearer <JWT>   # apenas para rotas protegidas
```

## Convenções de datas
- Envie horários com offset local, por exemplo: `2025-11-15T08:00:00-03:00`.
- O backend pode responder em UTC (`...Z`). Isso é esperado e não indica erro.

## Coleção Postman
Uma coleção Postman v2.1 com todas as rotas abaixo (usando variáveis `{{baseUrl}}` e `{{token}}`) está disponível para importação.

**Arquivo**: `Postman_Gincana_Colecao.json`  
**Baixar**: (anexe o arquivo do seu ambiente de execução ou utilize o link fornecido no chat)

---

## Autenticação

### Login
`POST /auth/login`

**Request**
```json
{ "email": "admin@escola.com", "password": "123123" }
```

**Response 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "user": {
    "id": "bFUlbn3PtLodeeeZhYaq",
    "email": "admin@escola.com",
    "nome": "Administrador",
    "role": "ADM"
  }
}
```

**curl**
```bash
curl -X POST "{{baseUrl}}/auth/login"   -H "Content-Type: application/json"   -d '{"email":"admin@escola.com","password":"123123"}'
```

---

### Cadastro de Aluno (Signup)
`POST /auth/signup`

**Request**
```json
{ "nome": "Pivete2", "email": "aluno2@escola.com", "senha": "123456" }
```

**Response 201**
```json
{
  "id": "jCwIz9GWbjNE7L9VYmd4",
  "nome": "Pivete2",
  "foto": null,
  "email": "aluno2@escola.com",
  "role": "ALUNO",
  "ativo": true,
  "criadoEm": "2025-10-25T23:22:10.355Z"
}
```

---

## Usuários

### Cadastrar Professor
`POST /usuarios` _(requer Bearer JWT)_

**Request**
```json
{
  "nome": "João Badanha",
  "foto": null,
  "email": "professor@escola.com",
  "senha": "123456",
  "role": "PROFESSOR",
  "ativo": true
}
```

**Response 201**
```json
{
  "id": "BnLae8Lqnl1OITxsCjm5",
  "nome": "João Badanha",
  "foto": null,
  "email": "professor@escola.com",
  "role": "PROFESSOR",
  "ativo": true,
  "criadoEm": "2025-10-25T21:43:40.061Z"
}
```

**curl**
```bash
curl -X POST "{{baseUrl}}/usuarios"   -H "Authorization: Bearer {{token}}"   -H "Content-Type: application/json"   -d '{
    "nome":"João Badanha",
    "foto":null,
    "email":"professor@escola.com",
    "senha":"123456",
    "role":"PROFESSOR",
    "ativo":true
  }'
```

---

## Gincanas

### Cadastrar Gincana
`POST /gincanas` _(requer Bearer JWT)_

**Request**
```json
{ "nome": "Gincana da Baixaria", "dataInicio": "2025-11-10", "status": "ATIVA" }
```

**Response 201**
```json
{
  "id": "rBZri52MNceNMWT5Demg",
  "nome": "Gincana da Baixaria",
  "dataInicio": "2025-11-10T00:00:00.000Z",
  "dataFim": null,
  "anoReferencia": null,
  "status": "ATIVA",
  "createdAt": "2025-10-25T23:20:20.737Z",
  "updatedAt": "2025-10-25T23:20:20.737Z"
}
```

**curl**
```bash
curl -X POST "{{baseUrl}}/gincanas"   -H "Authorization: Bearer {{token}}"   -H "Content-Type: application/json"   -d '{"nome":"Gincana da Baixaria","dataInicio":"2025-11-10","status":"ATIVA"}'
```

---

## Atividades

### Cadastrar Atividade
`POST /atividades` _(requer Bearer JWT)_

**Request**
```json
{
  "gincanaId": "a0GSNDMjhlS6wCTUypOH",
  "titulo": "Prova de Matemática",
  "descricao": "Prova de 20 questões de múltipla escolha.",
  "tipo": "QUIZ",
  "inicio": "2025-11-15T08:00:00-03:00",
  "fim": "2025-11-15T10:00:00-03:00",
  "pontosPrimeiro": 100,
  "pontosSegundo": 60,
  "pontosTerceiro": 30,
  "criterios": ["tempo", "acertos"],
  "statusAtividade": "AGENDADA",
  "ativa": true
}
```

**Response 201**
```json
{
  "id": "ZHymXgU4ire34hRGnYVJ",
  "gincanaId": "a0GSNDMjhlS6wCTUypOH",
  "titulo": "Prova de Matemática",
  "descricao": "Prova de 20 questões de múltipla escolha.",
  "tipo": "QUIZ",
  "inicio": "2025-11-15T11:00:00.000Z",
  "fim": "2025-11-15T13:00:00.000Z",
  "pontosPrimeiro": 100,
  "pontosSegundo": 60,
  "pontosTerceiro": 30,
  "criterios": ["tempo", "acertos"],
  "statusAtividade": "AGENDADA",
  "ativa": true,
  "criadoEm": "2025-10-25T22:49:58.130Z",
  "atualizadoEm": "2025-10-25T22:49:58.130Z"
}
```

---

### Encerrar Atividade
`POST /atividades/{atividadeId}/encerrar` _(requer Bearer JWT)_

**Request**
```json
{
  "classificacao": [
    "ADwRbVvE9hm4cto7k0b8",
    "IvxjS88mlIhq434dd9in",
    "ceMDusPwF89jMH4Wod9h"
  ],
  "bonus": {
    "ADwRbVvE9hm4cto7k0b8": 0,
    "IvxjS88mlIhq434dd9in": 0,
    "ceMDusPwF89jMH4Wod9h": 0
  },
  "penalidade": {},
  "fim": "2025-11-15T13:00:00-03:00"
}
```

**Response 200**
```json
{
  "ok": true,
  "atividadeId": "ZHymXgU4ire34hRGnYVJ",
  "gincanaId": "a0GSNDMjhlS6wCTUypOH",
  "encerradaEm": "2025-11-15",
  "totalEquipesPontuadas": 3,
  "mensagem": "Atividade encerrada e pontuações registradas com sucesso."
}
```

---

## Ranking

### Consultar Ranking da Gincana
`GET /gincanas/{gincanaId}/ranking` _(requer Bearer JWT)_

**Response 200** _(exemplo)_
```json
{
  "gincanaId": "a0GSNDMjhlS6wCTUypOH",
  "ranking": [
    {
      "equipeId": "eIRFr1h3ZljD2YItKXyb",
      "nome": "Equipe Azul",
      "total": 235,
      "detalhes": { "pontos": 225, "bonus": 10, "penalidades": 0, "qtdPontuacoes": 3 },
      "posicao": 1
    },
    {
      "equipeId": "25VFPj7rXfjOur0fZITg",
      "nome": "Equipe Favelados do Batuva",
      "total": 220,
      "detalhes": { "pontos": 225, "bonus": 0, "penalidades": 5, "qtdPontuacoes": 3 },
      "posicao": 2
    }
  ]
}
```

---

## Códigos de Status
- `200 OK` — sucesso em consultas/ações idempotentes.
- `201 Created` — recurso criado com sucesso.
- `400 Bad Request` — payload inválido.
- `401 Unauthorized` — token ausente/ inválido.
- `403 Forbidden` — sem permissão para a ação.
- `404 Not Found` — recurso não encontrado.
- `409 Conflict` — conflito de regra de negócio.
- `422 Unprocessable Entity` — erro de validação de campos.
- `500 Internal Server Error` — erro inesperado no servidor.

## Modelo de erro sugerido
```json
{
  "error": "ValidationError",
  "message": "Campo 'email' já utilizado.",
  "details": { "email": ["já está em uso"] },
  "timestamp": "2025-10-25T23:59:00.000Z",
  "path": "/auth/signup"
}
```

---

### Dicas rápidas
1. Fluxo típico no Postman: **Login** → copiar **token** → setar `{{token}}` → executar rotas protegidas.
2. Envie datas com **offset local**; espere respostas possivelmente em **UTC (Z)**.
3. Perfis previstos: `ADM`, `PROFESSOR`, `ALUNO` (as permissões devem ser validadas pelo backend conforme regra de negócio).
