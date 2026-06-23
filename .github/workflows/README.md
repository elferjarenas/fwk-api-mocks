# GitHub Actions - Personality Management

Este directorio contiene workflows para gestionar personalities en el mock service de Mibanco.

## 🎯 ¿Qué son Personalities?

Las **personalities** permiten simular diferentes escenarios de error sin modificar código. Cada usuario puede tener una personality asignada que determina la respuesta del API.

### Personalities Disponibles

| Code | Status | Descripción |
|------|--------|-------------|
| `YPMIBANCO` | 200 | ✅ Success - Retorna oferta |
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
2. Selecciona **"Set Mibanco Personality"**
3. Haz clic en **"Run workflow"**
4. Completa los campos:
   - **Environment**: `qa`, `stg`, `performance`, o `local`
   - **User Email**: Usuario a modificar (ej: `yaperod_mibanco2@test-yape.com.pe`)
   - **Personality**: Código de personality (ej: `YPUNAUTHZ`)
5. Haz clic en **"Run workflow"**

**Ejemplo de uso:**
```
Environment: qa
User Email: yaperod_mibanco2@test-yape.com.pe
Personality: YPTPLI020
```

**Resultado:**
- Usuario `yaperod_mibanco2` en QA retornará `504 Timeout`
- Otros usuarios no se ven afectados

---

### 2. Reset All Personalities (`reset-personalities.yaml`)

Resetea todos los usuarios a la personality por defecto (`YPMIBANCO` - Success).

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
User: yaperod_mibanco2@test-yape.com.pe
Personality: YPUNAUTHZ

# 2. Hacer request al API
curl -X POST https://fwk-yape-mocks-qa.yaperos.com/creditos-yape/sales/customer-offer/v1/lead/consultar \
  -H "Content-Type: application/json" \
  -H "X-User-Email: yaperod_mibanco2@test-yape.com.pe" \
  -d '{
    "codigoPaisDocumento": "PE",
    "tipoDocumentoIdentidad": "C"
  }'

# 3. Response esperado
{
  "status": 401,
  "type": "creditos-yape/sales/customer-offer/v1/lead",
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
curl -X PUT https://fwk-yape-mocks-qa.yaperos.com/testing/mibanco/personality/yaperod_mibanco1@test-yape.com.pe \
  -H "Content-Type: application/json" \
  -d '{"personality": "YPTPLI020"}'

# Ver personality actual
curl -X PUT https://fwk-yape-mocks-qa.yaperos.com/testing/mibanco/personality/yaperod_mibanco1@test-yape.com.pe/get

# Resetear todas
curl -X POST https://fwk-yape-mocks-qa.yaperos.com/testing/mibanco/personality/reset

# Listar personalities disponibles
curl -X PUT https://fwk-yape-mocks-qa.yaperos.com/testing/mibanco/personality/codes
```

---

## 🌍 URLs por Ambiente

| Ambiente | URL Base |
|----------|----------|
| QA | `https://fwk-yape-mocks-qa.yaperos.com` |
| STG | `https://fwk-yape-mocks-stg.yaperos.com` |
| Performance | `https://fwk-yape-mocks-perf.yaperos.com` |
| Local | `http://localhost:8000` |

---

## 📊 Usuarios Disponibles

### Usuarios yaperod_mibanco (10 usuarios)
- `yaperod_mibanco1@test-yape.com.pe` (clientCode: 3032596, maxAmount: 10000)
- `yaperod_mibanco2@test-yape.com.pe` (clientCode: 2008016, maxAmount: 10000)
- `yaperod_mibanco3@test-yape.com.pe` (clientCode: 2013036, maxAmount: 10000)
- `yaperod_mibanco4@test-yape.com.pe` (clientCode: 2012566, maxAmount: 10000)
- `yaperod_mibanco5@test-yape.com.pe` (clientCode: 2014598, maxAmount: 10000)
- `yaperod_mibanco6@test-yape.com.pe` (clientCode: 2013036, maxAmount: 10000)
- `yaperod_mibanco7@test-yape.com.pe` (clientCode: 2012566, maxAmount: 10000)
- `yaperod_mibanco8@test-yape.com.pe` (clientCode: 2011053, maxAmount: 10000)
- `yaperod_mibanco9@test-yape.com.pe` (clientCode: 2014598, maxAmount: 10000)
- `yaperod_mibanco10@test-yape.com.pe` (clientCode: 2021598, maxAmount: 10000)

### Usuarios yaperoc_mibanco (12 usuarios)
- `yaperoc_mibanco1@test-yape.com.pe` hasta `yaperoc_mibanco12@test-yape.com.pe`

**Total: 22 usuarios disponibles**

---

## ⚠️ Notas Importantes

1. **Persistencia**: Las personalities se almacenan en memoria. Al reiniciar el servicio, vuelven al default (`YPMIBANCO`).

2. **Isolation**: Cada usuario tiene su propia personality. Cambiar la personality de `yaperod_mibanco1` NO afecta a `yaperod_mibanco2`.

3. **Ambientes**: Cada ambiente (QA/STG/Performance) tiene su propia instancia y personalities independientes.

4. **No usar core-toggle-definitions**: Este proyecto NO usa toggles de Unleash. Todo se maneja vía personalities.

5. **Compatibilidad Ruby**: Este sistema replica exactamente el comportamiento de `yape-wall-e-qa-mbrk` (Ruby).

---

## 🚀 Próximos Pasos

- [ ] Agregar personalities para endpoints `simulate`, `quote`, `paydate`, `register`
- [ ] Implementar persistencia de personalities (Redis/Database)
- [ ] Agregar endpoint para listar personalities activas
- [ ] Crear dashboard web para gestionar personalities
- [ ] Integrar con Postman Collection automática

---

## 📞 Soporte

Para preguntas o issues:
- Slack: #yape-qa-automation
- GitHub Issues: [fwk-yape-mocks-ts](https://github.com/yaperos/fwk-yape-mocks-ts/issues)
