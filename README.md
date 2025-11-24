# 🛍️ Somos Lola - E-commerce

Sistema de e-commerce completo con gestión de productos, variantes dinámicas, carrito y órdenes.

## 🚀 Inicio Rápido

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentación del Sistema de Variantes

El sistema incluye gestión avanzada de productos con variantes dinámicas:

### 🎯 Para Usuarios
- **[Resumen Ejecutivo](./RESUMEN_EJECUTIVO.md)** - Vista general del sistema
- **[Guía Rápida](./GUIA_RAPIDA.md)** - Cómo usar el sistema

### 👨‍💻 Para Desarrolladores
- **[Sistema Completo](./SISTEMA_VARIANTES.md)** - Documentación técnica completa
- **[Migración](./MIGRACION.md)** - Cambios realizados
- **[Índice de Docs](./README_DOCS.md)** - Navegación entre documentos

## ✨ Características Principales

### 🏷️ Sistema de Variantes Dinámicas
- Atributos configurables (Color, Talle, Material, etc.)
- Generación automática de combinaciones
- SKU automático: `REM-ROJO-M`
- Detección inteligente de duplicados
- Cálculo automático de margen de ganancia

### 📦 Gestión de Productos
- Formulario unificado (todo en una pantalla)
- Creación y edición simplificada
- Stock separado por variante
- Precios con soporte para promociones
- Previsualización visual en cards

### 🛒 Carrito y Órdenes
- Reserva automática de stock
- Expiración de reservas
- Historial de precios
- Gestión de órdenes

## 🏗️ Arquitectura

### Backend
- **Node.js** + Express
- **Prisma ORM** + PostgreSQL
- **JWT** para autenticación
- **Cloudinary** para imágenes
- **Swagger** para documentación API

### Frontend
- **React** + Vite
- **React Router** para navegación
- **Tailwind CSS** para estilos
- **Axios** para requests
- **Lucide React** para íconos

## 📊 Modelo de Datos

```
Product
  ├── ProductVariant (N:1)
  │   ├── Stock (1:1)
  │   └── VariantAttributeValue (N:M)
  │       └── AttributeValue
  │           └── Attribute
  └── ProductAttribute (N:M)
      └── Attribute
```

## 🔐 Credenciales por Defecto

**Admin**:
- Email: `admin@somoslola.com`
- Password: `admin123`

## 🛠️ Tecnologías

### Backend
- Node.js 18+
- Express 4.x
- Prisma 6.x
- PostgreSQL 15+
- JWT
- Bcrypt
- Cloudinary
- Node-cron

### Frontend
- React 18.x
- Vite 5.x
- React Router 6.x
- Tailwind CSS 3.x
- Axios
- Lucide React

## 📝 Scripts Disponibles

### Backend
```bash
npm run dev        # Desarrollo con nodemon
npm start          # Producción
npx prisma studio  # Interfaz visual de BD
npx prisma migrate dev  # Crear migración
npx prisma db seed      # Poblar BD con datos de prueba
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build para producción
npm run preview    # Preview del build
```

## 🌱 Seed Data

El seed incluye:
- 1 usuario admin
- 4 categorías
- 7 atributos con 53 valores
- Productos de ejemplo con variantes

Atributos incluidos:
- **Color**: Rojo, Azul, Negro, Blanco, Verde, Amarillo, Gris, Rosa, Naranja, Violeta
- **Talle**: XS, S, M, L, XL, XXL
- **Material**: Algodón, Poliéster, Seda, Lana, Cuero, Denim, Lino
- **Estilo**: Casual, Formal, Deportivo, Elegante, Urbano
- **Marca**: Nike, Adidas, Puma, Zara, H&M, Uniqlo
- **Temporada**: Verano, Otoño, Invierno, Primavera
- **Género**: Hombre, Mujer, Unisex, Niños

## 🎨 Funcionalidades del Frontend

### Páginas Públicas
- `/products` - Catálogo de productos
- `/products/:id` - Detalle de producto
- `/login` - Inicio de sesión
- `/register` - Registro

### Páginas de Cliente (requiere autenticación)
- `/cart` - Carrito de compras
- `/orders` - Mis órdenes

### Panel de Admin (requiere rol admin)
- `/admin` - Dashboard
- `/admin/products` - Gestión de productos
- `/admin/categories` - Gestión de categorías
- `/admin/attributes` - Gestión de atributos
- `/admin/orders` - Gestión de órdenes

## 🔄 Flujo de Variantes

### Crear Producto
1. Completar datos básicos (nombre, descripción, categoría)
2. Seleccionar valores de atributos (ej: Color: Rojo, Azul | Talle: M, L)
3. Generar variantes → Se crean 4 combinaciones (2×2)
4. Configurar precio y stock de cada variante
5. Guardar

### Editar Producto
1. Cargar producto con variantes existentes
2. Modificar precios/stock directamente
3. Guardar cambios

## 📡 Endpoints Principales

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Variantes
- `POST /api/products/:id/variants/generate` - Generar variantes
- `PUT /api/products/:productId/variants/:variantId` - Actualizar variante

### Atributos
- `GET /api/attributes` - Listar atributos
- `POST /api/attributes` - Crear atributo
- `POST /api/attributes/:id/values` - Agregar valor

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

## 🐛 Debugging

### Logs con Emojis

**Frontend** (consola del navegador):
```
🔵 [UNIFIED FORM] Iniciando carga...
✅ Producto cargado: Remera Oversize
🔵 [GENERATE VARIANTS] Generando...
✅ 6 combinaciones generadas
💾 [SAVE] Guardando producto...
```

**Backend** (terminal):
```
🔵 [GENERATE VARIANTS] Inicio
📦 Step 1: Obteniendo producto...
🏷️ Step 2: Asignando atributos...
✅ Step 8: Proceso completado
```

## 🧪 Testing

### Casos de Prueba Básicos
1. Crear producto con variantes (Color × Talle)
2. Editar producto y cambiar precios
3. Agregar nuevo valor y generar solo nuevas variantes
4. Verificar SKUs únicos
5. Verificar detección de duplicados

## 📈 Roadmap

- [ ] Agregar variantes en modo edición
- [ ] Bulk edit de precios
- [ ] Importar/Exportar variantes
- [ ] SKU personalizable
- [ ] Vista previa antes de guardar
- [ ] Clonar producto
- [ ] Historial de cambios

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado.

## 👥 Equipo

Desarrollado por el equipo de Somos Lola.

---

**Para más información, consulta la [documentación completa](./README_DOCS.md).**
