# login-com-jwt-Angular-20

Projeto organizado como monorepo simples, com frontend Angular e backend FastAPI no mesmo repositorio.

## Estrutura

```text
login-com-jwt-Angular-20/
  auth-app/
  api/
```

## Frontend

Aplicacao Angular 20 em auth-app.

```bash
cd auth-app
npm install
ng serve
```

Frontend em <http://localhost:4200>

## Backend

API FastAPI em api.

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend em <http://localhost:8000>

Swagger em <http://localhost:8000/docs>

## Fluxo

1. Angular envia login e cadastro para a API.
2. FastAPI valida os dados.
3. FastAPI responde com JWT no login.
4. Angular pode armazenar o token e usa-lo nas rotas protegidas.

## Proximos passos

- adicionar banco de dados
- persistir usuarios
- criar refresh token
- proteger rotas no Angular com guard e interceptor
