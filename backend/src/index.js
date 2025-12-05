import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import brandRoutes from "./routes/brands.js";
import productRoutes from "./routes/products.js";
import variantsRoutes from "./routes/variants.js";
import ordersRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";
import attributesRoutes from "./routes/attributes.js";
import uploadRoutes from "./routes/upload.js";
import shippingZonesRoutes from "./routes/shipping-zones.js";
import heroBannersRoutes from "./routes/hero-banners.js";
import paymentSettingsRoutes from "./routes/paymentSettings.js";
import paymentsRoutes from "./routes/payments.js";
import stockNotificationsRoutes from "./routes/stockNotifications.js";

import { swaggerUi, swaggerSpec } from "./swagger.js";
import cartRoutes from "./routes/cart.js";
import cron from "node-cron";
import { releaseExpiredStock } from "./jobs/releaseExpiredStock.js";
import { releaseExpiredOrders } from "./jobs/releaseExpiredOrders.js";
import { validateStockIntegrity } from "./utils/stockIntegrity.js";

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS PRINCIPALES
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/brands", brandRoutes);
app.use("/products", productRoutes);
app.use("/variants", variantsRoutes); // 👈 SOLO ESTA PARA VARIANTS
app.use("/attributes", attributesRoutes);
app.use("/orders", ordersRoutes);
app.use("/cart", cartRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/upload", uploadRoutes);
app.use("/shipping-zones", shippingZonesRoutes);
app.use("/hero-banners", heroBannersRoutes);
app.use("/payment-settings", paymentSettingsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/stock-notifications", stockNotificationsRoutes);

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Validar integridad de stock al iniciar
validateStockIntegrity();

// CRON liberación stock de carritos - cada 2 minutos
cron.schedule("*/2 * * * *", () => {
    releaseExpiredStock();
});

// CRON liberación de órdenes PENDING expiradas - cada 30 minutos
cron.schedule("*/30 * * * *", () => {
    releaseExpiredOrders();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("API SOMOSLOLA escuchando en puerto", PORT));
