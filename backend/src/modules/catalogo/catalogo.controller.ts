import { Request, Response } from 'express';
import { CatalogoService, FiltrosCatalogo, RespuestaCatalogo } from './catalogo.service';
import { ProductoRepository } from '../../shared/persistence/data/producto.repository';
import { LogBusqueda } from '../../shared/decorators/busqueda.decorator';

export class CatalogoController {
    /**
     * Método que ejecuta la búsqueda con auditoría AOP
     */
    @LogBusqueda()
    public async procesarBusqueda(filtros: FiltrosCatalogo): Promise<RespuestaCatalogo> {
        // 1. Obtener todos los productos de la persistencia
        const productosBase = await ProductoRepository.obtenerTodos();

        // 2. Aplicar cálculo de precio y descuentos a los ítems de chatarra
        const productosConPrecios = productosBase.map(p => CatalogoService.calcularPrecioChatarra(p));

        // 3. Aplicar los filtros solicitados
        return CatalogoService.filtrarProductos(productosConPrecios, filtros);
    }

    /**
     * Endpoint Handler para GET /api/v1/tienda/catalogo
     */
    public obtenerCatalogo = async (req: Request, res: Response): Promise<void> => {
        try {
            const { tipo, es_chatarra, precio_max, busqueda } = req.query;

            // Parsear los query params a sus tipos seguros
            const filtros: FiltrosCatalogo = {
                tipo: tipo ? String(tipo) : undefined,
                es_chatarra: es_chatarra !== undefined ? es_chatarra === 'true' : undefined,
                precio_max: precio_max ? Number(precio_max) : undefined,
                busqueda: busqueda ? String(busqueda) : undefined
            };

            // Ejecutar la consulta interceptada por el decorador
            const resultado = await this.procesarBusqueda(filtros);

            res.status(200).json(resultado);
        } catch (error) {
            console.error('Error al obtener catálogo:', error);
            res.status(500).json({
                mensaje: 'Error interno del servidor al consultar el catálogo',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    };
}