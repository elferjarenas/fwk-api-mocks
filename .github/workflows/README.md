# GitHub Actions - Personality Management

Este directorio contiene workflows para gestionar personalities en el mock service de Ticabank.

## 🎯 ¿Qué son Personalities?

Las **personalities** permiten simular diferentes escenarios de error sin modificar código. Cada usuario puede tener una personality asignada que determina la respuesta del API.

### Personalities Disponibles

| Code | Status | Descripción |
|------|--------|-------------|
| `YTIKABANK` | 200 | ✅ Success - Retorna oferta |
| `YPTPLI003` | 202 | No hay datos disponibles |
| `YPNOTCONF` | 202-e01 | Lead no confirmado |
| `YPINVTERM` | 202-e02 | Solicitud vigente |
| `YPPRODREG` | 202-e03 | Desembolso reciente |
| `YPMUNABLE` | 202-e04 | Sistema no disponible |
| `YPMLDSOLD` | 202-e05 | Lead vendido |
| `YPMBADREQ` | 400 | Bad Request |
| `YPUNAUTHZ` | 401 | Unauthorized |
| `YPTPLI004` | 404 | Operación no encontrada |
| `YPNOALLOW` | 405 | Method Not Allowed |
| `YPTOOMREQ` | 429 | Rate limit excedido |
| `YPSERVERR` | 500 | Internal Server Error |
| `YPTPLI020` | 504 | Timeout |

---

## 📋 Workflows Disponibles

### 1. Set Personality (`set-personality.yaml`)

Cambia la personality de un usuario específico en un ambiente.

**Uso:**
1. Ve a la pestaña **Actions**
2. Selecciona **"Set Ticabank Personality"**
3. Haz clic en **"Run workflow"**
4. Completa los campos:
   - **Environment**: `qa`, `stg`, `performance`, o `local`
   - **User Email**: Usuario a modificar (ej: `testerdev_ticabank2@test.com.pe`)
   - **Personality**: Código de personality (ej: `YPUNAUTHZ`)
5. Haz clic en **"Run workflow"**

**Ejemplo de uso:**
```
Environment: qa
User Email: testerdev_ticabank2@test.com.pe
Personality: YPTPLI020
```

**Resultado:**
- Usuario `testerdev_ticabank2` en QA retornará `504 Timeout`
- Otros usuarios no se ven afectados

---

### 2. Reset All Personalities (`reset-personalities.yaml`)

Resetea todos los usuarios a la personality por defecto (`YTIKABANK` - Success).

**Uso:**
1. Ve a la pestaña **Actions**
2. Selecciona **"Reset All Personalities"**
3. Haz clic en **"Run workflow"**
4. Selecciona el ambiente: `qa`, `stg`, `performance`, o `local`
5. Haz clic en **"Run workflow"**

**Resultado:**
- Todos los usuarios en ese ambiente retornarán `200 Success`

---

## 🔄 Flujo de Testing Completo

### Caso de Uso: Probar error 401 Unauthorized

```bash
# 1. Configurar personality via GitHub Action
Environment: qa
User: testerdev_ticabank2@test.com.pe
Personality: YPUNAUTHZ

# 2. Hacer request al API
curl -X POST https://fwk-api-mocks-qa.com/creditos-ticabank/sales/customer-offer/v1/lead/consultar \
  -H "Content-Type: application/json" \
  -H "X-User-Email: testerdev_ticabank2@test.com.pe" \
  -d '{
    "codigoPaisDocumento": "PE",
    "tipoDocumentoIdentidad": "C"
  }'

# 3. Response esperado
{
  "status": 401,
  "type": "creditos-ticabank/sales/customer-offer/v1/lead",
  "title": "La solicitud posee un error de autorización.",
  "detail": "Unauthorized",
  "instance": "lead.consultar"
}

# 4. Limpiar después del test
# Ejecutar workflow "Reset All Personalities" en QA
```

---

## 🛠️ Testing Manual (Sin GitHub Actions)

Si prefieres cambiar personalities manualmente:

```bash
# Cambiar personality
curl -X PUT https://fwk-api-mocks-qa.com/testing/ticabank/personality/testerdev_ticabank1@test.com.pe \
  -H "Content-Type: application/json" \
  -d '{"personality": "YPTPLI020"}'

# Ver personality actual
curl -X PUT https://fwk-api-mocks-qa.com/testing/ticabank/personality/testerdev_ticabank1@test.com.pe/get

# Resetear todas
curl -X POST https://fwk-api-mocks-qa.com/testing/ticabank/personality/reset

# Listar personalities disponibles
curl -X PUT https://fwk-api-mocks-qa.com/testing/ticabank/personality/codes
```

---

## 🌍 URLs por Ambiente

| Ambiente | URL Base |
|----------|----------|
| QA | `https://fwk-api-mocks-qa.com` |
| STG | `https://fwk-api-mocks-stg.com` |
| Performance | `https://fwk-api-mocks-perf.com` |
| Local | `http://localhost:8000` |

---

## 📊 Usuarios Disponibles

### Usuarios testerdev_ticabank (10 usuarios)
- `testerdev_ticabank1@test.com.pe` (clientCode: 3032596, maxAmount: 10000)
- `testerdev_ticabank2@test.com.pe` (clientCode: 2008016, maxAmount: 10000)
- `testerdev_ticabank3@test.com.pe` (clientCode: 2013036, maxAmount: 10000)
- `testerdev_ticabank4@test.com.pe` (clientCode: 2012566, maxAmount: 10000)
- `testerdev_ticabank5@test.com.pe` (clientCode: 2014598, maxAmount: 10000)
- `testerdev_ticabank6@test.com.pe` (clientCode: 2013036, maxAmount: 10000)
- `testerdev_ticabank7@test.com.pe` (clientCode: 2012566, maxAmount: 10000)
- `testerdev_ticabank8@test.com.pe` (clientCode: 2011053, maxAmount: 10000)
- `testerdev_ticabank9@test.com.pe` (clientCode: 2014598, maxAmount: 10000)
- `testerdev_ticabank10@test.com.pe` (clientCode: 2021598, maxAmount: 10000)

### Usuarios testercer_ticabank (12 usuarios)
- `testercer_ticabank1@test.com.pe` hasta `testercer_ticabank12@test.com.pe`

**Total: 22 usuarios disponibles**

---

## ⚠️ Notas Importantes

1. **Persistencia**: Las personalities se almacenan en memoria. Al reiniciar el servicio, vuelven al default (`YTIKABANK`).

2. **Isolation**: Cada usuario tiene su propia personality. Cambiar la personality de `testerdev_ticabank1` NO afecta a `testerdev_ticabank2`.

3. **Ambientes**: Cada ambiente (QA/STG/Performance) tiene su propia instancia y personalities independientes.

4. **No usar core-toggle-definitions**: Este proyecto NO usa toggles de Unleash. Todo se maneja vía personalities.

---

## 🚀 Próximos Pasos

- [ ] Agregar personalities para endpoints `simulate`, `quote`, `paydate`, `register`
- [ ] Implementar persistencia de personalities (Redis/Database)
- [ ] Agregar endpoint para listar personalities activas
- [ ] Crear dashboard web para gestionar personalities
- [ ] Integrar con Postman Collection automática
