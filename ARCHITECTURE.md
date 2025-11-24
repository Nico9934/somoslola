# 📐 Arquitectura del Sistema - Somoslola E-commerce

## 🗂️ Estructura del Proyecto

```
somoslola-ecommerce/
├── backend/                    # API REST con Node.js + Express
│   ├── prisma/
│   │   ├── schema.prisma      # Definición de modelos de base de datos
│   │   ├── migrations/        # Migraciones de base de datos
│   │   └── seed.js           # Datos iniciales (atributos, admin, categorías)
│   ├── src/
│   │   ├── index.js          # Punto de entrada, configuración de Express
│   │   ├── swagger.js        # Configuración de documentación API
│   │   ├── config/
│   │   │   └── cloudinary.js # Configuración de almacenamiento de imágenes
│   │   ├── middleware/
│   │   │   └── auth.js       # Autenticación JWT y control de roles
│   │   └── routes/
│   │       ├── auth.js       # Login, registro, perfil de usuario
│   │       ├── categories.js # CRUD de categorías
│   │       ├── products.js   # CRUD de productos y variantes
│   │       ├── variants.js   # Gestión de variantes individuales
│   │       └── attributes.js # CRUD de atributos dinámicos
│   └── package.json
│
└── frontend/                   # SPA con React + Vite
    ├── src/
    │   ├── api/               # Servicios HTTP (Axios)
    │   ├── components/        # Componentes reutilizables
    │   ├── context/          # Context API (Auth, Cart)
    │   ├── pages/            # Páginas de la aplicación
    │   │   ├── admin/        # Panel de administración
    │   │   └── customer/     # Vistas de cliente
    │   └── App.jsx           # Configuración de rutas
    └── package.json
```

---

## 🗄️ Modelo de Datos (Prisma Schema)

### **Diagrama de Relaciones**

```
User
 ├─ CartItem[]
 └─ Order[]

Category
 └─ Product[]

Product
 ├─ ProductVariant[]
 ├─ ProductImage[]
 └─ ProductAttribute[]

ProductVariant
 ├─ Stock (1:1)
 ├─ VariantAttributeValue[]
 ├─ CartItem[]
 └─ OrderItem[]

Attribute
 ├─ AttributeValue[]
 └─ ProductAttribute[]

Order
 └─ OrderItem[]
```

---

### **1. Usuario (User)**

```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  role      UserRole  @default(CUSTOMER)
  name      String?
  cartItems CartItem[]
  orders    Order[]
}

enum UserRole {
  ADMIN      // Acceso total al panel de administración
  CUSTOMER   // Usuario normal con acceso a compras
}
```

**Propósito**: Gestión de usuarios con autenticación y autorización basada en roles.

---

### **2. Categoría (Category)**

```prisma
model Category {
  id          Int       @id @default(autoincrement())
  name        String
  description String?
  imageUrl    String?
  products    Product[]
}
```

**Propósito**: Organización de productos en categorías (ej: Remeras, Pantalones, Accesorios).

---

### **3. Producto (Product)**

```prisma
model Product {
  id          Int                @id @default(autoincrement())
  name        String             // Nombre del producto
  description String?            // Descripción detallada
  categoryId  Int
  category    Category           @relation(fields: [categoryId], references: [id])
  images      ProductImage[]
  variants    ProductVariant[]   // Variantes con SKU, precios y stock
  attributes  ProductAttribute[] // Atributos asignados (Color, Talle, etc.)
}
```

**Nota importante**: 
- ❌ **NO tiene precios directamente**. Los precios están en las variantes.
- ✅ Un producto puede tener múltiples variantes con diferentes precios.

---

### **4. Variante de Producto (ProductVariant)**

```prisma
model ProductVariant {
  id              Int                      @id @default(autoincrement())
  productId       Int
  sku             String                   @unique       // Código único de inventario
  salePrice       Float                    // ⭐ Precio de venta (REQUERIDO)
  promotionPrice  Float?                   // Precio promocional (opcional)
  cost            Float?                   // Costo del producto
  isActive        Boolean                  @default(true)
  product         Product                  @relation(fields: [productId], references: [id], onDelete: Cascade)
  stock           Stock?                   // Relación 1:1 con Stock
  attributeValues VariantAttributeValue[]  // Combinación de atributos (ej: Rojo + Talle M)
  cartItems       CartItem[]
  orderItems      OrderItem[]
}
```

