# 🎨 Design System - LOLA COLLECTION

## Filosofía de Diseño

**Minimalista • Cálido • Profesional • Sofisticado**

Nuestro sistema de diseño se centra en crear una experiencia visual limpia y elegante, utilizando tonos cálidos y neutros que transmiten confianza y sofisticación sin ser fríos o impersonales.

---

## 🌈 Paleta de Colores

### Colores Principales

#### Warm Beige (Color Primario de Fondo)
- **warm-50**: `#fdf9f3` - Fondo principal cálido
- **warm-100**: `#f8f3e8` - Variante más oscura
- **warm-200**: `#f0e6d5` - Acentos

**Uso**: Fondos de página, cards, secciones destacadas. Aporta calidez sin ser intrusivo.

#### Grises Neutros
- **gray-900**: `#111827` - Textos principales
- **gray-800**: `#1f2937` - Textos secundarios
- **gray-600**: `#4b5563` - Textos terciarios
- **gray-400**: `#9ca3af` - Texto deshabilitado
- **gray-200**: `#e5e7eb` - Bordes sutiles
- **gray-100**: `#f3f4f6` - Fondos secundarios

#### Acentos
- **Black**: `#000000` - Botones primarios, énfasis
- **White**: `#ffffff` - Fondos de cards, contraste

---

## 📐 Espaciado y Tipografía

### Espaciado
- **xs**: `0.25rem` (4px)
- **sm**: `0.5rem` (8px)
- **md**: `1rem` (16px)
- **lg**: `1.5rem` (24px)
- **xl**: `2rem` (32px)

### Tipografía
- **Font Family**: Yantramanav (sans-serif)
- **Tamaños**:
  - Heading 1: `2.5rem` (40px)
  - Heading 2: `2rem` (32px)
  - Heading 3: `1.5rem` (24px)
  - Body: `1rem` (16px)
  - Small: `0.875rem` (14px)
  - Tiny: `0.75rem` (12px)

---

## 🧩 Componentes

### Botones
```jsx
// Primario - Para acciones principales
<button className={buttons.primary}>Comprar Ahora</button>

// Secundario - Para acciones secundarias
<button className={buttons.secondary}>Ver Más</button>

// Outline - Para acciones terciarias
<button className={buttons.outline}>Cancelar</button>
```

**Características**:
- Bordes redondeados (`rounded-lg`)
- Sombras sutiles en hover
- Fondo cálido en hover para botones outline/secondary
- Transiciones suaves

### Cards
```jsx
// Card con fondo cálido
<div className={cards.background}>...</div>

// Card con borde
<div className={cards.bordered}>...</div>

// Card con sombra (interactiva)
<div className={cards.shadow}>...</div>
```

**Características**:
- Fondos `warm-50` para calidez
- Bordes sutiles `border-gray-200`
- Sombras delicadas que crecen en hover

### Inputs
```jsx
// Input de texto
<input className={inputs.text} />

// Textarea
<textarea className={inputs.textarea} />

// Select
<select className={inputs.select} />
```

**Características**:
- Bordes `border-gray-200` (muy sutiles)
- Focus con `border-gray-400` (sin saltos bruscos)
- Fondo blanco con transición suave
- Bordes redondeados `rounded-lg`

---

## 🎯 Principios de Uso

### 1. **Jerarquía Visual**
- Usar `gray-900` para títulos principales
- `gray-700` para subtítulos
- `gray-600` para textos secundarios
- `gray-400` para metadata

### 2. **Consistencia en Bordes**
- Preferir `border-gray-200` para bordes sutiles
- `border-gray-300` solo para elementos que necesitan más énfasis
- Evitar bordes negros excepto en estados activos

### 3. **Uso del Color Cálido**
- Fondos principales: `bg-warm-50`
- Hover states: `hover:bg-warm-50`
- Cards destacadas: `bg-warm-50`
- Footer de product cards: `bg-warm-50/50` (con opacidad)

### 4. **Sombras**
- Usar sombras sutiles: `shadow-sm`
- En hover: `shadow-md`
- Evitar `shadow-lg` excepto en modales

### 5. **Transiciones**
- Todas las interacciones con `transition-all` o `transition-colors`
- Duración por defecto (200-300ms)
- Hover states suaves y predecibles

---

## ✨ Ejemplos de Implementación

### Product Card
```jsx
<div className={products.productCard}>
  {/* Imagen con fondo cálido */}
  <div className={products.productCardImageWrap}>
    <img className={products.productCardImage} src="..." />
  </div>
  
  {/* Cuerpo con fondo blanco */}
  <div className={products.productCardBody}>
    <p className={products.productCardCategory}>Remeras</p>
    <h3 className={products.productCardName}>Producto</h3>
  </div>
  
  {/* Footer con fondo cálido sutil */}
  <div className={products.productCardFooter}>
    <p className={products.productCardTransferPrice}>$10,000</p>
  </div>
</div>
```

### Navbar
- Fondo: `bg-white/98` con `backdrop-blur-sm`
- Borde: `border-gray-200` (sutil)
- Links: `text-gray-600` → `hover:text-gray-900`
- Mobile menu: fondo `hover:bg-warm-50`

---

## 🚀 Próximos Pasos

1. **Implementar iconografía consistente** (Lucide React)
2. **Definir animaciones micro** (fade, slide, scale)
3. **Crear variantes de estado** (loading, success, error)
4. **Documentar patrones de layout** (grid, flex, spacing)

---

## 📝 Notas

- **No usar colores puros** (negro puro, blanco puro) excepto en casos específicos
- **Preferir opacidades** para crear variaciones (`/50`, `/70`, `/90`)
- **Mantener consistencia** en bordes redondeados (usar `rounded-lg` como estándar)
- **Evitar degradados** excepto en casos muy específicos
- **Usar backdrop-blur** para overlays y navbar

---

**Última actualización**: Noviembre 2025
**Mantenido por**: Equipo de Desarrollo LOLA
