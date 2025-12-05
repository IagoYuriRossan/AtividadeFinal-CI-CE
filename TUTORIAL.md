# Tutorial: Pipeline CI/CD DevSecOps Completo

Este tutorial ensina como criar um pipeline CI/CD DevSecOps do zero com GitHub Actions, Docker, SonarCloud e Render.

## 📋 Pré-requisitos

- Conta no GitHub
- Conta no Docker Hub
- Conta no SonarCloud
- Conta no Render (plano gratuito)
- Node.js 18+ instalado localmente (opcional, para testes)

---

## 🚀 Passo 1: Criar Repositório GitHub

1. Acesse https://github.com/new
2. Nome: `AtividadeFinal-CI-CE` (ou o nome desejado)
3. Descrição: "Pipeline CI/CD DevSecOps com GitHub Actions, Docker, SonarCloud e Render"
4. Público ou Privado (recomendo Público para SonarCloud funcionar)
5. ✅ Initialize with README
6. Clique em **Create repository**

---

## 🔧 Passo 2: Clonar e Configurar Estrutura Local

```bash
# Clonar repositório
git clone https://github.com/SEU_USUARIO/AtividadeFinal-CI-CE.git
cd AtividadeFinal-CI-CE

# Criar branches Gitflow
git checkout -b develop
git push origin develop
git checkout main
```

---

## 📦 Passo 3: Criar Estrutura do Projeto Node.js

### 3.1 Criar `package.json`

```json
{
  "name": "api-sast",
  "version": "1.0.0",
  "description": "API Node.js com CI/CD DevSecOps",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "jest --runInBand",
    "build": "echo \"no build step\""
  },
  "keywords": ["api", "devsecops", "cicd"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "swagger-ui-express": "^4.6.3",
    "yamljs": "^0.3.0",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### 3.2 Criar `src/index.js`

```javascript
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const { Pool } = require("pg");
const routes = require("./routes");
const swaggerDocument = require("./swagger");

const app = express();
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function tryDbConnect() {
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL provided, running without database");
    return;
  }
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();
  } catch (err) {
    console.error("Could not connect to PostgreSQL:", err.message);
  }
}

tryDbConnect();

app.locals.pool = pool;

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api", routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
```

### 3.3 Criar `src/routes.js`

```javascript
const express = require("express");
const router = express.Router();

let items = [
  {
    id: 1,
    name: "Laptop Dell",
    description: "Notebook profissional 16GB RAM",
    price: 4500,
  },
  {
    id: 2,
    name: "Mouse Logitech",
    description: "Mouse wireless ergonômico",
    price: 150,
  },
  {
    id: 3,
    name: "Teclado Mecânico",
    description: "Teclado RGB switches blue",
    price: 350,
  },
  {
    id: 4,
    name: 'Monitor LG 27"',
    description: "Monitor Full HD IPS",
    price: 1200,
  },
  {
    id: 5,
    name: "Headset Gamer",
    description: "Headset 7.1 surround",
    price: 280,
  },
];

router.get("/items", (req, res) => res.json(items));

router.get("/items/:id", (req, res) => {
  const it = items.find((i) => i.id === Number(req.params.id));
  if (!it) return res.status(404).json({ message: "Not found" });
  res.json(it);
});

router.post("/items", (req, res) => {
  const id = items.length ? items.at(-1).id + 1 : 1;
  const item = { id, ...req.body };
  items.push(item);
  res.status(201).json(item);
});

