import { Router } from 'express';
import { ChatarreriaController } from './chatarreria.controller';

const router = Router();
const chatarreriaController = new ChatarreriaController();


router.post('/comprar-chatarra', chatarreriaController.comprarChatarra)
router.put('/stock/actualizar', chatarreriaController.reabastecerInventario)
router.post('/eventos/embargo', chatarreriaController.webhookEmbargo)
export default router;