import app from './app';
import { config, connectDB } from './config/config';

async function startServer(): Promise<void> {
    // 1. Conectar a MongoDB primero
    await connectDB();

    // 2. Levantar el servidor HTTP
    app.listen(config.port, () => {
        console.log(`\n🤖 ==========================================`);
        console.log(`🚀 WAR-BOTS Tienda Microservicio Activo:`);
        console.log(`👉 http://localhost:${config.port}/api/v1/tienda/catalogo`);
        console.log(`🤖 ==========================================\n`);
    });
}

startServer();