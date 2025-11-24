# 📚 Documentación del Sistema de Productos con Variantes

## 🎯 Resumen

Este sistema permite crear productos con **variantes dinámicas** basadas en atributos configurables (Color, Talle, Material, etc.). Todo el proceso se realiza en **un solo formulario unificado** para facilitar la creación y edición.

---

## 📊 Estructura de la Base de Datos

### Modelo de Datos

```
Product (Producto básico)
├── name: string
├── description: string
├── categoryId: integer
│
├─── ProductVariant[] (Variantes del producto)
│    ├── sku: string (único)
│    ├── salePrice: float (precio de venta - obligatorio)
│    ├── promotionPrice: float (precio promocional - opcional)
│    ├── cost: float (costo del producto - opcional)
│    ├── isActive: boolean
│    │
│    ├─── Stock (uno a uno)
│    │    ├── quantity: integer (stock total)
│    │    ├── reservedQty: integer (reservado en carritos)
│    │    └── lowStockAlert: integer
│    │
│    └─── VariantAttributeValue[] (N:M con AttributeValue)
│         ├── attributeId: integer
│         └── attributeValueId: integer
│
└─── ProductAttribute[] (N:M con Attribute)
     └── attributeId: integer

Attribute (Atributo dinámico)
├── name: string ("Color", "Talle", etc.)
├── slug: string ("color", "talle")
├── type: enum (SELECT, NUMBER, TEXT)
├── unit: string (opcional: "cm", "kg", etc.)
│
└─── AttributeValue[]
     ├── value: string ("Rojo", "M", "Algodón")
     ├── hexColor: string (solo para colores)
     └── sortOrder: integer
```

### Relaciones Clave

1. **Product → ProductVariant**: Un producto puede tener muchas variantes
2. **ProductVariant → Stock**: Cada variante tiene su propio stock (1:1)
3. **ProductVariant → VariantAttributeValue**: Una variante puede tener múltiples atributos
4. **Product → ProductAttribute**: Define qué atributos usa el producto
5. **Attribute → AttributeValue**: Un atributo tiene múltiples valores posibles

---

## 🔄 Flujo de Creación de Producto

### 1️⃣ Usuario completa datos básicos

```javascript
{
  name: "Remera Oversize Premium",
  description: "Remera de algodón premium...",
  categoryId: 2
}
```

### 2️⃣ Selecciona atributos y valores

El usuario marca los valores que desea usar:

```javascript
selectedValues = {
  1: [1, 2, 3],    // Color: [Rojo, Azul, Negro]
  2: [4, 5]        // Talle: [M, L]
}
```

### 3️⃣ Click en "Generar Variantes"

El sistema calcula **todas las combinaciones posibles**:

```
Color: Rojo, Azul, Negro (3 opciones)
Talle: M, L (2 opciones)

Total: 3 × 2 = 6 variantes
```

Combinaciones generadas:
```
1. Rojo + M
2. Rojo + L
3. Azul + M
4. Azul + L
5. Negro + M
6. Negro + L
```

### 4️⃣ SKU Automático

Cada variante recibe un SKU único generado automáticamente:

```javascript
generateSKU("Remera Oversize", [
  { attributeName: "Color", valueName: "Rojo" },
  { attributeName: "Talle", valueName: "M" }
])

// Resultado: "REM-ROJO-M"
```

**Formato**: `PREFIJO-ATTR1-ATTR2-ATTR3`

- **PREFIJO**: Primeras 3-4 letras del nombre del producto
- **ATTR**: Primeras 3-4 letras de cada valor de atributo

### 5️⃣ Configurar Precios y Stock

El usuario completa la tabla de variantes:

| Combinación | SKU | Stock | P. Venta | P. Promo | Costo | Margen |
|-------------|-----|-------|----------|----------|-------|--------|
| Rojo + M | REM-ROJO-M | 50 | 5000 | 4500 | 2000 | 150% |
| Rojo + L | REM-ROJO-L | 30 | 5000 | - | 2000 | 150% |
| Azul + M | REM-AZUL-M | 40 | 5000 | - | 2000 | 150% |
| ... | ... | ... | ... | ... | ... | ... |

