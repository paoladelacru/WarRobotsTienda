import { Request, Response } from 'express';
import { CompraService } from './compras.service';
import {
    CompraFabricaRequest,
    CompraChatarraRequest,
    ValidarCuponRequest
} from '../../shared/models/compras';

export class ComprasController {

    /**
     * API 04: POST /api/v1/tienda/cupones/validar
     */
    public validarCupon = async (req: Request, res: Response): Promise<void> => {
        try {
            const datos: ValidarCuponRequest = req.body;
            const resultado = CompraService.validarCupon(datos);

            res.status(200).json(resultado);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Error al validar el cupón'
            });
        }
    };

    /**
     * API 02: POST /api/v1/tienda/comprar-fabrica
     */
    public comprarFabrica = async (req: Request, res: Response): Promise<void> => {
        try {
            const datos: CompraFabricaRequest = req.body;
            const resultado = await CompraService.comprarEnFabrica(datos);

            res.status(200).json(resultado);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Error al procesar la compra de fábrica'
            });
        }
    };

    /**
     * API 03: POST /api/v1/tienda/comprar-chatarra
     */
    public comprarChatarra = async (req: Request, res: Response): Promise<void> => {
        try {
            const datos: CompraChatarraRequest = req.body;
            const resultado = await CompraService.comprarEnChatarra(datos);

            res.status(200).json(resultado);
        } catch (error) {
            res.status(400).json({
                error: error instanceof Error ? error.message : 'Error al procesar la compra de chatarra'
            });
        }
    };

    /**
     * API 05: GET /api/v1/tienda/historial/:jugador_id
     */
    public obtenerHistorial = async (req: Request, res: Response): Promise<void> => {
        try {
            const { jugador_id } = req.params;

            if (!jugador_id) {
                res.status(400).json({ error: 'El parámetro jugador_id es obligatorio' });
                return;
            }

            const resultado = CompraService.obtenerHistorial(String(jugador_id));
            res.status(200).json(resultado);
        } catch (error) {
            res.status(500).json({
                error: error instanceof Error ? error.message : 'Error al consultar el historial'
            });
        }
    };
}