router.put("/items/:id", (req, res) => {
  const idx = items.findIndex((i) => i.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  items[idx] = { ...items[idx], ...req.body };
  res.json(items[idx]);
});

router.delete("/items/:id", (req, res) => {
  items = items.filter((i) => i.id !== Number(req.params.id));
  res.status(204).send();
});

module.exports = router;
```

### 3.4 Criar `src/swagger.js`

```javascript
module.exports = {
  openapi: "3.0.0",
  info: {
    title: "API SAST CI/CD",
    version: "1.0.0",
    description: "API com pipeline DevSecOps",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local" },
    {
      url: "https://atividadefinal-ci-ce.onrender.com",
      description: "Production",
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          200: { description: "OK" },
        },
      },
    },
    "/api/items": {
      get: {
        summary: "List all items",
        responses: {
          200: { description: "Array of items" },
        },
      },
      post: {
        summary: "Create item",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Item created" },
        },
      },
    },
    "/api/items/{id}": {
      get: {
        summary: "Get item by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Item details" },
          404: { description: "Not found" },
        },
      },
      put: {
        summary: "Update item",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Item updated" },
          404: { description: "Not found" },
        },
      },
      delete: {
        summary: "Delete item",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          204: { description: "Deleted" },
          404: { description: "Not found" },
        },
      },
    },
  },
};
```

### 3.5 Criar `tests/sample.test.js`

```javascript
test("basic math", () => {
  expect(1 + 1).toBe(2);
});
```

---

## 🐳 Passo 4: Criar Docker Files

### 4.1 Criar `Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 4.2 Criar `.dockerignore`

```
node_modules
.git
.github
*.md
tests
.env
```

---

## ⚙️ Passo 5: Criar Script de Versionamento Semântico

### 5.1 Criar `tools/increment-version.js`

```javascript
const { execSync } = require("child_process");

function getLastVersionFromGit() {
  try {
    const tag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
    }).trim();
    return tag.replace(/^v/, "");
  } catch {
    return "1.0.0";
  }
}

function bumpVersion(currentVersion, commitMessage) {
  let [major, minor, patch] = currentVersion.split(".").map(Number);

  if (
    commitMessage.includes("BREAKING CHANGE") ||
    commitMessage.includes("BREAKING-CHANGE")
  ) {
    major += 1;
    // MAJOR mantém MINOR e PATCH (customização solicitada)
  } else if (commitMessage.match(/^feat(\(.*?\))?:/)) {
    minor += 1;
    patch = 0;
  } else if (commitMessage.match(/^fix(\(.*?\))?:/)) {
    patch += 1;
  } else {
    patch += 1; // Default para outros commits
  }

  return `${major}.${minor}.${patch}`;
}

const lastVersion = getLastVersionFromGit();
const commitMessage = process.argv[2] || "";
const newVersion = bumpVersion(lastVersion, commitMessage);

console.log(newVersion);
```

---

## 🔐 Passo 6: Configurar SonarCloud

### 6.1 Criar conta no SonarCloud

1. Acesse https://sonarcloud.io
2. Faça login com GitHub
3. Clique em **+** → **Analyze new project**
4. Selecione seu repositório `AtividadeFinal-CI-CE`
5. Escolha **GitHub Actions** como método de análise
6. Copie o **SONAR_TOKEN** gerado

### 6.2 Criar `sonar-project.properties`

```properties
sonar.projectKey=SEU_USUARIO_AtividadeFinal-CI-CE
sonar.organization=seu-usuario-lowercase

sonar.sources=src
sonar.tests=tests
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.exclusions=node_modules/**,tests/**
```

**Importante**: Substitua `SEU_USUARIO` pelo seu usuário GitHub e `seu-usuario-lowercase` pela sua organization no SonarCloud (geralmente seu usuário em minúsculas).

---

## 🔑 Passo 7: Configurar Secrets no GitHub

1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret** para cada um:

| Secret               | Onde Obter                                                  |
| -------------------- | ----------------------------------------------------------- |
| `DOCKERHUB_USERNAME` | Seu usuário do Docker Hub                                   |
| `DOCKERHUB_TOKEN`    | Docker Hub → Account Settings → Security → New Access Token |
| `SONAR_TOKEN`        | SonarCloud (passo 6.1)                                      |
| `RENDER_API_KEY`     | Render → Account Settings → API Keys → Create API Key       |
| `RENDER_SERVICE_ID`  | Render (após criar Web Service no passo 9)                  |

---

## ⚡ Passo 8: Criar GitHub Actions Workflow