**Cálculo de Margen**: `(Precio Venta - Costo) / Costo × 100`

### 6️⃣ Guardar Producto

Al hacer click en "Crear Producto":

```javascript
// 1. Crear producto
POST /api/products
{
  name: "Remera Oversize Premium",
  description: "...",
  categoryId: 2,
  variants: [
    { sku: "REM-ROJO-M", salePrice: 5000, stock: 50, ... },
    { sku: "REM-ROJO-L", salePrice: 5000, stock: 30, ... },
    // ... 6 variantes
  ]
}

// 2. Asignar atributos al producto
POST /api/products/{id}/attributes
{
  attributeIds: [1, 2]  // Color, Talle
}

// 3. Generar relaciones variante-atributo-valor
POST /api/products/{id}/variants/generate
{
  selectedValues: {
    1: [1, 2, 3],   // Color: Rojo, Azul, Negro
    2: [4, 5]       // Talle: M, L
  }
}
```

---

## ✏️ Flujo de Edición de Producto

### Cargar Producto Existente

```javascript
// GET /api/products/{id}
{
  id: 5,
  name: "Remera Oversize Premium",
  categoryId: 2,
  variants: [
    {
      id: 10,
      sku: "REM-ROJO-M",
      salePrice: 5000,
      promotionPrice: 4500,
      cost: 2000,
      stock: { quantity: 50, reservedQty: 2 },
      attributeValues: [
        { attributeValue: { id: 1, value: "Rojo", attribute: { id: 1, name: "Color" } } },
        { attributeValue: { id: 4, value: "M", attribute: { id: 2, name: "Talle" } } }
      ]
    },
    // ... más variantes
  ]
}
```

### Pre-selección de Valores

El sistema automáticamente marca los valores que ya tienen variantes:

```javascript
// Extraer valores únicos de variantes existentes
const preSelectedValues = {};
variants.forEach(variant => {
  variant.attributeValues.forEach(av => {
    const attrId = av.attributeValue.attribute.id;
    const valueId = av.attributeValue.id;
    
    if (!preSelectedValues[attrId]) {
      preSelectedValues[attrId] = [];
    }
    if (!preSelectedValues[attrId].includes(valueId)) {
      preSelectedValues[attrId].push(valueId);
    }
  });
});

// Resultado:
// {
//   1: [1, 2, 3],  // Color: Rojo, Azul, Negro
//   2: [4, 5]      // Talle: M, L
// }
```

### Actualizar Variantes

```javascript
// PUT /api/products/{productId}
// Actualiza datos básicos (nombre, descripción, categoría)

// PUT /api/products/{productId}/variants/{variantId}
// Actualiza cada variante individualmente
{
  salePrice: 5500,
  promotionPrice: 5000,
  cost: 2200,
  stock: 45
}
```

**⚠️ Limitación Actual**: En modo edición solo se pueden modificar precios y stock de variantes existentes. Para agregar nuevas combinaciones, hay que eliminar y recrear el producto.

---

## 🔍 Detección de Duplicados

El backend **previene automáticamente** la creación de variantes duplicadas:

```javascript
// Función que verifica si una combinación ya existe
const variantExists = (combo, existingVariants) => {
  return existingVariants.some(variant => {
    // 1. Verificar que tenga la misma cantidad de atributos
    if (variant.attributeValues.length !== combo.length) return false;
    
    // 2. Verificar que todos los pares atributo-valor coincidan
    return combo.every(c => 
      variant.attributeValues.some(av => 
        av.attributeValue.attributeId === c.attributeId && 
        av.attributeValue.id === c.valueId
      )
    );
  });
};

// Filtrar solo combinaciones nuevas
const newCombinations = combinations.filter(
  combo => !variantExists(combo, existingVariants)
);
```

