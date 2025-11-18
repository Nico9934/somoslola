import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import productRoutes from "./routes/products.js";
import variantsRoutes from "./routes/variants.js";
import ordersRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";

import { swaggerUi, swaggerSpec } from "./swagger.js";
import cartRoutes from "./routes/cart.js";
import cron from "node-cron";
import { releaseExpiredStock } from "./jobs/releaseExpiredStock.js";

const app = express();
app.use(cors());
app.use(express.json());

// RUTAS PRINCIPALES
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/products", productRoutes);
app.use("/variants", variantsRoutes); // 👈 SOLO ESTA PARA VARIANTS
app.use("/orders", ordersRoutes);
app.use("/cart", cartRoutes);
app.use("/dashboard", dashboardRoutes);

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// CRON liberación stock
cron.schedule("*/2 * * * *", () => {
    releaseExpiredStock();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("API SOMOSLOLA escuchando en puerto", PORT));
