import { Router } from 'express';
import { ComprasController } from './compras.controller';

const router = Router();
const controller = new ComprasController();

router.post('/comprar-fabrica', controller.comprarFabrica);
router.post('/comprar-chatarra', controller.comprarChatarra);
router.post('/cupones/validar', controller.validarCupon);
router.get('/historial/:jugador_id', controller.obtenerHistorial);

export default router;