import { ValidarMonto } from '../../shared/decorators/monto.decorator';
import {
    ValidarCuponRequest,
    ValidarCuponResponse,
    CompraFabricaRequest,
    CompraFabricaResponse,
    CompraChatarraRequest,
    CompraChatarraResponse,
    HistorialResponse,
    TransaccionCompra
} from '../../shared/models/compras';
import { ProductoRepository } from '../../shared/persistence/data/producto.repository';

const CUPONES_VALIDOS: Record<string, number> = {
    'WARBOTS10': 10,   // 10% de descuento
    'YISHENG20': 20,   // 20% de descuento especial
    'TITAN50': 50      // 50% de descuento
};

export class CompraService {
    @ValidarMonto('monto_carrito')
    public static validarCupon(datos: ValidarCuponRequest): ValidarCuponResponse {
        const codigo = datos.cupon_codigo.trim().toUpperCase();
        const porcentaje = CUPONES_VALIDOS[codigo]; const montoBase = datos.monto_carrito;

        if (!porcentaje) {
            return {
                valido: false,
                descuento_aplicado: 0,
                monto_final: datos.monto_carrito,
                mensaje: `El cupón '${codigo}' no es valido o ha expirado.`
            };
        }

        const descuento = Math.round((datos.monto_carrito * porcentaje) / 100);
        const nuevoTotal = Math.max(0, datos.monto_carrito - descuento);

        return {
            valido: true,
            descuento_aplicado: descuento,
            monto_final: nuevoTotal,
            mensaje: `Cupón '${codigo}' aplicado con total éxito (-${porcentaje}%).`
        };
    }


    //pasemos al almacenamiento temporal
    private static transacciones: TransaccionCompra[] = [];


    @ValidarMonto('cantidad')
    public static async comprarEnFabrica(datos: CompraFabricaRequest): Promise<CompraFabricaResponse> {

        const producto = await ProductoRepository.obtenerPorSku(datos.sku);

        if (!producto) {
            throw new Error(`El producto con SKU '${datos.sku}' no existe en el catálogo.`);
        }


        if (producto.es_chatarra) {
            throw new Error(`El ítem '${datos.sku}' es de La Chatarrería. Usa la API de compra de chatarra.`);
        }


        if (producto.stock_disponible < datos.cantidad) {
            throw new Error(`Stock insuficiente. Disponibles: ${producto.stock_disponible}, solicitados: ${datos.cantidad}`);
        }


        const costoTotal = producto.precio_final * datos.cantidad;


        producto.stock_disponible -= datos.cantidad;
        const todosLosProductos = await ProductoRepository.obtenerTodos();
        const index = todosLosProductos.findIndex(p => p.sku === producto.sku);
        if (index !== -1) {
            todosLosProductos[index] = producto;
            await ProductoRepository.guardarTodos(todosLosProductos);
        }


        const transaccionId = `TX-FAB-${Date.now()}`;
        const nuevaTransaccion: TransaccionCompra = {
            transaccion_id: transaccionId,
            jugador_id: datos.jugador_id,
            sku: datos.sku,
            cantidad: datos.cantidad,
            monto: costoTotal,
            fecha: new Date().toISOString(),
            origen: 'FABRICA',
            estado: 'COMPLETADA'
        };
        this.transacciones.push(nuevaTransaccion);

        const saldoSimulado = 1000 - costoTotal;

        console.log(`[Compra Fábrica] Compra exitosa. Transacción: ${transaccionId}, Monto: $${costoTotal}`);

        return {
            transaccion_id: transaccionId,
            estado: 'COMPLETADA',
            saldo: saldoSimulado >= 0 ? saldoSimulado : 0
        };
    }

    public static async comprarEnChatarra(datos: CompraChatarraRequest): Promise<CompraChatarraResponse> {

        const todosLosProductos = await ProductoRepository.obtenerTodos();
        const producto = todosLosProductos.find(p =>
            p.sku === datos.item_chatarra_id || String(p._id) === datos.item_chatarra_id
        );

        if (!producto) {
            throw new Error(`La pieza de chatarra con ID'${datos.item_chatarra_id}' no fue encontrada.`);
        }

        if (!producto.es_chatarra) {
            throw new Error(`El ítem '${producto.sku}' no es chatarra. Usa la API de compra de fábrica.`);
        }

        if (producto.stock_disponible <= 0) {
            throw new Error(`La pieza de chatarra con ID '${producto.sku}' ya fue vendida.`);
        }

        producto.stock_disponible -= 1;
        const index = todosLosProductos.findIndex(p => p.sku === producto.sku);
        if (index !== -1) {
            todosLosProductos[index] = producto;
            await ProductoRepository.guardarTodos(todosLosProductos);
        }

        const transaccionId = `TX-CHAT-${Date.now()}`;
        const nuevaTransaccion: TransaccionCompra = {
            transaccion_id: transaccionId,
            jugador_id: datos.jugador_id,
            sku: producto.sku,
            cantidad: 1,
            monto: producto.precio_final,
            fecha: new Date().toISOString(),
            origen: 'CHATARRA',
            estado: 'COMPLETADA'
        };
        this.transacciones.push(nuevaTransaccion);
        console.log(`[Compra Chatarra] Compra exitosa. Transacción: ${transaccionId}, Pieza: ${producto.sku}`);

        return {
            transaccion_id: transaccionId,
            origen: 'CHATARRERIA',
            estado: 'COMPLETADA'
        };
    }

    public static obtenerHistorial(jugador_id: string): HistorialResponse {
        const comprasDelJugador = this.transacciones.filter(t => t.jugador_id === jugador_id && t.estado === 'COMPLETADA').map(t => ({
            sku: t.sku,
            fecha: t.fecha,
            monto: t.monto
        }));

        return {
            compras: comprasDelJugador
        };
    }
}
