# 🔄 Guía de Migración - Sistema de Diseño Modular

Guía paso a paso para migrar componentes existentes al nuevo sistema de diseño.

## 📋 Checklist de Migración

- [ ] Importar módulos necesarios
- [ ] Reemplazar clases de Tailwind inline por patrones
- [ ] Actualizar botones
- [ ] Actualizar cards/contenedores
- [ ] Actualizar texto y títulos
- [ ] Actualizar inputs (si aplica)
- [ ] Actualizar alertas (si aplica)
- [ ] Probar visualmente
- [ ] Eliminar imports no utilizados

---

## 🎯 Componentes Prioritarios para Migrar

### 1. **Cart.jsx** - Carrito de Compras
**Patrones a usar:**
- `layout.container`
- `text.sectionTitle`
- `products.item`, `products.image`, `products.name`
- `orderSummary` (componente)
- `buttons.primary`, `buttons.secondary`

### 2. **Checkout.jsx** - Flujo de Checkout
**Patrones a usar:**
- `layout.container`, `layout.grid2Col`
- `cards.bordered`, `cards.background`
- `inputs.text`, `inputs.label`, `inputs.group`
- `text.sectionTitle`
- `buttons.primary`, `buttons.secondary`
- `alerts.success`, `alerts.error`

### 3. **Products.jsx** - Listado de Productos
**Patrones a usar:**
- `layout.containerWide`, `layout.grid3Col`
- `cards.interactive`
- `products.image`, `products.name`, `products.price`
- `badges.success`, `badges.warning`
- `buttons.primary`

### 4. **ProductDetail.jsx** - Detalle de Producto
**Patrones a usar:**
- `layout.container`, `layout.grid2Col`
- `products.imageXl`
- `text.pageTitle`
- `buttons.primary`, `buttons.secondary`
- `alerts.info`

### 5. **Orders.jsx** - Mis Pedidos
**Patrones a usar:**
- `layout.container`
- `cards.bordered`
- `text.sectionTitle`
- `badges` (para estados)
- `buttons.outline`

---

## 🔧 Patrón de Migración

### **ANTES:**
```jsx
export default function Cart() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-6">Mi Carrito</h1>
            
            <div className="border border-gray-300 p-6">
                <h2 className="text-sm font-bold uppercase mb-4 pb-2 border-b border-gray-300">
                    PRODUCTOS
                </h2>
                
                {items.map(item => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                        <img src={item.image} className="w-20 h-20 object-cover" />
                        <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                        </div>
                        <p className="font-medium">${item.price}</p>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 flex justify-between items-center">
                <button className="px-6 py-3 border-2 border-black hover:bg-black hover:text-white">
                    Seguir comprando
                </button>
                <button className="px-6 py-3 bg-black text-white hover:bg-gray-800">
                    Finalizar compra
                </button>
            </div>
        </div>
    );
}
```

### **DESPUÉS:**
```jsx
import { layout, text, cards, products, buttons } from '@/styles';

export default function Cart() {
    return (
        <div className={layout.container}>
            <h1 className={text.pageTitle}>Mi Carrito</h1>
            
            <div className={cards.bordered}>
                <h2 className={text.sectionTitle}>
                    PRODUCTOS
                </h2>
                
                {items.map(item => (
                    <div key={item.id} className={products.item}>
                        <img src={item.image} className={products.image} />
                        <div className="flex-1">
                            <p className={products.name}>{item.name}</p>
                            <p className={products.meta}>SKU: {item.sku}</p>
                        </div>
                        <p className={text.value}>${item.price}</p>
                    </div>
                ))}
            </div>
            
            <div className={`mt-6 ${layout.flexBetweenCenter}`}>
                <button className={buttons.secondary}>
                    Seguir comprando
                </button>
                <button className={buttons.primary}>
                    Finalizar compra
                </button>
            </div>
        </div>
    );
}
```

---

## 📝 Tabla de Reemplazo Rápido

| Clase de Tailwind Original | Patrón Modular |
|---------------------------|----------------|
| `max-w-4xl mx-auto px-4 py-12` | `layout.container` |
| `max-w-2xl mx-auto px-4 py-8` | `layout.containerNarrow` |
| `text-3xl font-bold tracking-tight` | `text.pageTitle` |
| `text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300` | `text.sectionTitle` |
| `border border-gray-300 p-6` | `cards.bordered` |
| `bg-gray-50 border border-gray-300 p-6` | `cards.background` |
| `px-6 py-3 bg-black text-white font-medium hover:bg-gray-800` | `buttons.primary` |
| `px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white` | `buttons.secondary` |
| `text-xs uppercase tracking-wider text-gray-500 mb-1` | `text.label` |
| `font-medium` | `text.value` |
| `text-sm text-gray-600` | `text.muted` |
| `flex justify-between` | `layout.flexBetween` |
| `space-y-4` | `layout.stackMd` |
| `w-20 h-20 object-cover bg-gray-100` | `products.image` |
| `font-medium text-base mb-1` | `products.name` |
| `text-sm text-gray-500` | `products.meta` |
| `bg-green-50 border border-green-200 p-4 rounded` | `alerts.success` |
| `text-sm text-green-800 font-medium` | `alerts.successText` |