### 8.1 Criar `.github/workflows/ci-cd.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]

concurrency:
  group: ci-cd-${{ github.ref }}
  cancel-in-progress: false

jobs:
  build-test-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Bump version and create tag
        id: version
        run: |
          NEW_VERSION=$(node tools/increment-version.js "${{ github.event.head_commit.message }}")
          echo "NEW_VERSION=v$NEW_VERSION" >> $GITHUB_OUTPUT
          git config user.name "github-actions"
          git config user.email "github-actions@github.com"
          git tag "v$NEW_VERSION"
          git push origin "v$NEW_VERSION"

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=${{ secrets.SONAR_PROJECT_KEY }}
            -Dsonar.organization=${{ secrets.SONAR_ORGANIZATION }}
            -Dsonar.branch.name=main
        continue-on-error: true

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKERHUB_USERNAME }}/api-sast:${{ steps.version.outputs.NEW_VERSION }}
            ${{ secrets.DOCKERHUB_USERNAME }}/api-sast:latest

      - name: Deploy to Render
        run: |
          curl -X POST "https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys" \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d '{
              "clearCache": "clear",
              "imageUrl": "${{ secrets.DOCKERHUB_USERNAME }}/api-sast:${{ steps.version.outputs.NEW_VERSION }}"
            }'
```

**Nota**: Adicione também `SONAR_PROJECT_KEY` e `SONAR_ORGANIZATION` como secrets no GitHub.

---

## ☁️ Passo 9: Configurar Render

### 9.1 Criar Banco PostgreSQL

1. Acesse https://dashboard.render.com
2. Clique em **New +** → **PostgreSQL**
3. Nome: `api-database`
4. Region: `Oregon (US West)`
5. Plan: **Free**
6. Clique em **Create Database**
7. **Copie a "Internal Database URL"** (você vai precisar)

### 9.2 Criar Web Service

1. Clique em **New +** → **Web Service**
2. **Runtime**: Docker
3. **Repository**: Conecte seu GitHub e selecione `AtividadeFinal-CI-CE`
4. **Name**: `atividadefinal-ci-ce`
5. **Region**: `Oregon (US West)`
6. **Branch**: `main`
7. **Plan**: **Free**
8. **Environment Variables**: Adicione:
   - `DATABASE_URL`: Cole a Internal Database URL do PostgreSQL
   - `PORT`: `10000` (Render usa esta porta)
9. Clique em **Create Web Service**
10. **Copie o Service ID** da URL (formato: `srv-xxxxxxxxxxxxx`)
11. Adicione este ID como secret `RENDER_SERVICE_ID` no GitHub

---

## 📝 Passo 10: Fazer Primeiro Commit com Gitflow

```bash
# Criar estrutura no develop
git checkout develop
git add .
git commit -m "feat: initial project setup with CI/CD pipeline"
git push origin develop

# Merge para main
git checkout main
git merge develop
git push origin main
```

Isso vai disparar o pipeline automaticamente!

---

## ✅ Passo 11: Validar Pipeline

### 11.1 Verificar GitHub Actions

1. Acesse: `https://github.com/SEU_USUARIO/AtividadeFinal-CI-CE/actions`
2. Deve aparecer o workflow rodando
3. Aguarde finalizar (3-5 minutos)

### 11.2 Verificar Tags

```bash
git fetch --tags
git tag
# Deve mostrar: v1.1.0 (ou similar)
```

### 11.3 Verificar Docker Hub

1. Acesse: `https://hub.docker.com/r/SEU_USUARIO/api-sast/tags`
2. Deve ter as tags: `v1.1.0` e `latest`

### 11.4 Verificar SonarCloud

1. Acesse: `https://sonarcloud.io/project/overview?id=SEU_USUARIO_AtividadeFinal-CI-CE`
2. Deve mostrar a análise de código

### 11.5 Testar API no Render

