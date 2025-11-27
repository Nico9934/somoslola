# 🎨 Guía de Estilos Minimalistas - SomosLola

## Sistema de Diseño

Este archivo contiene clases CSS reutilizables para mantener consistencia en todo el sitio.

---

## 📦 Layout

```jsx
// Contenedor de página estándar
<div className="page-container">
  {/* Máximo 1024px, centrado */}
</div>

// Contenedor ancho (productos, galerías)
<div className="page-container-wide">
  {/* Máximo 1280px */}
</div>

// Contenedor estrecho (formularios)
<div className="page-container-narrow">
  {/* Máximo 640px */}
</div>
```

---

## 📝 Headers & Títulos

```jsx
// Header de página completo
<div className="page-header">
  <h1 className="page-title">Título Principal</h1>
  <p className="page-subtitle">Descripción breve</p>
</div>

// Títulos de sección
<h2 className="section-title">Productos</h2>
```

---

## 🔘 Botones

```jsx
// Primario (negro con texto blanco)
<button className="btn-primary">
  Confirmar pedido
</button>

// Secundario (borde negro, fondo blanco)
<button className="btn-secondary">
  Cancelar
</button>

// Outline sutil
<button className="btn-outline">
  Ver más
</button>

// Tamaños
<button className="btn-primary btn-sm">Pequeño</button>
<button className="btn-primary">Normal</button>
<button className="btn-primary btn-lg">Grande</button>
```

---

## 📦 Cards

```jsx
// Card minimalista (borde simple)
<div className="card-minimal">
  <h3>Título</h3>
  <p>Contenido...</p>
</div>

// Card con fondo gris
<div className="card-subtle">
  <h3>Información</h3>
</div>

// Card destacada (borde doble negro)
<div className="card-highlight">
  <h3>Importante</h3>
</div>
```

---

## 📋 Grids

```jsx
// Grid 2/3 - 1/3 (OrderConfirmation)
<div className="grid-2-1">
  <div className="grid-2-1-main">
    {/* Contenido principal */}
  </div>
  <div className="grid-2-1-sidebar">
    {/* Sidebar */}
  </div>
</div>

// Grid de 2 columnas
<div className="grid-2">
  <div>Columna 1</div>
  <div>Columna 2</div>
</div>

// Grid de 3 columnas
<div className="grid-3">
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</div>
```

---

## 🖼️ Productos

```jsx
// Item de producto
<div className="product-item">
  <img src="..." className="product-image" />
  <div className="flex-1">
    <p className="font-medium">Producto</p>
    <p className="text-muted">Descripción</p>
  </div>
  <div>
    <p className="price-md">$1,200</p>
  </div>
</div>

// Imágenes
<img className="product-image" /> {/* 80x80px */}
<img className="product-image-lg" /> {/* 128x128px */}
```

---

## 📝 Inputs & Forms

```jsx
// Input minimalista
<div className="form-group">
  <label className="label-minimal">Nombre</label>
  <input 
    type="text" 
    className="input-minimal"
    placeholder="Juan Pérez"
  />
  <p className="form-hint">Ingresá tu nombre completo</p>
</div>

// Con error
<input className="input-minimal input-error" />
<p className="form-error">Este campo es requerido</p>

// Checkbox/Radio
<input type="checkbox" className="checkbox-minimal" />
<input type="radio" className="radio-minimal" />
```

---

## 📤 File Upload

```jsx
<input 
  type="file" 
  id="upload" 
  className="hidden" 
  onChange={handleUpload}
/>
<label htmlFor="upload" className="upload-area">
  <p>Hacé click para seleccionar archivo</p>
  <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
</label>
```

---

## 🏷️ Badges & Alerts

```jsx
// Badges
<span className="badge badge-pending">Pendiente</span>
<span className="badge badge-success">Completado</span>
<span className="badge badge-error">Cancelado</span>
<span className="badge badge-info">En progreso</span>

// Alerts
<div className="alert-success">
  <p className="font-medium">✅ Operación exitosa</p>
  <p>Tu pedido fue creado correctamente.</p>
</div>

<div className="alert-error">❌ Error al procesar</div>
<div className="alert-warning">⚠️ Revisa los datos</div>
<div className="alert-info">ℹ️ Información importante</div>
```

---

## 💲 Precios

```jsx
<p className="price-lg">$12,500</p>  {/* Grande */}
<p className="price-md">$12,500</p>  {/* Mediano */}
<p className="price-sm">$12,500</p>  {/* Pequeño */}
```

---

## 📊 Info Boxes

```jsx
// Box de información
<div className="info-box">
  <div className="info-row">
    <div className="info-item">
      <p className="text-label">CBU</p>
      <p className="text-value">0000003100012345678901</p>
    </div>
    <div className="info-item">
      <p className="text-label">Alias</p>
      <p className="text-value">HEADD.CLUB</p>
    </div>
  </div>
</div>

// Box destacado
<div className="info-box-highlight">
  <p className="text-label">Estado</p>
  <p className="text-value">En espera de pago</p>
</div>
```

---

## 🔗 Links

```jsx
// Link con underline
<a href="#" className="link-minimal">
  Contactanos
</a>

// Link sutil
<a href="#" className="link-subtle">
  Ver términos
</a>
```

