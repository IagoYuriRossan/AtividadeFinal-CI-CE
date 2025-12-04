Setup and required secrets

1. Create accounts and resources:

- Docker Hub repository named `api-sast` (same as repo).
- SonarCloud project and organization (get `SONAR_TOKEN`).
- Render service (create a Web Service or Private Docker Service) and copy `RENDER_API_KEY` and `RENDER_SERVICE_ID`.

2. GitHub repository secrets (Settings → Secrets):

- `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`
- `GH_TOKEN` (a Personal Access Token with repo permissions) or rely on default `GITHUB_TOKEN`.
- `SONAR_TOKEN` (SonarCloud token)
- `RENDER_API_KEY` and `RENDER_SERVICE_ID`

3. Local dev

- Install deps: `npm install`
- Run: `npm start`
- Swagger: visit `http://localhost:3000/docs`