**Ejemplo**:
- Producto tiene variantes: Rojo+M, Azul+M
- Usuario selecciona: Rojo, Azul, Negro + M, L
- Combinaciones posibles: 6 (3 colores × 2 talles)
- Combinaciones existentes: 2 (Rojo+M, Azul+M)
- **Se crearán solo 4 nuevas**: Rojo+L, Azul+L, Negro+M, Negro+L

---

## 🏷️ Sistema de SKU

### Generación Automática

```javascript
function generateSKU(productName, combination) {
  // 1. Prefijo del producto (3 letras)
  const prefix = productName
    .substring(0, 3)
    .toUpperCase()
    .replace(/\s/g, '');
  
  // 2. Abreviaturas de atributos (3-4 letras cada uno)
  const attrs = combination
    .map(c => c.valueName.substring(0, 4).toUpperCase())
    .join('-');
  
  // 3. Combinar
  return `${prefix}-${attrs}`;
}
```

### Ejemplos

| Producto | Atributos | SKU Generado |
|----------|-----------|--------------|
| Remera Oversize | Rojo, M | `REM-ROJO-M` |
| Pantalón Cargo | Negro, 38, Algodón | `PAN-NEGR-38-ALGO` |
| Buzo Canguro | Gris, XL | `BUZ-GRIS-XL` |
| Remera Lisa | (sin atributos) | `REM-001` |

### SKU Editable

Aunque se genera automáticamente, el usuario **puede modificar manualmente** el SKU en cualquier momento antes de guardar.

---

## 📡 Endpoints del Backend

### Productos

```javascript
// Listar todos los productos
GET /api/products
// Respuesta: Array de productos con variantes, stock y atributos

// Obtener un producto por ID
GET /api/products/:id
// Respuesta: Producto completo con todas sus relaciones

// Crear producto
POST /api/products
{
  name: string,
  description: string,
  categoryId: number,
  variants: [
    { sku: string, salePrice: number, stock: number, ... }
  ]
}

// Actualizar producto (datos básicos)
PUT /api/products/:id
{
  name: string,
  description: string,
  categoryId: number
}

// Eliminar producto
DELETE /api/products/:id
```

### Atributos del Producto

```javascript
// Asignar atributos a un producto
POST /api/products/:id/attributes
{
  attributeIds: [1, 2, 3]
}
// Crea registros en ProductAttribute (relación N:M)
```

### Generación de Variantes

```javascript
// Generar variantes automáticamente
POST /api/products/:id/variants/generate
{
  selectedValues: {
    1: [1, 2, 3],   // attributeId: [valueId1, valueId2, ...]
    2: [4, 5]
  },
  deleteExisting: false  // opcional, por defecto false
}

// Proceso en 8 pasos:
// 1. Obtener producto con atributos
// 2. Asignar atributos automáticamente (si se proporcionan selectedValues)
// 3. Validar atributos del producto
// 4. Filtrar valores para generar combinaciones
// 5. Generar combinaciones
// 6. Gestionar variantes existentes (eliminar o mantener)
// 7. Crear nuevas variantes (solo las que no existen)
// 8. Retornar resumen
```

### Actualizar Variante

```javascript
// Actualizar una variante específica
PUT /api/products/:productId/variants/:variantId
{
  salePrice: number,
  promotionPrice: number,  // opcional
  cost: number,            // opcional
  stock: number,
  isActive: boolean
}
```

### Eliminar Variante

```javascript
// Eliminar una variante
DELETE /api/products/:productId/variants/:variantId
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Remera con Color y Talle

```javascript
// 1. Crear producto básico
const product = {
  name: "Remera Básica",
  description: "100% algodón",
  categoryId: 1
};

// 2. Seleccionar valores
selectedValues = {
  1: [1, 2],      // Color: Blanco, Negro
  2: [3, 4, 5]    // Talle: S, M, L
};