**Casos de uso**:
- **Producto sin variantes complejas**: 1 sola variante con SKU básico
- **Producto con variantes**: Múltiples combinaciones (Color × Talle = 30 variantes)
- **Precios diferentes**: Talle XL puede costar más que Talle S

**Ejemplo**:
```
Producto: Remera Oversize
  ├─ Variante 1: REM-ROJ-M  | Rojo + M    | $10.000
  ├─ Variante 2: REM-ROJ-L  | Rojo + L    | $10.000
  ├─ Variante 3: REM-AZU-M  | Azul + M    | $10.500
  └─ Variante 4: REM-AZU-L  | Azul + L    | $10.500
```

---

### **5. Stock**

```prisma
model Stock {
  id            Int            @id @default(autoincrement())
  variantId     Int            @unique
  quantity      Int            @default(0)      // Stock total disponible
  reservedQty   Int            @default(0)      // Reservado en carritos/órdenes pendientes
  lowStockAlert Int?                            // Umbral de alerta de stock bajo
  variant       ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
}
```

**Propósito**: 
- **Separación de responsabilidades**: El stock está separado de la variante
- **Stock disponible real**: `quantity - reservedQty`
- **Alertas**: Notificaciones cuando `quantity <= lowStockAlert`

**Flujo de reserva**:
1. Usuario agrega al carrito → `reservedQty++`
2. Usuario completa compra → `quantity--`, `reservedQty--`
3. Usuario abandona carrito → `reservedQty--`

---

### **6. Atributo (Attribute)**

```prisma
model Attribute {
  id     Int              @id @default(autoincrement())
  name   String           // ej: "Color", "Talle", "Material"
  slug   String           @unique
  type   AttributeType    // SELECT, NUMBER, TEXT
  values AttributeValue[] // Valores predefinidos
}

enum AttributeType {
  SELECT  // Selección única (Color: Rojo, Azul, Verde)
  NUMBER  // Numérico (Número de calzado: 38, 39, 40)
  TEXT    // Texto libre (Personalización)
}
```

**Atributos predefinidos en el sistema**:
- Color (10 valores con códigos hexadecimales)
- Talle (8 talles de ropa: XS, S, M, L, XL, XXL, 3XL, 4XL)
- Capacidad (6 opciones en ml: 250, 500, 750, 1000, 1500, 2000)
- Material (8 tipos: Algodón, Poliéster, etc.)
- Número (11 talles de calzado: 35-45)
- Peso (5 opciones en kg)
- Alto (5 opciones en cm)

---

### **7. Valor de Atributo (AttributeValue)**

```prisma
model AttributeValue {
  id          Int       @id @default(autoincrement())
  attributeId Int
  value       String    // ej: "Rojo", "M", "Algodón"
  hexColor    String?   // Color hexadecimal para atributos de tipo Color
  attribute   Attribute @relation(fields: [attributeId], references: [id], onDelete: Cascade)
}
```

**Ejemplo**:
```
Atributo: Color
  ├─ Rojo    (#FF0000)
  ├─ Azul    (#0000FF)
  └─ Verde   (#00FF00)

Atributo: Talle
  ├─ S
  ├─ M
  └─ L
```

---

### **8. Atributo de Producto (ProductAttribute)**

```prisma
model ProductAttribute {
  id          Int       @id @default(autoincrement())
  productId   Int
  attributeId Int
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  attribute   Attribute @relation(fields: [attributeId], references: [id])
}
```

**Propósito**: Define QUÉ atributos usa un producto específico.

**Ejemplo**:
```
Producto: Remera
  ├─ Usa atributo: Color
  └─ Usa atributo: Talle

Producto: Botella
  ├─ Usa atributo: Color
  └─ Usa atributo: Capacidad
```

---

### **9. Valor de Atributo de Variante (VariantAttributeValue)**

```prisma
model VariantAttributeValue {
  id               Int            @id @default(autoincrement())
  variantId        Int
  attributeValueId Int
  variant          ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)
  attributeValue   AttributeValue @relation(fields: [attributeValueId], references: [id])
}
```

**Propósito**: Define la combinación EXACTA de atributos de cada variante.

**Ejemplo**:
```
Variante: REM-ROJ-M
  ├─ Color: Rojo
  └─ Talle: M

Variante: REM-AZU-L
  ├─ Color: Azul
  └─ Talle: L
```

