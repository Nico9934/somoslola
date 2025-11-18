import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "SOMOSLOLA Ecommerce API",
            version: "1.0.0",
            description: "API para gestión del ecommerce de ropa SOMOSLOLA",
        },
        servers: [
            {
                url: "http://localhost:4000",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: [path.join(__dirname, "routes/*.js")], // 👈 Ajustado para que detecte rutas
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