// 3. Generar → 2 × 3 = 6 variantes
// Blanco-S, Blanco-M, Blanco-L
// Negro-S, Negro-M, Negro-L

// 4. Configurar precios
variants.forEach(v => {
  v.salePrice = 3000;
  v.cost = 1200;
  v.stock = 50;
});

// 5. Guardar
```

### Ejemplo 2: Producto sin Variantes

```javascript
// Producto simple (sin atributos)
const product = {
  name: "Libro de Programación",
  categoryId: 5,
  variants: [
    {
      sku: "LIB-001",
      salePrice: 12000,
      stock: 100
    }
  ]
};

// No se seleccionan atributos
selectedValues = {};

// Se crea una sola variante básica
```

### Ejemplo 3: Agregar Nuevas Variantes

```javascript
// Producto existente:
// - Rojo + M
// - Rojo + L

// Usuario agrega talle XL
selectedValues = {
  1: [1],      // Color: Rojo (ya existe)
  2: [4, 5, 6] // Talle: M, L, XL (nuevo)
};

// Al generar:
// - M: Ya existe → se omite
// - L: Ya existe → se omite
// - XL: No existe → se crea

// Resultado: Solo se crea "Rojo + XL"
```

---

## 🎨 Componente Frontend

### ProductFormUnified.jsx

Estructura del componente:

```jsx
// Estados principales
const [formData, setFormData] = useState({...});         // Datos básicos
const [selectedValues, setSelectedValues] = useState({}); // Atributos seleccionados
const [variants, setVariants] = useState([]);            // Variantes generadas

// Funciones clave
loadInitialData()           // Carga categorías, atributos y producto (si edita)
toggleAttributeValue()      // Marca/desmarca valores
handleGenerateVariants()    // Genera combinaciones
generateCombinations()      // Algoritmo recursivo
generateSKU()              // Crea SKU automático
updateVariant()            // Modifica campo de variante
handleSubmit()             // Guarda todo