---

### **10. Orden (Order)**

```prisma
model Order {
  id         Int         @id @default(autoincrement())
  userId     Int
  total      Float       // Total calculado al momento de la compra
  status     OrderStatus @default(PENDING)
  createdAt  DateTime    @default(now())
  user       User        @relation(fields: [userId], references: [id])
  items      OrderItem[]
}

enum OrderStatus {
  PENDING    // Pendiente de pago
  PAID       // Pagado
  SHIPPED    // Enviado
  DELIVERED  // Entregado
  CANCELLED  // Cancelado
}
```

---

### **11. Item de Orden (OrderItem)**

```prisma
model OrderItem {
  id        Int            @id @default(autoincrement())
  orderId   Int
  variantId Int
  quantity  Int
  price     Float          // ⭐ SNAPSHOT del precio al momento de la compra
  order     Order          @relation(fields: [orderId], references: [id])
  variant   ProductVariant @relation(fields: [variantId], references: [id])
}
```

**⚠️ IMPORTANTE - Snapshot de Precios**:
- El campo `price` guarda el **precio exacto al momento de la venta**
- Si mañana cambias el precio de la variante, el historial de ventas NO se modifica
- Esto permite:
  - Reportes de ventas precisos
  - Auditoría de precios históricos
  - Cálculo correcto de ganancias pasadas

**Ejemplo**:
```
Hoy (19/11/2025):
  - Variante "REM-ROJ-M" cuesta $10.000
  - Cliente compra 2 unidades
  - OrderItem.price = $10.000 (se guarda este valor)

Mañana (20/11/2025):
  - Cambias el precio a $12.000
  - La venta de ayer sigue mostrando $10.000
  - Las nuevas ventas guardarán $12.000
```

---

## 🔄 Flujo de Datos del Sistema

### **Flujo 1: Creación de Producto con Variantes**

```
1. Admin crea producto
   POST /api/products
   {
     "name": "Remera Oversize",
     "description": "...",
     "categoryId": 1,
     "variants": [
       {
         "sku": "REM-001",
         "salePrice": 10000,
         "promotionPrice": 8000,
         "cost": 5000,
         "stock": 100
       }
     ]
   }

2. Backend procesa:
   ├─ Crea Product
   ├─ Para cada variante:
   │   ├─ Crea ProductVariant con precios
   │   └─ Crea Stock con quantity
   └─ Retorna producto completo

3. Frontend recibe:
   {
     "id": 1,
     "name": "Remera Oversize",
     "variants": [
       {
         "id": 1,
         "sku": "REM-001",
         "salePrice": 10000,
         "stock": {
           "quantity": 100,
           "reservedQty": 0
         }
       }
     ]
   }
```

---

### **Flujo 2: Asignación de Atributos y Generación de Variantes**

```
1. Admin asigna atributos al producto
   POST /api/products/1/attributes
   {
     "attributeIds": [1, 2]  // Color y Talle
   }

2. Backend crea ProductAttribute

3. Admin genera variantes
   POST /api/products/1/variants/generate
   {
     "deleteExisting": false
   }

4. Backend:
   ├─ Obtiene atributos asignados (Color, Talle)
   ├─ Obtiene valores de cada atributo
   │   Color: [Rojo, Azul, Verde]
   │   Talle: [S, M, L]
   ├─ Genera combinaciones (3 × 3 = 9 variantes)
   │   REM-ROJ-S, REM-ROJ-M, REM-ROJ-L
   │   REM-AZU-S, REM-AZU-M, REM-AZU-L
   │   REM-VER-S, REM-VER-M, REM-VER-L
   ├─ Crea ProductVariant con SKU autogenerado
   ├─ Crea VariantAttributeValue (Color=Rojo, Talle=M)
   └─ Crea Stock para cada variante

5. Frontend muestra tabla editable con 9 variantes
```

---

### **Flujo 3: Compra de un Producto**

