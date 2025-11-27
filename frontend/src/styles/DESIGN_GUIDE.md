# 🎨 Sistema de Diseño Minimalista con Tailwind

Sistema de estilos modular y reutilizable extraído del diseño de `OrderConfirmation.jsx`.

## 📦 Estructura del Sistema

```
styles/
├── index.js                    # Exporta todo el sistema
├── states.js                   # Estados (loading, disabled, etc)
├── patterns/                   # Patrones básicos
│   ├── buttons.js
│   ├── cards.js
│   ├── inputs.js
│   ├── layout.js
│   ├── text.js
│   ├── alerts.js
│   ├── products.js
│   ├── upload.js
│   ├── badges.js
│   └── icons.js
└── components/                 # Componentes compuestos
    ├── orderSummary.js
    ├── successHeader.js
    ├── infoCard.js
    └── actionFooter.js
```

## 🚀 Instalación

```javascript
// Importar patrones individuales
import { buttons, layout, text, cards } from '@/styles';

// Importar componentes compuestos
import { orderSummary, successHeader, actionFooter } from '@/styles/components';

// Importar estados
import { states } from '@/styles';

// O importar todo junto
import { 
  buttons, 
  layout, 
  text, 
  cards, 
  orderSummary, 
  states 
} from '@/styles';
```

---

## 🎯 Guía Rápida por Módulo

### **🔘 Buttons** (`patterns/buttons.js`)

```jsx
import { buttons } from '@/styles';

// Primario (Negro sólido)
<button className={buttons.primary}>
  Confirmar pedido
</button>

// Secundario (Borde negro)
<button className={buttons.secondary}>
  Cancelar
</button>

// Outline (Borde gris)
<button className={buttons.outline}>
  Ver más
</button>

// Link
<a className={buttons.link}>
  Contactanos
</a>

// Con tamaños
<button className={`${buttons.primary} ${buttons.lg}`}>
  Grande
</button>
```

### **📦 Cards** (`patterns/cards.js`)

```jsx
import { cards } from '@/styles';

// Card con borde
<div className={cards.bordered}>
  <h3>Título</h3>
  <p>Contenido...</p>
</div>

// Card con fondo gris
<div className={cards.background}>
  <p>Información importante</p>
</div>

// Card con borde punteado (para dropzones)
<label className={cards.dashed}>
  <input type="file" className="hidden" />
  Arrastrá archivos aquí
</label>

// Card interactiva (clickeable)
<div className={cards.interactive}>
  Click me
</div>
```

### **📐 Layout** (`patterns/layout.js`)

```jsx
import { layout } from '@/styles';

// Contenedores
<div className={layout.container}>        {/* max-w-4xl */}
<div className={layout.containerNarrow}> {/* max-w-2xl */}
<div className={layout.containerWide}>   {/* max-w-6xl */}

// Grid 2 columnas (main + sidebar)
<div className={layout.grid2Col}>
  <div className={layout.gridMain}>      {/* 2/3 */}
    Contenido principal
  </div>
  <div className={layout.gridSidebar}>   {/* 1/3 */}
    Sidebar
  </div>
</div>

// Grid 3 columnas
<div className={layout.grid3Col}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Flexbox
<div className={layout.flexBetween}>
  <span>Izquierda</span>
  <span>Derecha</span>
</div>

// Spacing vertical
<div className={layout.stack}>       {/* space-y-3 */}
<div className={layout.stackMd}>     {/* space-y-4 */}
<div className={layout.stackLg}>     {/* space-y-6 */}

// Divisores
<div className={layout.divider}>     {/* border-t + pt-3 */}
<div className={layout.dividerSection}> {/* mt-12 pt-8 border-t */}
```

### **✍️ Text** (`patterns/text.js`)

```jsx
import { text } from '@/styles';

// Headers de página
<div className={text.pageHeader}>
  <h1 className={text.pageTitle}>Título Principal</h1>
  <p className={text.pageSubtitle}>Subtítulo descriptivo</p>
  <p className={text.pageDescription}>Descripción adicional</p>
</div>

// Títulos de sección
<h2 className={text.sectionTitle}>PRODUCTOS</h2>

// Labels y valores
<div>
  <p className={text.label}>NOMBRE</p>
  <p className={text.value}>Juan Pérez</p>
</div>

<div>
  <p className={text.label}>CBU</p>
  <p className={text.valueMono}>0000003100012345678901</p>
</div>

// Texto muted
<p className={text.muted}>Texto secundario</p>
<p className={text.mutedXs}>Texto pequeño</p>
<p className={text.mutedLeading}>Texto con line-height aumentado</p>
```