// Secciones del formulario
1. 📋 Información del Producto (nombre, descripción, categoría)
2. 🏷️ Atributos del Producto (solo en creación)
3. 📦 Tabla de Variantes (siempre visible cuando hay variantes)
```

### Flujo Visual

```
┌─────────────────────────────────────┐
│ 📋 Información del Producto         │
│ ┌─────────────────────────────────┐ │
│ │ Nombre: [Remera Oversize]       │ │
│ │ Descripción: [...]              │ │
│ │ Categoría: [Remeras ▼]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🏷️ Atributos del Producto           │
│                                     │
│ Color (3 opciones)    [2 seleccionado(s)] │
│ [Rojo✓] [Azul✓] [Negro]            │
│                                     │
│ Talle (4 opciones)    [2 seleccionado(s)] │
│ [S] [M✓] [L✓] [XL]                 │
│                                     │
│         [Generar Variantes →]       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📦 Variantes (4)                    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Combo   │ SKU    │ Stock │ $... ││ │
│ ├─────────────────────────────────┤ │
│ │ Rojo+M  │ REM-RO..│ [50] │[5000]││ │
│ │ Rojo+L  │ REM-RO..│ [30] │[5000]││ │
│ │ Azul+M  │ REM-AZ..│ [40] │[5000]││ │
│ │ Azul+L  │ REM-AZ..│ [25] │[5000]││ │
│ └─────────────────────────────────┘ │
│                                     │
│     [Cancelar]  [✓ Crear Producto]  │
└─────────────────────────────────────┘
```

---

## 🔧 Consejos y Mejores Prácticas

### ✅ Hacer

1. **Seleccionar solo los valores necesarios** antes de generar variantes
2. **Configurar precios y stock** inmediatamente después de generar
3. **Usar nombres de producto descriptivos** para SKUs más claros
4. **Verificar el contador de combinaciones** antes de generar

### ❌ Evitar

1. **Seleccionar todos los valores** si no los necesitas (genera demasiadas variantes)
2. **Dejar precios en 0** - cada variante necesita precio de venta
3. **SKUs duplicados** - el sistema valida unicidad
4. **Generar y no guardar** - las variantes no se crean hasta hacer click en "Guardar"

### 💡 Tips

- **Producto sin variantes**: No selecciones ningún atributo y crea una variante básica
- **Agregar nuevos talles/colores**: Solo marca los nuevos valores, el sistema omite duplicados
- **Precios diferentes por variante**: Puedes configurar precio único para todas o diferentes
- **Margen automático**: Se calcula en tiempo real: `(venta - costo) / costo × 100`

---

## 🐛 Solución de Problemas

### "Error: El producto no tiene atributos asignados"

**Causa**: Intentaste generar variantes sin seleccionar valores de atributos.

**Solución**: Selecciona al menos un valor de un atributo, o crea el producto sin variantes.

### "Error: El SKU ya existe"

**Causa**: Hay otra variante (de este u otro producto) con el mismo SKU.

**Solución**: Modifica manualmente el SKU para hacerlo único.

### "Todas las variantes ya existen"

**Causa**: Intentaste generar combinaciones que ya están creadas.

**Solución**: Normal. Marca nuevos valores si quieres agregar más variantes.

### Las variantes no se muestran en edición

**Causa**: El producto no tiene variantes creadas.

**Solución**: Las variantes solo existen después de guardar. Verifica que hayas completado la creación.

---

## 📝 Notas Técnicas

### Prisma Schema

```prisma
model ProductVariant {
  id              Int                      @id @default(autoincrement())
  productId       Int
  sku             String                   @unique
  salePrice       Float                    // Obligatorio
  promotionPrice  Float?                   // Opcional
  cost            Float?                   // Opcional
  isActive        Boolean                  @default(true)
  
  product         Product                  @relation(...)
  stock           Stock?                   // 1:1
  attributeValues VariantAttributeValue[]  // N:M
  cartItems       CartItem[]
  orderItems      OrderItem[]
}
```

### Algoritmo de Combinaciones

```javascript
// Recursivo - Producto cartesiano
function generateCombinations(attrs) {
  if (attrs.length === 0) return [[]];
  
  const [first, ...rest] = attrs;
  const restCombos = generateCombinations(rest);
  
  const result = [];
  for (const value of first.values) {
    for (const combo of restCombos) {
      result.push([
        { attributeId: first.id, valueId: value.id, ... },
        ...combo
      ]);
    }
  }
  return result;
}

// Ejemplo:
// Input: [
//   { id: 1, name: "Color", values: ["Rojo", "Azul"] },
//   { id: 2, name: "Talle", values: ["M", "L"] }
// ]
// Output: [
//   [{ Color: Rojo }, { Talle: M }],
//   [{ Color: Rojo }, { Talle: L }],
//   [{ Color: Azul }, { Talle: M }],
//   [{ Color: Azul }, { Talle: L }]
// ]
```

---

## 🚀 Roadmap / Mejoras Futuras

- [ ] Permitir agregar nuevas variantes en modo edición
- [ ] Bulk edit: cambiar precio de múltiples variantes a la vez
- [ ] Importar/Exportar variantes desde Excel
- [ ] Generación de SKU personalizable por usuario
- [ ] Vista previa antes de crear variantes
- [ ] Clonar producto con todas sus variantes
- [ ] Historial de cambios de precios

---

## 📞 Soporte

Si tienes dudas o encuentras problemas:

1. Revisa los logs del backend (consola con emojis)
2. Revisa los logs del frontend (DevTools → Console)
3. Verifica que las relaciones en Prisma estén correctas
4. Asegúrate de que los IDs de atributos y valores son correctos

---

**Última actualización**: Noviembre 2024  
**Versión del sistema**: 1.0  
**Backend**: Node.js + Express + Prisma  
**Frontend**: React + Vite + Tailwind