```
1. Cliente agrega al carrito
   POST /api/cart/items
   {
     "variantId": 1,
     "quantity": 2
   }

2. Backend:
   ├─ Crea CartItem
   └─ Stock.reservedQty += 2

3. Cliente completa la compra
   POST /api/orders
   {
     "items": [
       { "variantId": 1, "quantity": 2 }
     ]
   }

4. Backend:
   ├─ Crea Order
   ├─ Para cada item:
   │   ├─ Obtiene variant.salePrice (o promotionPrice si existe)
   │   ├─ Crea OrderItem con price = salePrice ACTUAL
   │   ├─ Stock.quantity -= 2
   │   └─ Stock.reservedQty -= 2
   └─ Limpia CartItem

5. Resultado:
   OrderItem {
     variantId: 1,
     quantity: 2,
     price: 10000  // ⭐ Precio guardado al momento de la compra
   }
```

---

## 📡 API Endpoints

### **Autenticación (`/api/auth`)**

```
POST   /register          Crear nueva cuenta de usuario
POST   /login             Iniciar sesión (retorna JWT)
GET    /profile           Obtener perfil del usuario autenticado
```

**Headers requeridos (rutas protegidas)**:
```
Authorization: Bearer <token_jwt>
```

---

### **Categorías (`/api/categories`)**

```
GET    /                  Listar todas las categorías
GET    /:id               Obtener categoría por ID
POST   /                  Crear categoría (admin)
PUT    /:id               Actualizar categoría (admin)
DELETE /:id               Eliminar categoría (admin)
```

**Ejemplo de request**:
```javascript
// POST /api/categories
{
  "name": "Remeras",
  "description": "Remeras de algodón premium",
  "imageUrl": "https://..."
}
```

---

### **Productos (`/api/products`)**

#### **GET /api/products**
Lista todos los productos con sus variantes, stock y atributos.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Remera Oversize",
    "description": "...",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Remeras"
    },
    "variants": [
      {
        "id": 1,
        "sku": "REM-ROJ-M",
        "salePrice": 10000,
        "promotionPrice": 8000,
        "cost": 5000,
        "isActive": true,
        "stock": {
          "quantity": 100,
          "reservedQty": 5
        },
        "attributeValues": [
          {
            "attributeValue": {
              "id": 1,
              "value": "Rojo",
              "hexColor": "#FF0000",
              "attribute": {
                "name": "Color"
              }
            }
          },
          {
            "attributeValue": {
              "id": 5,
              "value": "M",
              "attribute": {
                "name": "Talle"
              }
            }
          }
        ]
      }
    ],
    "attributes": [
      {
        "attributeId": 1,
        "attribute": {
          "name": "Color",
          "values": [...]
        }
      }
    ]
  }
]
```

---

#### **GET /api/products/:id**
Obtiene un producto específico con toda su información.

**Includes**:
- Categoría
- Imágenes
- Variantes con stock
- Atributos asignados con valores

---

#### **POST /api/products**
Crea un nuevo producto con sus variantes (solo admin).

**Request**:
```json
{
  "name": "Remera Oversize Premium",
  "description": "Remera de algodón 100%",
  "categoryId": 1,
  "variants": [
    {
      "sku": "REM-001",
      "salePrice": 10000,
      "promotionPrice": 8500,
      "cost": 5000,
      "stock": 50
    }
  ]
}
```

**Validaciones**:
- ✅ `variants` debe tener al menos 1 elemento
- ✅ Cada variante debe tener `salePrice > 0`
- ✅ SKU debe ser único en todo el sistema

**Response**: Producto creado con variantes y stock

---

#### **PUT /api/products/:id**
Actualiza información básica del producto (nombre, descripción, categoría).

**Request**:
```json
{
  "name": "Remera Oversize Premium V2",
  "description": "Nueva descripción",
  "categoryId": 2
}
```

**Nota**: Para actualizar variantes, usar endpoints específicos de variantes.

---

#### **DELETE /api/products/:id**
Elimina un producto y TODAS sus variantes (admin).

**Cascade delete**:
- ❌ ProductVariant
- ❌ Stock
- ❌ ProductImage
- ❌ ProductAttribute
- ❌ VariantAttributeValue

---

### **Atributos de Producto (`/api/products/:id/attributes`)**

#### **POST /api/products/:id/attributes**
Asigna atributos a un producto.

**Request**:
```json
{
  "attributeIds": [1, 2]  // Color y Talle
}
```

**Proceso**:
1. Elimina atributos previamente asignados
2. Crea nuevos ProductAttribute
3. Retorna producto actualizado

---

### **Generación de Variantes (`/api/products/:id/variants/generate`)**

#### **POST /api/products/:id/variants/generate**
Genera automáticamente todas las combinaciones posibles de variantes.

**Request**:
```json
{
  "deleteExisting": true  // Eliminar variantes existentes
}
```

**Algoritmo**:
```javascript
// Ejemplo: Color [Rojo, Azul] × Talle [S, M, L]
function generateCombinations(attributes) {
  // Producto cartesiano de todos los valores
  // Resultado: 2 × 3 = 6 variantes
  return [
    [Color=Rojo, Talle=S],
    [Color=Rojo, Talle=M],
    [Color=Rojo, Talle=L],
    [Color=Azul, Talle=S],
    [Color=Azul, Talle=M],
    [Color=Azul, Talle=L]
  ];
}
```

**Para cada combinación**:
1. Genera SKU: `PROD-ROJ-S`
2. Crea ProductVariant (sin precios inicialmente)
3. Crea VariantAttributeValue
4. Crea Stock con cantidad = 0

**Response**:
```json
{
  "message": "6 variantes generadas",
  "variants": [...]
}
```

---

### **Actualización de Variantes (`/api/products/:id/variants/:variantId`)**

#### **PUT /api/products/:id/variants/:variantId**
Actualiza una variante específica.

**Request**:
```json
{
  "salePrice": 12000,
  "promotionPrice": 10000,
  "cost": 6000,
  "stock": 150,
  "isActive": true
}
```

**Campos actualizables**:
- `salePrice`: Precio de venta
- `promotionPrice`: Precio promocional
- `cost`: Costo del producto
- `stock`: Actualiza Stock.quantity
- `isActive`: Activar/desactivar variante

---

#### **DELETE /api/products/:id/variants/:variantId**
Elimina una variante específica.

**Cascade delete**:
- ❌ Stock
- ❌ VariantAttributeValue
- ⚠️ Falla si hay OrderItem relacionados (integridad referencial)

---

### **Atributos Globales (`/api/attributes`)**

#### **GET /api/attributes**
Lista todos los atributos con sus valores.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Color",
    "slug": "color",
    "type": "SELECT",
    "values": [
      {
        "id": 1,
        "value": "Rojo",
        "hexColor": "#FF0000"
      },
      {
        "id": 2,
        "value": "Azul",
        "hexColor": "#0000FF"
      }
    ]
  },
  {
    "id": 2,
    "name": "Talle",
    "slug": "talle",
    "type": "SELECT",
    "values": [
      { "id": 5, "value": "S" },
      { "id": 6, "value": "M" },
      { "id": 7, "value": "L" }
    ]
  }
]
```

