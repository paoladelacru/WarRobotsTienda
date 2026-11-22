import 'reflect-metadata';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import catalogoRoutes from './modules/catalogo/catalogo.routes';
import comprasRoutes from './modules/compras/compras.routes';
import chatarreriaRoutes from './modules/chatarreria/chatarreria.routes';

const app: Application = express();

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
app.use('/api/v1/tienda', comprasRoutes);
app.use('/api/v1/tienda', chatarreriaRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

export default app;