// backend_node/middlewares/rol.middleware.js
export const verificarAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ mensaje: 'Se intentó verificar el rol, pero no se consiguió la sesión.' });
    }

    if (req.usuario.rol !== 'ADMIN') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren privilegios de Administrador.' });
    }

    next();
};

export const verificarOperadorOAdmin = (req, res, next) => {
    if (!req.usuario) {
        return res.status(401).json({ mensaje: 'Se intentó verificar el rol, pero no se consiguió la sesión.' });
    }

    if (!['OPERADOR', 'ADMIN'].includes(req.usuario.rol)) {
        return res.status(403).json({ mensaje: 'Acceso denegado. Se requiere ser Operador o Administrador.' });
    }

    next();
};