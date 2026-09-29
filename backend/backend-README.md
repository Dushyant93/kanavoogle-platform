# Backend Development

## Requirements

Install:

- Java 21
- Maven 3.x
- Docker Desktop

Check:

```bash
java -version
mvn -version
docker --version
```

## Run backend tests

```bash
cd backend
mvn test
```

Test source files are under:

```text
backend/src/test/java/
```

## Run the full project

From the project root:

```bash
docker compose up -d --build
```

Check services:

```bash
docker compose ps
```

Frontend:

```text
http://localhost:8088
```

## Rebuild backend only

From the project root:

```bash
docker compose up -d --build --no-deps backend
```

## Stop the project

```bash
docker compose down
```

## Notes

- Use Java 21 for backend development.
- Do not commit `.env`, API keys, database passwords, or other secrets.
- Do not commit `backend/target/`.
- Backend source files are under `backend/src/main/java/`.
