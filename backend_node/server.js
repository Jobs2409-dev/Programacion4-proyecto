// backend_node/server.js
import app from './app.js';
import { conectarDB } from './config/db.js';

const PORT = process.env.PORT || 3000;

try {
    await conectarDB();
    app.listen(PORT, () => {
        console.log(`Servidor Express listo en http://localhost:${PORT}`);
    });
} catch(error) {
    console.error('No se pudo iniciar el servidor: ', error);
    process.exit(1);
}