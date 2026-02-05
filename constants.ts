
export const DEFAULT_FILES: Record<string, string> = {
  'Dockerfile': `FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH /app

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    libpq-dev \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Run the application
CMD ["python", "src/main.py"]`,

  'docker-compose.yml': `version: '3.8'

services:
  app:
    build: .
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: automation_db
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"`,

  'Makefile': `.PHONY: install run test lint clean docker-up docker-down

install:
	pip install -r requirements.txt

run:
	python src/main.py

test:
	pytest tests/

lint:
	flake8 src/ tests/
	black --check src/ tests/
	isort --check-only src/ tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	rm -rf .pytest_cache
	rm -rf .coverage

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down`,

  '.env.example': `# Database
DATABASE_URL=postgresql://user:password@localhost:5432/automation_db

# Redis
REDIS_URL=redis://localhost:6379/0

# App Config
LOG_LEVEL=INFO
SECRET_KEY=generate-me-locally-with-openssl`,

  'ci-cd-pipeline.yml': `name: Python Automation CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install flake8 black isort pytest
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    - name: Lint
      run: |
        black --check .
        flake8 .
    - name: Test
      run: |
        pytest tests/`,

  'src/main.py': `import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

def main():
    logger.info("Automation Microservice Starting...")
    # Your main logic here
    pass

if __name__ == "__main__":
    main()`,

  'requirements.txt': `python-dotenv==1.0.0
requests==2.31.0
psycopg2-binary==2.9.6
redis==4.6.0
pytest==7.4.0
black==23.7.0
flake8==6.1.0
isort==5.12.0`,

  'tests/test_main.py': `def test_placeholder():
    assert True

def test_config_loading():
    # Test logic for env loading
    pass`
};