---

## ⚡ Script de Reemplazo (Uso Manual)

Para acelerar la migración, busca y reemplaza estos patrones comunes:

```javascript
// Buscar:
className="max-w-4xl mx-auto px-4 py-12"
// Reemplazar:
className={layout.container}

// Buscar:
className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b border-gray-300"
// Reemplazar:
className={text.sectionTitle}

// Buscar:
className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
// Reemplazar:
className={buttons.primary}

// Buscar:
className="border border-gray-300 p-6"
// Reemplazar:
className={cards.bordered}
```

---

## ✅ Ejemplo Completo: Migrar Cart.jsx

### Paso 1: Agregar Imports
```jsx
import { layout, text, cards, products, buttons } from '@/styles';
import { orderSummary } from '@/styles/components';
```

### Paso 2: Container Principal
```jsx
// Antes:
<div className="max-w-4xl mx-auto px-4 py-12">

// Después:
<div className={layout.container}>
```

### Paso 3: Títulos
```jsx
// Antes:
<h1 className="text-3xl font-bold mb-6">Mi Carrito</h1>
<h2 className="text-sm font-bold uppercase mb-4 pb-2 border-b border-gray-300">
  PRODUCTOS
</h2>

// Después:
<h1 className={text.pageTitle}>Mi Carrito</h1>
<h2 className={text.sectionTitle}>PRODUCTOS</h2>
```

### Paso 4: Cards
```jsx
// Antes:
<div className="border border-gray-300 p-6">

// Después:
<div className={cards.bordered}>
```

### Paso 5: Items de Producto
```jsx
// Antes:
<div className="flex gap-4 pb-4 border-b border-gray-200">
  <img className="w-20 h-20 object-cover" />
  <p className="font-medium text-base">{name}</p>
  <p className="text-sm text-gray-500">SKU: {sku}</p>
</div>

// Después:
<div className={products.item}>
  <img className={products.image} />
  <p className={products.name}>{name}</p>
  <p className={products.meta}>SKU: {sku}</p>
</div>
```

### Paso 6: Resumen
```jsx
// Antes:
<div className="space-y-3 text-sm">
  <div className="flex justify-between">
    <span className="text-gray-600">Subtotal</span>
    <span className="font-medium">$15,000</span>
  </div>
  <div className="border-t border-gray-300 pt-3">
    <div className="flex justify-between text-base">
      <span className="font-bold">Total</span>
      <span className="font-bold">$17,500</span>
    </div>
  </div>
</div>

// Después:
<div className={orderSummary.container}>
  <div className={orderSummary.row}>
    <span className={orderSummary.label}>Subtotal</span>
    <span className={orderSummary.value}>$15,000</span>
  </div>
  <div className={orderSummary.divider}>
    <div className={orderSummary.total}>
      <span className={orderSummary.totalLabel}>Total</span>
      <span className={orderSummary.totalValue}>$17,500</span>
    </div>
  </div>
</div>
```

### Paso 7: Botones
```jsx
// Antes:
<button className="px-6 py-3 border-2 border-black text-black font-medium hover:bg-black hover:text-white">
  Volver
</button>
<button className="px-6 py-3 bg-black text-white font-medium hover:bg-gray-800">
  Continuar
</button>

// Después:
<button className={buttons.secondary}>
  Volver
</button>
<button className={buttons.primary}>
  Continuar
</button>
```

---

## 🚀 Próximos Pasos

1. **Empezar con OrderConfirmation.jsx** ✅ (Ya migrado - usar como referencia)
2. **Migrar Cart.jsx** (Más simple, buen siguiente paso)
3. **Migrar Orders.jsx** (Similar a Cart)
4. **Migrar Checkout.jsx** (Más complejo, requiere inputs)
5. **Migrar Products.jsx** (Grid de productos)
6. **Migrar ProductDetail.jsx** (Layout 2 columnas)

---

## 💡 Tips

- ✅ **Probar después de cada cambio** - No migres todo de golpe
- ✅ **Usar Git** - Commitea después de migrar cada componente
- ✅ **Revisar visualmente** - El diseño debe verse idéntico
- ✅ **Combinar patrones** - Ejemplo: `${cards.bordered} ${layout.stackMd}`
- ✅ **Mantener clases custom** - Si un componente necesita algo único, dejalo inline

---

¿Listo para empezar? Probá migrando **Cart.jsx** primero! 🚀