```bash
# Health check
curl https://atividadefinal-ci-ce.onrender.com/health

# Listar items
curl https://atividadefinal-ci-ce.onrender.com/api/items

# Swagger
# Abrir no navegador: https://atividadefinal-ci-ce.onrender.com/docs
```

---

## 🔄 Passo 12: Testar Versionamento Semântico

### 12.1 Testar PATCH (fix)

```bash
git checkout develop
echo "// bugfix" >> src/routes.js
git add .
git commit -m "fix: correct item validation"
git push origin develop

git checkout main
git merge develop
git push origin main
# Resultado: v1.1.0 → v1.1.1
```

### 12.2 Testar MINOR (feat)

```bash
git checkout develop
echo "// new feature" >> src/routes.js
git add .
git commit -m "feat: add item search endpoint"
git push origin develop

git checkout main
git merge develop
git push origin main
# Resultado: v1.1.1 → v1.2.0
```

### 12.3 Testar MAJOR (BREAKING CHANGE)

```bash
git checkout develop
echo "// breaking change" >> src/routes.js
git add .
git commit -m "feat: redesign API structure

BREAKING CHANGE: API paths changed"
git push origin develop

git checkout main
git merge develop
git push origin main
# Resultado: v1.2.0 → v2.2.0 (mantém MINOR e PATCH)
```

---

## 📊 Resumo do Fluxo Completo

```
Developer commit → GitHub → GitHub Actions
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
              Tests Pass          Version Bump
                    ↓                   ↓
              SonarCloud Scan    Create Git Tag
                    ↓                   ↓
              Docker Build       Push to Docker Hub
                    ↓                   ↓
                    └─────────┬─────────┘
                              ↓
                      Deploy to Render
                              ↓
                      API Live 🎉
```

---

## 🎯 Checklist Final

- [ ] Repositório GitHub criado
- [ ] Código Node.js funcionando localmente
- [ ] Dockerfile criado
- [ ] SonarCloud configurado
- [ ] Todos os secrets configurados no GitHub
- [ ] PostgreSQL criado no Render
- [ ] Web Service criado no Render
- [ ] Workflow `.github/workflows/ci-cd.yml` criado
- [ ] Primeiro commit feito no `main`
- [ ] Pipeline executado com sucesso
- [ ] Tag criada automaticamente
- [ ] Imagem Docker enviada ao Docker Hub
- [ ] API acessível no Render
- [ ] Swagger funcionando em `/docs`
- [ ] Versionamento semântico testado (PATCH, MINOR, MAJOR)

---

## 🆘 Troubleshooting

### Erro: "No DATABASE_URL provided"

**Solução**: Adicione a variável `DATABASE_URL` no Render com a Internal Database URL.

### Erro: "SonarCloud project not found"

**Solução**: Verifique se `sonar.projectKey` e `sonar.organization` estão corretos no `sonar-project.properties`.

### Erro: "Push rejected (fetch first)"

**Solução**: Execute `git pull --rebase && git push origin main`.

### Erro: "npm ci can only install packages with an existing package-lock.json"

**Solução**: O workflow já usa `npm install` (não `npm ci`).

### Pipeline não dispara automaticamente

**Solução**: Verifique se o workflow está em `.github/workflows/ci-cd.yml` e se o push foi no branch `main`.

---

## 🎓 Conceitos Aplicados

- **CI/CD**: Integração e entrega contínua automatizada
- **DevSecOps**: Segurança integrada no pipeline (SonarCloud SAST)
- **Gitflow**: Branch strategy (develop → main)
- **Conventional Commits**: Padronização de mensagens (feat:, fix:, BREAKING CHANGE)
- **Semantic Versioning**: Versionamento automático baseado em commits
- **Docker**: Containerização da aplicação
- **IaC**: Infraestrutura como código (GitHub Actions YAML)
- **Cloud Deployment**: Deploy automatizado no Render

---

## 📚 Referências

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Render Documentation](https://render.com/docs)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Gitflow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

**Autor**: Criado para P2 DevSecOps  
**Data**: Dezembro 2025  
**Versão do Tutorial**: 1.0