### **⚠️ Alerts** (`patterns/alerts.js`)

```jsx
import { alerts } from '@/styles';

// Success
<div className={alerts.success}>
  <p className={alerts.successText}>
    ✅ Operación exitosa
  </p>
</div>

// Info
<div className={alerts.info}>
  <p className={alerts.infoText}>
    💡 Información importante
  </p>
</div>

// Warning
<div className={alerts.warning}>
  <p className={alerts.warningText}>
    ⚠️ Advertencia
  </p>
</div>

// Error
<div className={alerts.error}>
  <p className={alerts.errorText}>
    ❌ Error en la operación
  </p>
</div>
```

### **🛍️ Products** (`patterns/products.js`)

```jsx
import { products } from '@/styles';

// Item de producto
<div className={products.item}>
  <img src={url} className={products.image} />
  <div>
    <p className={products.name}>Nombre del producto</p>
    <p className={products.meta}>SKU: ABC123</p>
    <p className={products.meta}>Cantidad: 2</p>
  </div>
  <p className={products.price}>$15,000</p>
</div>

// Badges de stock
<span className={products.inStock}>En stock</span>
<span className={products.outOfStock}>Sin stock</span>
<span className={products.lowStock}>Poco stock</span>
```

### **📤 Upload** (`patterns/upload.js`)

```jsx
import { upload } from '@/styles';

<input type="file" id="file" className="hidden" />
<label htmlFor="file" className={upload.zone}>
  <svg className={upload.icon}>...</svg>
  <p className={upload.text}>
    <span className={upload.textHighlight}>Click para seleccionar</span>
    o arrastrá aquí
  </p>
  <p className={upload.textHint}>PNG, JPG hasta 5MB</p>
</label>

// Preview
<img src={url} className={upload.preview} />
```

### **📝 Inputs** (`patterns/inputs.js`)

```jsx
import { inputs } from '@/styles';

// Input de texto
<div className={inputs.group}>
  <label className={inputs.label}>NOMBRE</label>
  <input type="text" className={inputs.text} />
</div>

// Input con error
<input type="email" className={inputs.error} />

// Textarea
<textarea className={inputs.textarea}></textarea>

// Select
<select className={inputs.select}>
  <option>Opción 1</option>
</select>
```

---

## 🧩 Componentes Compuestos

### **📊 Order Summary** (`components/orderSummary.js`)

```jsx
import { orderSummary } from '@/styles/components';

<div>
  <h2 className={text.sectionTitle}>RESUMEN</h2>
  <div className={orderSummary.container}>
    <div className={orderSummary.row}>
      <span className={orderSummary.label}>Subtotal</span>
      <span className={orderSummary.value}>$15,000</span>
    </div>
    <div className={orderSummary.row}>
      <span className={orderSummary.label}>Envío</span>
      <span className={orderSummary.value}>$2,500</span>
    </div>
    <div className={orderSummary.divider}>
      <div className={orderSummary.total}>
        <span className={orderSummary.totalLabel}>Total</span>
        <span className={orderSummary.totalValue}>$17,500</span>
      </div>
    </div>
  </div>
</div>
```

### **✅ Success Header** (`components/successHeader.js`)

```jsx
import { successHeader } from '@/styles/components';
import { icons } from '@/styles';

<div className={successHeader.container}>
  <div className={successHeader.iconWrapper}>
    <div className={successHeader.icon}>
      <svg className={icons.check}>
        <path d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h1 className={successHeader.title}>
      ¡Pedido confirmado!
    </h1>
  </div>
  <p className={successHeader.subtitle}>
    Gracias por tu compra
  </p>
  <p className={successHeader.meta}>
    Orden #12345
  </p>
</div>
```

### **🦶 Action Footer** (`components/actionFooter.js`)

```jsx
import { actionFooter } from '@/styles/components';
import { buttons } from '@/styles';

<div className={actionFooter.container}>
  <div className={actionFooter.buttons}>
    <button className={buttons.secondary}>
      Volver
    </button>
    <button className={buttons.primary}>
      Continuar
    </button>
  </div>
  <div className={actionFooter.help}>
    <p>
      ¿Ayuda? <a className={buttons.link}>Contactanos</a>
    </p>
  </div>
</div>
```

---

## 🎭 Estados Condicionales (`states.js`)

