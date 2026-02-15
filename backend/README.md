
# Elevate API Backend

FastAPI + PostgreSQL backend for the Elevate application.

## Local Development

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (optional, for local intellisense)

### Running the App
1.  Navigate to the project root.
2.  Run `docker-compose up --build`.
3.  API will be available at `http://localhost:8000`.
4.  Swagger Docs at `http://localhost:8000/docs`.

### Database Migrations
Runs automatically on container startup or manually:
```bash
docker-compose exec backend alembic upgrade head
```

### Generating Migrations
```bash
docker-compose exec backend alembic revision --autogenerate -m "Message"
```
