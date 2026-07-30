# FastAPI backend

Backend de autenticacao JWT para o projeto Angular.

## Estrutura

- app/main.py: inicializacao do FastAPI
- app/core: configuracao e seguranca
- app/routers: rotas HTTP
- app/services: regras de autenticacao
- app/schemas: contratos de entrada e saida

## Executar

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API em <http://localhost:8000>

Docs Swagger em <http://localhost:8000/docs>

## Endpoints

- GET /api/v1/auth/health
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me

## Observacao

Agora os usuarios sao persistidos em SQLite no arquivo auth.db e a rota /api/v1/auth/me exige JWT Bearer valido.
