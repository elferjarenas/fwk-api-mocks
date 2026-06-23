# Yape Mocks - Framework de Testing

[![GitHub](https://img.shields.io/badge/github-fwk--yape--mocks-blue)](https://github.com/elferjarenas/fwk-yape-mocks)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org/)

Mock service para APIs de múltiples squads (Mibanco, CIAM, Atlas, Cards) con soporte completo para testing E2E.

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Comandos Principales](#-comandos-principales)
- [Tests](#tests)
- [API Endpoints](#-api-endpoints)
- [Seed Data](#-seed-data-archivos-de-usuarios)
- [Contribuir](#-contribuir)

## 🚀 Instalación

### Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0

### Instalación desde GitHub

```bash
# Clonar el repositorio
git clone https://github.com/elferjarenas/fwk-yape-mocks.git
cd fwk-yape-mocks

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Iniciar servidor (con seed automático)
AUTO_SEED=true npm start
```

El servidor estará disponible en `http://localhost:5050`

### Instalación para Desarrollo

```bash
# Instalar con hooks de Git
npm install

# Modo desarrollo con hot-reload
npm run start:dev

# Modo desarrollo con seed automático
AUTO_SEED=true npm run start:dev
```

## 📝 Sistema de Commits (Git Hooks)

Este proyecto usa **Husky + Commitizen + Commitlint** para commits consistentes:

### Crear commits de forma interactiva (RECOMENDADO)
```bash
npm run commit          # Abre menú interactivo con Commitizen
# o
git add . && npm run commit
```

### Formato de commits (lowercase obligatorio)
```bash
# ✅ CORRECTO
git commit -m "feat(ciam): agregar endpoint de oauth"
git commit -m "fix(mibanco): corregir validación en quote"
git commit -m "docs: actualizar readme con ejemplos"

# ❌ INCORRECTO (bloqueado por hooks)
git commit -m "FEAT(ciam): Agregar Endpoint"  # Mayúsculas bloqueadas
git commit -m "Fix: problema"                  # Sin scope
```

### Tipos de commits disponibles
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Cambios en documentación
- `test`: Agregar o modificar tests
- `refactor`: Refactorización de código
- `perf`: Mejoras de performance
- `style`: Cambios de formato (sin lógica)
- `build`: Cambios en build o dependencias
- `ci`: Cambios en CI/CD
- `chore`: Tareas de mantenimiento
- `revert`: Revertir commits

### Scopes disponibles
- `ciam`: Endpoints CIAM
- `mibanco`: Endpoints Mibanco
- `atlas`: Endpoints Atlas
- `common`: Código compartido
- `tests`: Cambios en tests
- `deps`: Actualización de dependencias
- `config`: Configuración del proyecto

### Git Hooks instalados

**commit-msg**: Valida formato lowercase
**prepare-commit-msg**: Abre Commitizen si mensaje inválido
**pre-push**: Corre `npm test` (103 tests) antes de push

### Saltar validación (NO RECOMENDADO)
```bash
git commit --no-verify -m "mensaje"
git push --no-verify
```
⚠️ **Aunque puedas saltarte los hooks locales, GitHub Actions SIEMPRE validará en el servidor**

## 🚀 Comandos Principales

### Servidor
```bash
npm start              # Iniciar servidor (producción)
npm run start:dev      # Iniciar servidor (desarrollo con hot-reload)
npm run build          # Compilar TypeScript
```

### 📂 Seed Data (Archivos de Usuarios)

El proyecto tiene **3 archivos de seed** independientes:

```bash
data/seed-test.yml        # Usuarios aislados para tests (DEFAULT)
                          # Cards V4, Atlas, CIAM tests específicos
                          # Evita contaminación de datos entre squads

data/seed-users.yml       # Usuarios base compartidos
                          # Mibanco, CIAM, usuarios generales

data/seed-performance.yml # Usuarios para pruebas de carga
                          # Copia de seed-users para stress testing
```

**¿Cuándo usar cada uno?**
- **Tests automatizados**: `seed-test.yml` (DEFAULT - se usa automáticamente)
- **Desarrollo local**: `SEED_TYPE=users` para usuarios generales
- **Pruebas de carga**: `SEED_TYPE=performance`

**Ejemplo:**
```bash
# Tests con usuarios aislados (DEFAULT)
AUTO_SEED=true npm run dev

# Desarrollo con usuarios base
AUTO_SEED=true SEED_TYPE=users npm run dev

# Performance testing
AUTO_SEED=true SEED_TYPE=performance npm run dev
```

### Tests

#### 🎯 Ejecutar TODOS los tests (todos los squads)
```bash
# El comando npm test automáticamente:
# 1. Compila TypeScript
# 2. Arranca el servidor con AUTO_SEED=true
# 3. Espera a que esté listo
# 4. Ejecuta los tests E2E
# 5. Detiene el servidor
npm test               # Corre TODOS los tests (97 tests)
npm run test:all       # Alias de npm test
npm run test:cov       # Tests con cobertura
```

> ✅ **97/97 tests passing** - El script maneja automáticamente el ciclo de vida del servidor

#### 🎯 Ejecutar tests por squad

> ✅ **Todos los tests manejan el ciclo de vida del servidor automáticamente**.
> Ya no es necesario arrancar el servidor manualmente.

```bash
npm run test:atlas     # Solo Atlas (6 tests)
npm run test:cards     # Solo Cards (12 tests)
npm run test:ciam      # Solo CIAM (30 tests)
npm run test:mibanco   # Solo Mibanco (49 tests)
```

**Resultado esperado**: Todos los tests pasan al 100% tanto individualmente como agrupados.

```
✅ Atlas:    6/6   tests (100%)
✅ Cards:    12/12 tests (100%)
✅ CIAM:     30/30 tests (100%)
✅ Mibanco:  49/49 tests (100%)
✅ npm test: 97/97 tests (100%)
```

## 🏦 Cards V4 API - Endpoints Disponibles

### 1️⃣ GET: Lista de tarjetas

Obtiene la lista de tarjetas de un cliente con paginación automática (15 tarjetas por página).

**Endpoint:**
```
GET /bs-card-v4/customer-management/product-service/v4/cards
```

**Headers requeridos:**
```
branch-office-code: BR001
user-code: USER001
```

**Query params:**
```
personId: {IDC}000 (11 dígitos: IDC + 3 ceros)
pageNumber: 1 (opcional, default 1)
extraFields: true|false (opcional, incluye products con accounts)
```

**Ejemplo curl:**
```bash
# Lista básica
curl -X GET "http://localhost:5050/bs-card-v4/customer-management/product-service/v4/cards?personId=12345678000" \
  -H "branch-office-code: BR001" \
  -H "user-code: USER001"

# Con paginación y products
curl -X GET "http://localhost:5050/bs-card-v4/customer-management/product-service/v4/cards?personId=12345678000&pageNumber=1&extraFields=true" \
  -H "branch-office-code: BR001" \
  -H "user-code: USER001"
```

**Response exitoso (200):**
```json
[
  {
    "number": "4557881234567890",
    "status": "00",
    "statusDescription": "ACTIVA",
    "expiryDate": "12/26",
    "cardTypeDescription": "PHYSICAL",
    "embossedName": "JUAN PEREZ",
    "electronicCommerce": true,
    "abroadUsage": true,
    "products": [
      {
        "productDescription": "CUENTA AHORRO",
        "formattedAccount": "194-12345678-0-00"
      }
    ]
  }
]
```

### 2️⃣ GET: Detalle de tarjeta

Obtiene información detallada de una tarjeta específica.

**Endpoint:**
```
GET /bs-card-v4/customer-management/product-service/v4/cards/:cardId
```

**Ejemplo curl:**
```bash
curl -X GET "http://localhost:5050/bs-card-v4/customer-management/product-service/v4/cards/4557881234567890?extraFields=true" \
  -H "branch-office-code: BR001" \
  -H "user-code: USER001"
```

### 3️⃣ PATCH: Actualizar configuración de tarjeta

Actualiza la configuración de uso de una tarjeta (ecommerce y/o extranjero).

**Endpoint:**
```
PATCH /bs-card-v4/customer-management/product-service/v4/cards/:cardId
```

**Headers requeridos:**
```
branch-office-code: BR001
user-code: USER001
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "ecommerceEnabled": true,
  "abroadUseEnabled": false
}
```

**Ejemplo curl:**
```bash
curl -X PATCH "http://localhost:5050/bs-card-v4/customer-management/product-service/v4/cards/4557881234567890" \
  -H "branch-office-code: BR001" \
  -H "user-code: USER001" \
  -H "Content-Type: application/json" \
  -d '{"ecommerceEnabled": true, "abroadUseEnabled": false}'
```

**Response exitoso (204 No Content):**
```
(cuerpo vacío)
```

### 🎭 Personalities para Testing

Cards V4 soporta múltiples personalities para simular diferentes escenarios de error. Siguen el patrón estándar **YPCARD###** (9 dígitos):

| Personality | IDC | Status | Descripción |
|------------|-----|--------|-------------|
| `YPCARD000` | (cualquiera) | 200 | Success - flujo normal |
| `YPCARD001` | 11111111 | 401 | Token inválido o expirado |
| `YPCARD002` | 22222222 | 503 | Timeout de servicio |
| `YPCARD003` | 33333333 | 400 | IDC inválido |
| `YPCARD007` | 77777777 | 409 | Servicio externo no disponible |
| `YPCARD008` | 88888887 | 500 | Error en backend |
| `YPCARD004` | 44444445 | 500 | Servicio no disponible |
| `YPCARD005` | 55555556 | 500 | Circuit breaker abierto |
| `YPCARD006` | 66666666 | 503 | Circuit breaker abierto |
| `YPCARD009` | 99999997 | 400 | Datos incorrectos |
| `YPCARD010` | 99999998 | 400 | Tipo de tarjeta inválido |

**Lógica de validación:**
- Usuario **sin** personality → flujo normal (devuelve tarjetas si existen)
- Usuario con `YPCARD000` → flujo normal (success personality)
- Usuario con `YPCARD001-010` → simula el error correspondiente
- Usuario con personality de **otro squad** (YPMIBANCO, YPCIAM) → retorna array vacío o 404

> **Nota**: Las personalities son strings simples (no arrays). Un usuario solo tiene una personality activa a la vez.

**Ejemplo de uso:**
```bash
# Simular error 401
curl "http://localhost:5050/bs-card-v4/customer-management/product-service/v4/cards?personId=11111111000" \
  -H "branch-office-code: BR001" \
  -H "user-code: USER001"

# Usuario con YPMIBANCO (otro squad) - devuelve array vacío
curl "http://localhost:5050/bs-card-v4/customer-management/product-service/v4/cards?personId=034636351000" \
  -H "branch-office-code: BR001" \
  -H "user-code: USER001"
```

### 📄 Paginación

Las respuestas de lista incluyen headers de paginación:

```
items-pending: true|false
page-number: 2 (si hay más páginas)
```

La paginación es automática con 15 tarjetas por página.

### 🔍 ExtraFields

Cuando `extraFields=true`, cada tarjeta incluye un array `products` con las cuentas asociadas en formato BCP:

```json
"products": [
  {
    "productDescription": "CUENTA AHORRO",
    "formattedAccount": "194-12345678-0-00"
  }
]
```

**Formato de cuenta:**
- AHORRO: `194-{accountNumber}-0-{checkDigit}`
- CORRIENTE: `193-{accountNumber}-0-{checkDigit}`
- MAESTRA: `191-{accountNumber}-1-{checkDigit}`

## 📁 Estructura del Proyecto

```
fwk-yape-mocks/
├── .husky/                    # Git hooks (commitizen, commitlint)
├── data/                      # Archivos YAML de seed
│   ├── seed-test.yml         # Usuarios para tests (DEFAULT)
│   ├── seed-performance.yml  # Usuarios para pruebas de carga
│   └── seed-test.yml.backup  # Backup de configuración
├── docs/                      # Documentación del proyecto
│   ├── EXECUTIVE-SUMMARY.md
│   ├── MIGRATION-GUIDE.md
│   ├── MIGRATION-SUMMARY.md
│   └── SERVICE-VIRTUALIZATION-ANALYSIS.md
├── infra/
│   └── helm/                  # Configuraciones Kubernetes
│       ├── values.yaml
│       ├── performance/
│       ├── qa/
│       └── stg/
├── src/                       # Código fuente TypeScript
│   ├── app.ts                # Servidor principal Fastify
│   ├── atlas/                # Endpoints Atlas (Transfers)
│   │   ├── atlas.routes.ts
│   │   ├── constants/
│   │   │   └── api-codes.ts
│   │   ├── entities/
│   │   │   ├── transfer-request-dto.ts
│   │   │   └── transfer-response-dto.ts
│   │   ├── exceptions/
│   │   │   ├── atlas-exception.ts
│   │   │   └── exception-builder.ts
│   │   ├── helpers/
│   │   │   └── transfer.helper.ts
│   │   ├── messages/
│   │   │   └── response.ts
│   │   ├── utility/
│   │   │   └── personality.ts
│   │   └── validators/
│   │       └── transfer.validator.ts
│   ├── cards/                # Endpoints Cards V4
│   │   ├── cards.routes.ts
│   │   ├── constants/
│   │   │   ├── api-codes.ts
│   │   │   ├── parameters.ts
│   │   │   └── personality-mappings.ts
│   │   ├── entities/
│   │   │   └── card-dto.ts
│   │   ├── exceptions/
│   │   │   ├── cards-exception.ts
│   │   │   └── exception-builder.ts
│   │   ├── helpers/
│   │   │   ├── card-detail.helper.ts
│   │   │   ├── card-list.helper.ts
│   │   │   └── card-update.helper.ts
│   │   ├── messages/
│   │   │   ├── response.ts
│   │   │   └── templates.ts
│   │   ├── support/
│   │   │   └── account-formatter.ts
│   │   └── validators/
│   │       ├── card-detail.validator.ts
│   │       ├── card-list.validator.ts
│   │       └── card-update.validator.ts
│   ├── ciam/                 # Endpoints CIAM (Authentication)
│   │   ├── ciam.routes.ts
│   │   ├── constants/
│   │   │   └── api-codes.ts
│   │   ├── entities/
│   │   │   ├── enrollment-dto.ts
│   │   │   └── authentication-dto.ts
│   │   ├── exceptions/
│   │   │   ├── ciam-exception.ts
│   │   │   └── exception-builder.ts
│   │   ├── helpers/
│   │   │   ├── identification-methods.helper.ts
│   │   │   ├── facial-verification.helper.ts
│   │   │   ├── facial-identifiers.helper.ts
│   │   │   └── oauth-token.helper.ts
│   │   ├── messages/
│   │   │   ├── response.ts
│   │   │   └── templates.ts
│   │   ├── utility/
│   │   │   └── personality.ts
│   │   └── validators/
│   │       └── facial-verification-validator.ts
│   ├── common/               # Código compartido
│   │   ├── api-types.ts
│   │   ├── base-personality-helper.ts
│   │   ├── exceptions.ts
│   │   ├── http-status-codes.ts
│   │   ├── personality-checker.ts
│   │   ├── personality-types.ts
│   │   ├── route-builder.ts
│   │   ├── testing.routes.ts
│   │   ├── user-service.ts
│   │   └── validators/
│   │       └── base-validator.ts
│   ├── mibanco/              # Endpoints Mibanco (Lending)
│   │   ├── mibanco.routes.ts
│   │   ├── constants/
│   │   │   ├── api-codes.ts
│   │   │   └── parameters.ts
│   │   ├── entities/
│   │   │   ├── offer-dto.ts
│   │   │   ├── quote-dto.ts
│   │   │   └── simulate-dto.ts
│   │   ├── exceptions/
│   │   │   ├── mibanco-exception.ts
│   │   │   └── exception-builder.ts
│   │   ├── helpers/
│   │   │   ├── offer.helper.ts
│   │   │   ├── paydate.helper.ts
│   │   │   ├── quote.helper.ts
│   │   │   ├── register.helper.ts
│   │   │   └── simulate.helper.ts
│   │   ├── messages/
│   │   │   ├── response.ts
│   │   │   └── templates.ts
│   │   ├── support/
│   │   │   └── offer-calculator.ts
│   │   ├── utility/
│   │   │   └── personality.ts
│   │   └── validators/
│   │       ├── offer.validator.ts
│   │       ├── quote.validator.ts
│   │       └── simulate.validator.ts
│   ├── repository/           # Gestión de datos en memoria
│   │   └── user-repository.ts
│   └── types/
│       └── user-types.ts
├── test/                     # Tests E2E con Jest
│   ├── atlas/
│   │   └── transfer.e2e-spec.ts
│   ├── cards/
│   │   ├── cards-detail.e2e-spec.ts
│   │   └── cards-list.e2e-spec.ts
│   ├── ciam/
│   │   ├── authentication.e2e-spec.ts
│   │   ├── biometry.e2e-spec.ts
│   │   ├── enrollment.e2e-spec.ts
│   │   ├── facial-identifiers.e2e-spec.ts
│   │   └── oauth.e2e-spec.ts
│   ├── mibanco/
│   │   ├── offer.e2e-spec.ts
│   │   ├── paydate.e2e-spec.ts
│   │   ├── quote.e2e-spec.ts
│   │   ├── register.e2e-spec.ts
│   │   └── simulate.e2e-spec.ts
│   ├── config/
│   │   └── test-config.ts
│   ├── helpers/
│   │   └── yape-endpoints.helper.ts
│   ├── scripts/
│   │   └── update-test-endpoints.cjs
│   ├── global-setup.ts
│   ├── jest.config.json      # Configuración principal
│   ├── jest-atlas.json       # Config Atlas
│   ├── jest-cards.json       # Config Cards
│   ├── jest-ciam.json        # Config CIAM
│   ├── jest-mibanco.json     # Config Mibanco
│   ├── run-tests.sh          # Script wrapper tests
│   └── start-server-and-test.sh
├── commitlint.config.cjs     # Configuración commitlint
├── package.json
├── tsconfig.json
└── README.md
```

### Módulos por Squad

| Squad    | Endpoints | Helpers | Validators | Excepciones | Tests E2E |
|----------|-----------|---------|------------|-------------|-----------|
| **Atlas**    | 1 | 1 | 1 | 2 | 6 tests |
| **Cards**    | 3 | 3 | 3 | 2 | 12 tests |
| **CIAM**     | 8 | 4 | 1 | 2 | 30 tests |
| **Mibanco**  | 5 | 5 | 3 | 2 | 49 tests |
| **Common**   | 2 | 3 | 1 | 1 | - |
| **TOTAL**    | **19** | **16** | **9** | **9** | **97 tests** |

## 📊 Cobertura de Tests

| Squad    | Archivos | Tests | Endpoints | Estado |
|----------|----------|-------|-----------|--------|
| Atlas    | 1        | 6     | 1/1       | ✅ 100% |
| Cards    | 2        | 12    | 3/3       | ✅ 100% |
| CIAM     | 5        | 30    | 8/8       | ✅ 100% |
| Mibanco  | 5        | 49    | 5/5       | ✅ 100% |
| **TOTAL**| **13**   | **97**| **17/17** | **✅ 100%** |

### Ejecución de Tests

Todos los tests incluyen:
- ✅ Inicio automático del servidor con `AUTO_SEED=true`
- ✅ Espera hasta que el servidor esté listo
- ✅ Ejecución de los tests E2E
- ✅ Cierre automático del servidor al finalizar
- ✅ Identificación específica de usuario mediante header `X-User-Email`

```bash
# Todos los módulos funcionan INDIVIDUALMENTE y AGRUPADOS al 100%
npm run test:mibanco  # 49/49 ✅
npm run test:ciam     # 30/30 ✅
npm run test:cards    # 12/12 ✅
npm run test:atlas    # 6/6 ✅
npm test              # 97/97 ✅
```

## 🔧 Tecnologías

- **Runtime**: Node.js >= 18.0.0 + TypeScript 5.x
- **Framework Web**: Fastify 4.x (alta performance)
- **Testing**: Jest + Supertest (E2E tests)
- **Data Storage**: In-memory repository con seed YAML
- **Git Workflow**: Husky + Commitizen + Commitlint
- **CI/CD**: GitHub Actions (validación automática)

### Dependencias Principales

```json
{
  "fastify": "^4.x",
  "typescript": "^5.x",
  "jest": "^29.x",
  "supertest": "^7.x",
  "yaml": "^2.x"
}
```

## 🌐 API Endpoints

### Resumen de Endpoints

| Squad | Método | Endpoint | Descripción |
|-------|--------|----------|-------------|
| **Atlas** | POST | `/api-transfer-yape/v1/transfer` | Realizar transferencia |
| **Cards** | GET | `/bs-card-v4/customer-management/product-service/v4/cards` | Listar tarjetas |
| **Cards** | GET | `/bs-card-v4/customer-management/product-service/v4/cards/:id` | Detalle de tarjeta |
| **Cards** | PATCH | `/bs-card-v4/customer-management/product-service/v4/cards/:id` | Actualizar configuración |
| **CIAM** | GET | `/channel/ciam/mobile-login/v1/identification-methods` | Métodos de identificación v1 |
| **CIAM** | GET | `/channel/ciam/mobile-login/v2/identification-methods` | Métodos de identificación v2 |
| **CIAM** | POST | `/channel/ciam/mobile-login/v1/identification-methods/facial-verification` | Verificación facial v1 |
| **CIAM** | POST | `/channel/ciam/mobile-login/v2/identification-methods/facial-verification` | Verificación facial v2 |
| **CIAM** | POST | `/cas/oidc/accessToken` | Token OIDC |
| **CIAM** | POST | `/auth/oauth/v2/token` | Token OAuth |
| **CIAM** | GET | `/ux-biom-mobile-facial-overview-v1/channel/biom/v1/mobile-facial-overview/facial-identifiers` | Identificadores faciales |
| **Mibanco** | POST | `/creditos-yape/sales/customer-offer/v1/lead/consultar` | Consultar oferta |
| **Mibanco** | GET | `/creditos-yape/servicing/servicing-order/v1/simulacion/obtener-dias-pago` | Obtener días de pago |
| **Mibanco** | GET | `/creditos-yape/servicing/servicing-order/v1/simulacion/generar` | Generar simulación |
| **Mibanco** | POST | `/creditos-yape/servicing/servicing-order/v1/simulacion/cotizar` | Cotizar préstamo |
| **Mibanco** | POST | `/creditos-yape/servicing/servicing-order/v1/orden-servicio/registrar` | Registrar orden |
| **Testing** | POST | `/yape/ChangeUserPersonality` | Cambiar personality de usuario |
| **Testing** | GET | `/yape/health` | Health check |

### Servidor

**Base URL**: `http://localhost:5050`

**Health Check**:
```bash
curl http://localhost:5050/yape/health
# Response: {"status":"OK","service":"fwk-yape-mocks"}
```

## 📝 Agregar Nuevo Squad

1. Crear carpeta en `src/nuevo-squad/`
2. Crear helpers, validators, messages según patrón existente
3. Agregar rutas en `src/app.ts`
4. Crear carpeta `test/nuevo-squad/` con tests E2E
5. Crear `test/jest-nuevo-squad.json` configuración
6. Agregar script en `package.json`:
   ```json
   "test:nuevo-squad": "jest --config ./test/jest-nuevo-squad.json"
   ```

## 🎯 Ejemplo: Ejecutar Tests por Stages

```bash
# Stage 1: Tests rápidos (unit/integration)
npm run test:mibanco:personalities

# Stage 2: Tests de negocio
npm run test:ciam
npm run test:mibanco

# Stage 3: Tests completos (pre-deploy)
npm test
```

## 📖 Documentación Adicional

- [CIAM Endpoints](./docs/ciam-endpoints.md) - Documentación detallada de endpoints CIAM
- [Mibanco Endpoints](./docs/mibanco-endpoints.md) - Documentación detallada de endpoints Mibanco
- [Personalities](./docs/personalities.md) - Guía de personalities para testing

## 🤝 Contribuir

### Flujo de Trabajo

1. **Fork y clonar el repositorio**
   ```bash
   git clone https://github.com/elferjarenas/fwk-yape-mocks.git
   cd fwk-yape-mocks
   npm install
   ```

2. **Crear branch desde `main`**
   ```bash
   git checkout -b feat/nueva-funcionalidad
   ```

3. **Desarrollar con TDD (Test-Driven Development)**
   - Escribir tests primero en `test/<squad>/`
   - Implementar código en `src/<squad>/`
   - Verificar que pasen: `npm run test:<squad>`

4. **Hacer commits con Commitizen**
   ```bash
   npm run commit
   # o
   git add . && npm run commit
   ```

5. **Verificar que todos los tests pasen**
   ```bash
   npm test  # Debe ser 97/97 ✅
   ```

6. **Push y Pull Request**
   ```bash
   git push origin feat/nueva-funcionalidad
   ```

### Agregar Nuevo Squad

Para agregar un nuevo módulo (ej: `pagos`):

1. **Crear estructura de carpetas**:
   ```bash
   mkdir -p src/pagos/{helpers,validators,exceptions,messages,entities,constants}
   ```

2. **Crear archivo de rutas**: `src/pagos/pagos.routes.ts`
   ```typescript
   import type { FastifyInstance } from 'fastify';
   import { RouteBuilder } from '../common/route-builder.js';
   
   export function registerPagosRoutes(fastify: FastifyInstance) {
     const builder = new RouteBuilder(fastify);
     
     builder.post('/api/pagos/v1/realizar', async (body, request) => {
       // Implementación
     });
   }
   ```

3. **Registrar rutas en** `src/app.ts`:
   ```typescript
   import { registerPagosRoutes } from './pagos/pagos.routes.js';
   
   // En setupRoutes()
   registerPagosRoutes(fastify);
   ```

4. **Crear tests**: `test/pagos/pago.e2e-spec.ts`

5. **Configuración Jest**: `test/jest-pagos.json`
   ```json
   {
     "displayName": "Pagos E2E Tests",
     "rootDir": "../",
     "testMatch": ["<rootDir>/test/pagos/**/*.e2e-spec.ts"]
   }
   ```

6. **Agregar scripts en** `package.json`:
   ```json
   {
     "test:pagos": "./test/run-tests.sh pagos"
   }
   ```

### Guía de Estilo

- **Nombres de archivos**: kebab-case (ej: `offer-calculator.ts`)
- **Clases**: PascalCase (ej: `OfferHelper`)
- **Funciones**: camelCase (ej: `calculateOffer()`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MAX_RETRIES`)
- **Interfaces**: PascalCase con sufijo (ej: `OfferDto`, `ValidationError`)

### Validaciones Automáticas

Todos los commits y pushes son validados automáticamente:

- ✅ **commit-msg**: Valida formato de commit (commitlint)
- ✅ **pre-push**: Ejecuta `npm test` (97 tests)
- ✅ **GitHub Actions**: Validación en servidor al hacer PR

### Recursos

- 📖 [Documentación completa](./docs/)
- 🐛 [Reportar issues](https://github.com/elferjarenas/fwk-yape-mocks/issues)
- 💬 [Discusiones](https://github.com/elferjarenas/fwk-yape-mocks/discussions)

## 📝 Licencia

Este proyecto es de uso interno de Yape.

---

**Mantenido por**: Squad de Testing - Yape  
**Repositorio**: [github.com/elferjarenas/fwk-yape-mocks](https://github.com/elferjarenas/fwk-yape-mocks)

**Última actualización**: Junio 2026
