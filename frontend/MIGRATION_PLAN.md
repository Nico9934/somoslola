# 🗂️ Plan de Migración al Sistema de Diseño Modular

## 📊 Inventario de Componentes

### ✅ Completados
- [x] OrderConfirmation.jsx (CUSTOMER) - ✅ Migrado y funcionando

---

## 📝 Plan de Trabajo Organizado

### **FASE 1: Componentes UI Base** (Fundación)
> Estos son los componentes más reutilizados. Migrarlos primero facilita el resto.

#### Prioridad ALTA
- [ ] `components/ui/Button.jsx` - Usado en todos lados
- [ ] `components/ui/Card.jsx` - Usado en todos lados  
- [ ] `components/ui/Input.jsx` - Formularios
- [ ] `components/ui/Modal.jsx` - Diálogos
- [ ] `components/ui/Navbar.jsx` - Navegación principal
- [ ] `components/ui/Layout.jsx` - Layout principal

**Complejidad:** 🟢 BAJA - Son componentes pequeños y enfocados

---

### **FASE 2: Páginas CUSTOMER** (Usuario final)
> Experiencia de usuario prioritaria

#### Prioridad ALTA
1. [ ] `pages/customer/Cart.jsx` - 🛒 Carrito
   - Patrones: `products.item`, `orderSummary`, `buttons`, `layout`
   - Complejidad: 🟢 BAJA

2. [ ] `pages/customer/Products.jsx` - 📦 Listado productos
   - Patrones: `layout.grid3Col`, `products`, `cards`, `badges`
   - Complejidad: 🟡 MEDIA

3. [ ] `pages/customer/ProductDetail.jsx` - 🔍 Detalle producto
   - Patrones: `layout.grid2Col`, `products`, `buttons`, `alerts`
   - Complejidad: 🟡 MEDIA

4. [ ] `pages/customer/Checkout.jsx` - 💳 Proceso de pago
   - Patrones: `inputs`, `cards`, `alerts`, `buttons`, `layout`
   - Complejidad: 🔴 ALTA (muchos formularios)

5. [ ] `pages/customer/Orders.jsx` - 📋 Mis pedidos
   - Patrones: `cards`, `badges`, `buttons.outline`, `text`
   - Complejidad: 🟢 BAJA

#### Componentes Customer
- [ ] `components/customer/HeroCarousel.jsx`
- [ ] `components/customer/ProductFilters.jsx`
- [ ] `components/customer/PriceDisplay.jsx`
- [ ] `components/customer/MercadoPagoForm.jsx`

---

### **FASE 3: Páginas AUTH** (Autenticación)
> Simples pero importantes

6. [ ] `pages/auth/Login.jsx` - 🔐 Login
   - Patrones: `inputs`, `buttons`, `cards`, `alerts`
   - Complejidad: 🟢 BAJA

7. [ ] `pages/auth/Register.jsx` - ✍️ Registro
   - Patrones: `inputs`, `buttons`, `cards`, `alerts`
   - Complejidad: 🟢 BAJA

---

### **FASE 4: Componentes ADMIN Base**
> Infraestructura del panel admin

- [ ] `components/admin/AdminLayout.jsx` - Layout admin
- [ ] `components/admin/AdminSidebar.jsx` - Sidebar admin
- [ ] `components/admin/AdminPageLayout.jsx` - Page wrapper

**Complejidad:** 🟡 MEDIA

---

### **FASE 5: Páginas ADMIN** (Panel administrativo)
> Muchas tablas y formularios complejos

#### Gestión Simple
8. [ ] `pages/admin/Dashboard.jsx` - 📊 Dashboard
   - Complejidad: 🟡 MEDIA

9. [ ] `pages/admin/CategoriesManagement.jsx` - 🏷️ Categorías
   - Complejidad: 🟢 BAJA

10. [ ] `pages/admin/BrandsManagement.jsx` - 🏢 Marcas
    - Complejidad: 🟢 BAJA

11. [ ] `pages/admin/AttributesManagement.jsx` - ⚙️ Atributos
    - Complejidad: 🟡 MEDIA

#### Gestión Compleja
12. [ ] `pages/admin/ProductsManagement.jsx` - 📦 Productos (lista)
    - Complejidad: 🟡 MEDIA

13. [ ] `pages/admin/ProductFormUnified.jsx` - ✏️ Form productos
    - Complejidad: 🔴 ALTA (formulario grande con variantes)

14. [ ] `pages/admin/OrdersManagement.jsx` - 📋 Pedidos
    - Complejidad: 🟡 MEDIA

15. [ ] `pages/admin/PaymentSettingsManagement.jsx` - 💰 Pagos
    - Complejidad: 🟡 MEDIA

16. [ ] `pages/admin/ShippingZonesManagement.jsx` - 🚚 Envíos
    - Complejidad: 🟡 MEDIA

17. [ ] `pages/admin/HeroBannersManagement.jsx` - 🖼️ Banners
    - Complejidad: 🟢 BAJA

#### Componentes Admin Específicos
- [ ] `components/admin/VariantsEditor.jsx` - 🔴 ALTA
- [ ] `components/admin/VariantImageSelector.jsx` - 🟡 MEDIA
- [ ] `components/admin/ImageUpload.jsx` - 🟡 MEDIA

---

## 🎯 Estrategia Recomendada

### **Orden de Ejecución:**

1. **FASE 1** - Componentes UI (1-2 horas)
   - Migrar Button, Card, Input primero
   - Estos se usan en todo el proyecto

2. **FASE 2** - Customer (2-3 horas)
   - Empezar por Cart (más simple)
   - Seguir con Products, ProductDetail
   - Dejar Checkout para el final de esta fase

3. **FASE 3** - Auth (30 min - 1 hora)
   - Login y Register son simples

4. **FASE 4** - Admin Base (1 hora)
   - AdminLayout y estructura

5. **FASE 5** - Admin Pages (3-4 horas)
   - Empezar por los simples (Brands, Categories)
   - Dejar ProductFormUnified y VariantsEditor para el final

---

## 📦 Resumen por Números

- **Total componentes:** 35
- **Completados:** 1 (3%)
- **Pendientes:** 34 (97%)

**Distribución:**
- 🟢 BAJA complejidad: 10 componentes (~30 min c/u)
- 🟡 MEDIA complejidad: 18 componentes (~45 min c/u)
- 🔴 ALTA complejidad: 7 componentes (~1.5h c/u)

**Tiempo estimado total:** 15-20 horas

---

## 🚀 Empezar Ahora

### Sugerencia: Comenzar con FASE 1
```
1. Button.jsx      (15 min)
2. Card.jsx        (15 min)
3. Input.jsx       (20 min)
4. Modal.jsx       (20 min)
5. Navbar.jsx      (30 min)
6. Layout.jsx      (20 min)
```

**Total FASE 1:** ~2 horas
**Impacto:** Todos los componentes del proyecto se benefician

---

¿Empezamos con la FASE 1 (componentes UI) o preferís otra fase?