---

#### **POST /api/attributes**
Crea un nuevo atributo global (admin).

**Request**:
```json
{
  "name": "Estampado",
  "type": "SELECT"
}
```

---

#### **POST /api/attributes/:id/values**
Agrega un valor a un atributo existente.

**Request**:
```json
{
  "value": "Negro",
  "hexColor": "#000000"
}
```

---

#### **DELETE /api/attributes/:id/values/:valueId**
Elimina un valor de atributo.

**Validación**: Falla si hay variantes usando ese valor.

---

## 🎯 Casos de Uso Completos

### **Caso 1: Crear Producto Simple (sin variantes complejas)**

```javascript
// 1. Admin crea producto
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Gorra Básica",
    description: "Gorra de algodón",
    categoryId: 3,
    variants: [{
      sku: "GORR-001",
      salePrice: 5000,
      stock: 200
    }]
  })
});

// Resultado: Producto con 1 variante simple
```

---

### **Caso 2: Crear Producto con Variantes Dinámicas**

```javascript
// 1. Crear producto base
const product = await fetch('/api/products', {
  method: 'POST',
  body: JSON.stringify({
    name: "Remera Oversize",
    categoryId: 1,
    variants: [{
      sku: "TEMP-001",
      salePrice: 10000,
      stock: 0
    }]
  })
});

// 2. Asignar atributos (Color, Talle)
await fetch(`/api/products/${product.id}/attributes`, {
  method: 'POST',
  body: JSON.stringify({
    attributeIds: [1, 2]  // Color y Talle
  })
});

// 3. Generar variantes automáticamente
await fetch(`/api/products/${product.id}/variants/generate`, {
  method: 'POST',
  body: JSON.stringify({
    deleteExisting: true
  })
});

// Resultado: 
// Color (3 valores) × Talle (8 valores) = 24 variantes generadas
// Cada una con SKU único: REM-ROJ-S, REM-ROJ-M, etc.

// 4. Admin edita precios y stock manualmente
for (const variant of variants) {
  await fetch(`/api/products/${product.id}/variants/${variant.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      salePrice: variant.size === 'XL' ? 11000 : 10000,
      stock: 50
    })
  });
}
```

---

### **Caso 3: Cliente Compra Producto**

```javascript
// 1. Cliente busca productos
const products = await fetch('/api/products');

