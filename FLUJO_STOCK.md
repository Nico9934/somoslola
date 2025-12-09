# 📦 FLUJO DE STOCK EN PRODUCCIÓN

## Sistema de Reservas y Descuento de Stock

### 🔄 Ciclo de Vida del Stock

```
STOCK TOTAL = Stock Físico Disponible
STOCK RESERVADO = Cantidad en carritos activos (no expirados)
STOCK DISPONIBLE = STOCK TOTAL - STOCK RESERVADO
```

---

## 📋 FLUJOS PRINCIPALES

### 1️⃣ AGREGAR AL CARRITO

**Acción:** Usuario agrega producto al carrito

```javascript
// ✅ QUÉ PASA:
1. Valida que haya stock disponible (TOTAL - RESERVADO)
2. Incrementa reservedQty en la tabla Stock
3. Crea/actualiza CartItem con expiresAt = now + 15 minutos
4. El stock total NO cambia, solo se reserva

// 📊 EJEMPLO:
Stock Total: 10
Stock Reservado: 2 → 3 (incrementa)
Stock Disponible: 8 → 7 (calculado)
```

---

### 2️⃣ EXPIRACIÓN DE RESERVA (15 minutos)

**Acción:** Cron job ejecuta cada 2 minutos

```javascript
// ✅ QUÉ PASA:
1. Busca CartItems con expiresAt < now
2. Para cada item expirado:
   - Decrementa reservedQty
   - Elimina CartItem
3. El stock vuelve a estar disponible

// 📊 EJEMPLO:
Stock Total: 10 (no cambia)
Stock Reservado: 3 → 2 (decrementa)
Stock Disponible: 7 → 8 (vuelve a estar disponible)
```

---

### 3️⃣ CHECKOUT - Crear Orden

**Acción:** Usuario finaliza compra (click en "Finalizar Compra")

```javascript
// ✅ QUÉ PASA:
1. Crea Order con status = "PENDING"
2. Crea OrderItems con snapshot de datos
3. Establece reservedUntil = now + 24 horas
4. ⚠️ MANTIENE las reservas (NO decrementa reservedQty)
5. Vacía el carrito
6. Las reservas pasan de "carrito temporal" a "orden pendiente"
7. ⚠️ EL STOCK TOTAL NO SE DESCUENTA AÚN

// 📊 EJEMPLO:
Stock Total: 10 (NO CAMBIA)
Stock Reservado: 3 (MANTIENE - no cambia)
Stock Disponible: 7 (no cambia)

Status de Orden: PENDING
Reservado hasta: now + 24 horas
```

**💡 IMPORTANTE:** Las reservas se MANTIENEN activas por 24 horas. El stock sigue no disponible para otros clientes hasta que se confirme o expire el pago.

---

### 4️⃣ CONFIRMAR PAGO - Admin aprueba

**Acción:** Admin cambia status de PENDING → PAID

```javascript
// ✅ QUÉ PASA:
1. Valida que haya stock suficiente disponible
2. DESCUENTA el stock total (decrement quantity)
3. LIBERA las reservas (decrement reservedQty)
4. Cambia status a "PAID"
5. Envía email de confirmación

// 📊 EJEMPLO:
Stock Total: 10 → 7 (AQUÍ SÍ SE DESCUENTA)
Stock Reservado: 3 → 0 (se liberan las reservas)
Stock Disponible: 7 → 7 (ahora es stock real disponible)

Status de Orden: PENDING → PAID
```

---

### 5️⃣ EXPIRACIÓN DE ORDEN (24 horas)

**Acción:** Cron job ejecuta cada 30 minutos

```javascript
// ✅ QUÉ PASA:
1. Busca Orders PENDING con reservedUntil < now
2. Para cada orden expirada:
   - Libera reservas (decrement reservedQty)
   - Cancela la orden automáticamente
3. El stock vuelve a estar disponible

// 📊 EJEMPLO:
Stock Total: 10 (no cambia)
Stock Reservado: 3 → 0 (se liberan)
Stock Disponible: 7 → 10 (vuelve a estar disponible)

Status de Orden: PENDING → CANCELLED (automático)
```

---

### 6️⃣ CANCELAR ORDEN PENDING (manual)

**Acción:** Admin cancela orden que está PENDING

