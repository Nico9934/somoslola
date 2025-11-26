import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Token requerido" });

    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ error: "Token inválido" });
    }
};

// Middleware opcional: si hay token lo valida, si no hay continúa sin user
export const optionalAuth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        req.user = null;
        return next();
    }

    const token = header.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch {
        req.user = null; // Token inválido, continuar sin usuario
    }
    next();
};

export const adminOnly = (req, res, next) => {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ error: "Acceso denegado" });
    }
    next();
};