---

## ➗ Dividers

```jsx
<div className="divider" />        {/* Gris normal */}
<div className="divider-dark" />   {/* Negro grueso */}
<div className="divider-light" />  {/* Gris claro */}
```

---

## 📱 Responsive

```jsx
// Solo móvil
<div className="mobile-only">
  Menú hamburguesa
</div>

// Solo desktop
<div className="desktop-only">
  Menú completo
</div>
```

---

## 🎭 Modales

```jsx
<div className="modal-overlay">
  <div className="modal-content">
    <div className="modal-header">
      <h2>Título del Modal</h2>
    </div>
    <div className="modal-body">
      <p>Contenido...</p>
    </div>
    <div className="modal-footer">
      <button className="btn-secondary">Cancelar</button>
      <button className="btn-primary">Confirmar</button>
    </div>
  </div>
</div>
```

---

## 📍 Breadcrumbs

```jsx
<nav className="breadcrumb">
  <a href="/">Inicio</a>
  <span className="breadcrumb-separator">/</span>
  <a href="/products">Productos</a>
  <span className="breadcrumb-separator">/</span>
  <span className="breadcrumb-active">Detalle</span>
</nav>
```

---

## 🔢 Paginación

```jsx
<div className="pagination">
  <button className="pagination-btn">Anterior</button>
  <button className="pagination-btn pagination-btn-active">1</button>
  <button className="pagination-btn">2</button>
  <button className="pagination-btn">3</button>
  <button className="pagination-btn">Siguiente</button>
</div>
```

---

## 📋 Tablas

```jsx
<table className="table-minimal">
  <thead>
    <tr>
      <th>Producto</th>
      <th>Cantidad</th>
      <th>Precio</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Remera Basic</td>
      <td>2</td>
      <td>$5,000</td>
    </tr>
  </tbody>
</table>
```

---

## 🎨 Paleta de Colores

- **Primary**: `black` (#000000)
- **Background**: `white` (#FFFFFF)
- **Borders**: `gray-300` (#D1D5DB)
- **Text Primary**: `black` (#000000)
- **Text Muted**: `gray-600` (#4B5563)
- **Success**: `green-800` + `green-50` bg
- **Error**: `red-800` + `red-50` bg
- **Warning**: `yellow-800` + `yellow-50` bg
- **Info**: `blue-800` + `blue-50` bg

---

## ✅ Ejemplos de Uso Completo

### Página de Producto

```jsx
<div className="page-container">
  <div className="page-header">
    <h1 className="page-title">Remera Oversized</h1>
    <p className="page-subtitle">Colección Primavera 2025</p>
  </div>

  <div className="grid-2-1">
    <div className="grid-2-1-main">
      <img src="..." className="w-full" />
      
      <div className="section-spacing">
        <h2 className="section-title">Descripción</h2>
        <p className="text-muted">Lorem ipsum...</p>
      </div>
    </div>

    <div className="grid-2-1-sidebar">
      <div className="card-minimal">
        <p className="price-lg">$8,500</p>
        <button className="btn-primary w-full mt-4">
          Agregar al carrito
        </button>
      </div>
    </div>
  </div>
</div>
```

### Formulario de Checkout

```jsx
<div className="page-container-narrow">
  <div className="page-header">
    <h1 className="page-title">Finalizar compra</h1>
  </div>

  <form className="section-spacing">
    <div className="form-group">
      <label className="label-minimal">Email</label>
      <input 
        type="email" 
        className="input-minimal"
        placeholder="tu@email.com"
      />
    </div>

    <div className="form-group">
      <label className="label-minimal">Teléfono</label>
      <input 
        type="tel" 
        className="input-minimal"
      />
      <p className="form-hint">Para coordinar la entrega</p>
    </div>

    <div className="divider" />

    <button type="submit" className="btn-primary w-full">
      Confirmar pedido
    </button>
  </form>
</div>
```

---

## 🚀 Tips de Uso

1. **Combinar clases**: Podés agregar utilidades de Tailwind a las clases base
   ```jsx
   <button className="btn-primary mt-4 w-full">
     Botón
   </button>
   ```

2. **Spacing**: Usá las clases de spacing para separación vertical
   - `section-spacing` → `space-y-6`
   - `content-spacing` → `space-y-4`
   - `tight-spacing` → `space-y-2`

3. **Responsive**: Las grids ya son responsive. En mobile se apilan automáticamente.

4. **Hover states**: Muchas clases ya tienen hover incluido (botones, links, etc.)

5. **Consistency**: Usá siempre el mismo conjunto de clases para elementos similares.

---

## 📦 Próximos pasos

Para aplicar estos estilos en el resto del sitio:

1. Reemplazar botones genéricos por `btn-primary` / `btn-secondary`
2. Usar `page-container` en todas las páginas
3. Unificar cards con `card-minimal` / `card-subtle`
4. Aplicar `section-title` en todos los headings de sección
5. Usar grids predefinidos (`grid-2`, `grid-3`) en lugar de grids custom

**Resultado**: Sitio completo con diseño minimalista y consistente 🎨✨
