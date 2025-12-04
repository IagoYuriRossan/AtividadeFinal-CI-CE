# AtividadeFinal-CI-CE

Destinado a atividade final de Integração e Entrega continua.

## Sobre

Este repositório contém um exemplo minimal de backend Node.js preparado para a atividade P2 (CI/CD DevSecOps).

Arquivos adicionados:

- `src/` - app Express, endpoints CRUD de exemplo e Swagger em `/docs`.
- `tools/increment-version.js` - script para incrementar versão semântica baseado na mensagem do último commit.
- `Dockerfile` - imagem container para a aplicação.
- `.github/workflows/ci-cd.yml` - pipeline CI/CD com SonarCloud, versionamento, build/push Docker e deploy no Render.
- `sonar-project.properties` - arquivo de configuração SonarCloud.
- `docs/SETUP.md` - instruções para criar secrets e configurar serviços externos (Docker Hub, Render, SonarCloud).

Siga `docs/SETUP.md` para os próximos passos (criação de repositório Docker, tokens e secrets).

# Pipeline Test
# Semantic Version Test
# Breaking Change Test
test
# Major Version Test
# Version Test
# Test PATCH
# Test MINOR
# Test MAJOR
# Final Test PATCH
# Final Test MINOR
# Final Test MAJOR
