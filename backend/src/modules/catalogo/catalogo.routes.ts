import { Router } from 'express';
import { CatalogoController } from './catalogo.controller';

const router = Router();
const catalogoController = new CatalogoController();

/**
 * API 01: GET /api/v1/tienda/catalogo
 * Consulta del catálogo unificado (Fábrica + Chatarra) con soporte de filtros.
 */
router.get('/catalogo', catalogoController.obtenerCatalogo);

export default router;