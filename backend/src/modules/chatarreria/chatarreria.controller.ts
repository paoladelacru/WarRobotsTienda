import { Request, Response } from 'express';
import { ChatarraService } from './chatarreria.services';
import { Types } from 'mongoose'


export class ChatarreriaController {
    public async comprarChatarra(req: Request, res: Response): Promise<void> {
        try {
            const { jugador_id, item_chatarra_id } = req.body
            if (!jugador_id || !item_chatarra_id) {
                res.status(400).json({ error: 'Faltan campos: jugador_id o item_chatarra_id' })
                return
            }
            const transaccion = await ChatarraService.procesarTransaccionChatarra(jugador_id, item_chatarra_id)
            res.status(200).json(transaccion)
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : 'Error al comprar chatarra' })
        }
    }

    public async reabastecerInventario(req: Request, res: Response): Promise<void> {
        try {
            const { sku, unidades_nuevas } = req.body
            if (!sku || !unidades_nuevas) {
                res.status(400).json({ error: 'Faltan campos: sku o unidades_nuevas' })
                return
            }
            const reabastecer = await ChatarraService.reabastecerInventario(sku, unidades_nuevas)
            res.status(200).json(reabastecer)
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : 'Error al reabastecer inventario' })
        }
    }

    public async webhookEmbargo(req: Request, res: Response): Promise<void> {
        try {
            const { robot_id, piezas_embargadas } = req.body
            if (!robot_id || !piezas_embargadas) {
                res.status(400).json({ error: 'Faltan campos: robot_id o piezas_embargadas' })
                return
            }
            const embargo = await ChatarraService.webhookChatarra(robot_id, piezas_embargadas)
            res.status(200).json(embargo)
        } catch (error) {
            res.status(400).json({ error: error instanceof Error ? error.message : 'Error al convertir la pieza ' })
        }
    }
}