```javascript
// ✅ QUÉ PASA:
1. LIBERA las reservas (decrement reservedQty)
2. Cambia status a "CANCELLED"
3. NO devuelve stock total (porque nunca se descontó)

// 📊 EJEMPLO:
Stock Total: 10 (no cambia)
Stock Reservado: 3 → 0 (se liberan)
Stock Disponible: 7 → 10

Status de Orden: PENDING → CANCELLED
```

---

### 7️⃣ CANCELAR ORDEN PAID/SHIPPED (manual)

**Acción:** Admin cancela orden que ya estaba en PAID o SHIPPED

```javascript
// ✅ QUÉ PASA:
1. DEVUELVE el stock (increment quantity)
2. Cambia status a "CANCELLED"

// 📊 EJEMPLO:
Stock Total: 7 → 10 (se devuelve)
Stock Reservado: 0 (no cambia)
Stock Disponible: 7 → 10

Status de Orden: PAID → CANCELLED
```

---

## 🛡️ PROTECCIONES IMPLEMENTADAS

### Transacciones Atómicas
- Todas las operaciones críticas usan `prisma.$transaction()`
- Si una operación falla, se hace rollback automático
- Previene inconsistencias entre Stock y CartItems

### Validación al Inicio
- Función `validateStockIntegrity()` ejecuta al iniciar servidor
- Detecta y corrige inconsistencias automáticamente
- Limpia items expirados que el cron pudo haber dejado

### Cron Job Robusto
- **Carritos:** Ejecuta cada 2 minutos
- **Órdenes PENDING:** Ejecuta cada 30 minutos
- Manejo de errores individual por item
- Logs detallados de cada operación

---

## ⚠️ CASOS ESPECIALES

### ¿Qué pasa si dos personas intentan comprar el último producto?

**Escenario:**
- Stock Total: 1
- Usuario A agrega al carrito → Stock Reservado: 1
- Usuario B intenta agregar → ❌ Error "Stock insuficiente"

**Resultado:**
- Usuario A tiene 15 minutos para completar la compra
- Si expira, el stock se libera para Usuario B

### ¿Qué pasa si el pago tarda en confirmarse?

**Escenario:**
- Usuario hace checkout → Orden PENDING, reservas MANTENIDAS
- Stock sigue reservado por 24 horas
- Otro usuario NO puede comprarlo durante ese tiempo
- Si pasan 24 horas sin confirmar → Se cancela automáticamente y libera reservas

**Protección:**
- Las reservas se mantienen hasta confirmar o expirar
- Evita overselling (vender más de lo disponible)
- Timeout de 24 horas para no bloquear stock indefinidamente

---

## 📊 MONITOREO

### Scripts de Diagnóstico

```bash
# Ver estado actual de reservas
node backend/check-cart-expiry.js

# Reparar inconsistencias
node backend/fix-stock-reservations.js
```

### Logs a Revisar

- `♻️ Liberadas X reservas de stock expiradas` → Cron de carritos funcionando
- `⏰ Procesando X órdenes PENDING expiradas` → Cron de órdenes funcionando
- `🔒 Reservas mantenidas para orden #X` → Checkout OK
- `✅ Stock descontado y reservas liberadas para orden #X` → Pago confirmado OK

---

## 🚨 TROUBLESHOOTING

### Problema: Stock reservado no se libera

**Síntomas:**
- `reservedQty > 0` pero no hay items en carritos
- Stock aparece como no disponible

**Solución:**
```bash
# Ejecutar script de reparación
node backend/fix-stock-reservations.js

# O endpoint manual
POST /cart/cleanup-expired
```

### Problema: Stock negativo

**Síntomas:**
- `quantity < 0` en tabla Stock

**Causa:**
- Cancelación de orden sin validación
- Operaciones manuales en DB

**Solución:**
- Script de validación al inicio lo corrige automáticamente
- O actualizar manualmente en DB

---

## ✅ CHECKLIST PARA PRODUCCIÓN

- [ ] Servidor backend ejecutándose constantemente
- [ ] Cron job activo (verifica logs cada 2 minutos)
- [ ] Validación de integridad al startup funcionando
- [ ] Emails configurados correctamente
- [ ] Backup de base de datos programado
- [ ] Monitoreo de errores configurado

---

**Fecha:** Diciembre 2025
**Versión:** 1.0