```jsx
import { states } from '@/styles';
import { buttons } from '@/styles';

// Loading
<button 
  className={`${buttons.primary} ${loading ? states.loading : ''}`}
  disabled={loading}
>
  {loading ? 'Procesando...' : 'Confirmar'}
</button>

// Disabled
<button 
  className={`${buttons.primary} ${disabled ? states.disabled : ''}`}
  disabled={disabled}
>
  No disponible
</button>

// Active/Selected
<button 
  className={`${buttons.secondary} ${isActive ? states.active : ''}`}
>
  Opción
</button>

// Focus
<input className={`${inputs.text} ${states.focus}`} />
```

---

## 💡 Ejemplo Completo: OrderConfirmation.jsx

```jsx
import { 
  layout, 
  text, 
  cards, 
  buttons, 
  alerts, 
  products,
  upload 
} from '@/styles';

import { 
  successHeader, 
  orderSummary, 
  actionFooter 
} from '@/styles/components';

export default function OrderConfirmation() {
  return (
    <Layout>
      <div className={layout.container}>
        {/* Header */}
        <div className={successHeader.container}>
          <div className={successHeader.iconWrapper}>
            <div className={successHeader.icon}>✓</div>
            <h1 className={successHeader.title}>Pedido confirmado</h1>
          </div>
          <p className={successHeader.subtitle}>Gracias por tu compra</p>
        </div>

        {/* Grid */}
        <div className={layout.grid2Col}>
          {/* Main */}
          <div className={layout.gridMain}>
            {/* Productos */}
            <div>
              <h2 className={text.sectionTitle}>PRODUCTOS</h2>
              <div className={layout.stackMd}>
                {items.map(item => (
                  <div key={item.id} className={products.item}>
                    <img src={item.img} className={products.image} />
                    <div>
                      <p className={products.name}>{item.name}</p>
                      <p className={products.meta}>SKU: {item.sku}</p>
                    </div>
                    <p className={text.value}>${item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={layout.gridSidebar}>
            {/* Resumen */}
            <div>
              <h2 className={text.sectionTitle}>RESUMEN</h2>
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={actionFooter.container}>
          <div className={actionFooter.buttons}>
            <button className={buttons.secondary}>Volver</button>
            <button className={buttons.primary}>Ver pedidos</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

## 🎨 Paleta de Colores

- **Negro**: `#000000` - Botones primarios, bordes, títulos
- **Gris 800**: `#1f2937` - Hover en botones primarios
- **Gris 600**: `#4b5563` - Texto secundario
- **Gris 500**: `#6b7280` - Labels
- **Gris 300**: `#d1d5db` - Bordes
- **Gris 200**: `#e5e7eb` - Bordes suaves
- **Gris 100**: `#f3f4f6` - Fondos de imagen
- **Gris 50**: `#f9fafb` - Fondos de card

- **Verde 800**: `#166534` - Texto de éxito
- **Verde 200**: `#bbf7d0` - Borde de éxito
- **Verde 50**: `#f0fdf4` - Fondo de éxito

- **Azul 900**: `#1e3a8a` - Texto de info
- **Azul 200**: `#bfdbfe` - Borde de info
- **Azul 50**: `#eff6ff` - Fondo de info

---

## 📐 Espaciado

- **stackSm**: `space-y-2` (0.5rem / 8px)
- **stack**: `space-y-3` (0.75rem / 12px)
- **stackMd**: `space-y-4` (1rem / 16px)
- **stackLg**: `space-y-6` (1.5rem / 24px)

---

## 💡 Tips

1. **Combinar patrones**: Los patrones están diseñados para combinarse
   ```jsx
   <div className={`${patterns.cardBordered} ${patterns.stackMd}`}>
   ```

2. **Responsive**: Los patrones ya incluyen clases responsive
   ```jsx
   grid2Col → "grid grid-cols-1 lg:grid-cols-3"
   ```

3. **Consistencia**: Usa siempre los mismos patrones para mantener coherencia visual

4. **Personalización**: Si necesitás ajustar, agregá clases de Tailwind:
   ```jsx
   <div className={`${patterns.cardBordered} mt-8 shadow-lg`}>
   ```

---

## 🚀 Próximos Pasos

Para aplicar este diseño en otros componentes:

1. **Products.jsx** → Usar `patterns.productItem`, `patterns.productImage`
2. **Cart.jsx** → Usar `patterns.orderSummary`, `patterns.btnPrimary`
3. **Checkout.jsx** → Usar `patterns.input`, `patterns.cardBordered`
4. **Admin panels** → Usar `patterns.sectionTitle`, `patterns.cardBackground`

---

¿Necesitás más ejemplos? Revisá `OrderConfirmation.jsx` para ver el diseño completo en acción.
