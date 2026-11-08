import 'reflect-metadata'; // Requerido para los decoradores AOP
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import catalogoRoutes from './modules/catalogo/catalogo.routes';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de bienvenida / Health check
app.get('/api/v1', (_req: Request, res: Response) => {
    res.json({
        plataforma: 'WAR-BOTS',
        modulo: 'Módulo 1: Tienda Oficial & Compras Unificadas',
        estado: 'ONLINE'
    });
});

// Rutas de los submódulos de la tienda
app.use('/api/v1/tienda', catalogoRoutes);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`WAR-BOTS Tienda Backend corriendo en:`);
    console.log(`http://localhost:${PORT}/api/v1/tienda/catalogo`);
    console.log(`==========================================\n`);
});

export default app;