// 2. Selecciona variante específica (Rojo + Talle M)
const variant = products[0].variants.find(v => 
  v.attributeValues.some(av => av.attributeValue.value === 'Rojo') &&
  v.attributeValues.some(av => av.attributeValue.value === 'M')
);

// 3. Agrega al carrito
await fetch('/api/cart/items', {
  method: 'POST',
  body: JSON.stringify({
    variantId: variant.id,
    quantity: 2
  })
});
// → Stock.reservedQty += 2

// 4. Realiza el pedido
await fetch('/api/orders', {
  method: 'POST'
});
// → Crea Order
// → Crea OrderItem con price = variant.salePrice (snapshot)
// → Stock.quantity -= 2
// → Stock.reservedQty -= 2
```

---

## 🔐 Seguridad y Autenticación

### **JWT (JSON Web Token)**

```javascript
// Token estructura
{
  "userId": 1,
  "email": "admin@somoslola.com",
  "role": "ADMIN",
  "iat": 1700000000,
  "exp": 1700086400
}
```

**Middleware de autenticación**:
```javascript
// authMiddleware verifica token válido
// adminOnly verifica role === 'ADMIN'

// Rutas protegidas
app.post('/api/products', authMiddleware, adminOnly, createProduct);
app.get('/api/orders', authMiddleware, getMyOrders);
```

---

## 📊 Mejores Prácticas Implementadas

### **1. Separación de Precios e Inventario**
- ✅ Precios en ProductVariant
- ✅ Stock en tabla separada
- ✅ Precio histórico en OrderItem

### **2. Sistema de Atributos Flexible**
- ✅ Atributos globales reutilizables
- ✅ Asignación por producto
- ✅ Generación automática de combinaciones

### **3. Cascade Delete**
- ✅ Eliminar producto → elimina variantes, stock, imágenes
- ✅ Eliminar variante → elimina stock y atributos relacionados
- ⚠️ Mantiene integridad con OrderItem (no permite eliminar si tiene ventas)

### **4. Validaciones**
- ✅ SKU único
- ✅ Precio de venta requerido
- ✅ Stock no negativo
- ✅ Atributos válidos antes de generar variantes

---

## 🚀 Flujo Completo de Datos

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ GET /api/products
       ▼
┌─────────────────────────────┐
│   Frontend (React + Vite)   │
│  - Muestra productos        │
│  - Selector de variantes    │
│  - Carrito de compras       │
└──────┬──────────────────────┘
       │
       │ POST /api/orders
       ▼
┌─────────────────────────────┐
│   Backend (Express + Prisma)│
│  - Valida stock disponible  │
│  - Crea Order con snapshot  │
│  - Actualiza Stock          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   PostgreSQL Database       │
│  - Order con precio actual  │
│  - OrderItem con snapshot   │
│  - Stock actualizado        │
└─────────────────────────────┘
```

---

## 📝 Notas Finales

### **Ventajas del Modelo Actual**

1. **Flexibilidad de Precios**: Cada variante puede tener precio diferente
2. **Historial Preciso**: Los precios se guardan al momento de la venta
3. **Atributos Dinámicos**: Puedes agregar Color, Talle, Material, etc.
4. **Escalabilidad**: Separación de Stock permite gestión avanzada
5. **Integridad**: Cascade deletes y validaciones

### **Próximas Mejoras Sugeridas**

- [ ] Sistema de descuentos por código promocional
- [ ] Gestión de múltiples almacenes
- [ ] Historial de cambios de precios
- [ ] Alertas automáticas de stock bajo
- [ ] Dashboard de analytics de ventas
- [ ] Integración con pasarelas de pago

---

**Documentación generada**: 19 de Noviembre de 2025  
**Versión del sistema**: 1.0.0  
**Stack**: Node.js + Express + Prisma + PostgreSQL + React + Vite
