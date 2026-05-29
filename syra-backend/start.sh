#!/bin/bash

# ================================================
# Script de inicialização rápida do Syra Backend
# ================================================

echo "🚀 Iniciando Syra Backend..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar Docker
echo -e "${YELLOW}✓ Verificando Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker não encontrado. Por favor, instale Docker.${NC}"
    exit 1
fi

# 2. Iniciar Docker Compose
echo -e "${YELLOW}✓ Iniciando containers Docker...${NC}"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Erro ao iniciar Docker Compose${NC}"
    exit 1
fi

# 3. Aguardar PostgreSQL iniciar
echo -e "${YELLOW}✓ Aguardando PostgreSQL iniciar...${NC}"
sleep 5

# 4. Compilar projeto
echo -e "${YELLOW}✓ Compilando projeto...${NC}"
./mvnw clean install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Erro na compilação${NC}"
    exit 1
fi

# 5. Iniciar aplicação
echo -e "${GREEN}✓ Iniciando aplicação Spring Boot...${NC}"
./mvnw spring-boot:run

echo -e "${GREEN}✓ Aplicação rodando em http://localhost:8080/api${NC}"
echo -e "${GREEN}✓ Swagger em http://localhost:8080/api/swagger-ui.html${NC}"
echo -e "${GREEN}✓ MailHog em http://localhost:8025${NC}"
echo -e "${GREEN}✓ pgAdmin em http://localhost:5050${NC}"

