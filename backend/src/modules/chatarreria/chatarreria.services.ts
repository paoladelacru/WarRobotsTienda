import { Producto } from '../../shared/models/producto';
import { FiltroCatalogo } from '../../shared/models/producto';
import { RespuestaCatalogo } from '../catalogo/catalogo.service';
import { TransaccionCompra } from '../../shared/models/compras';
import { ProductoRepository } from '../../shared/persistence/data/producto.repository';
import { Types } from 'mongoose'

export interface PiezaEmbargada {
    nombre_item: string;
    tipo: string;
    fuerza_bono?: number;
    defensa_bono?: number;
    durabilidad_actual?: number;
    precio_lista?: number;
    imagen_url?: string;
    descripcion?: string;
    nombre_robot: string
}

export class ChatarraService {
    public static async procesarTransaccionChatarra(jugador_id: string, item_chatarra_id: Types.ObjectId): Promise<TransaccionCompra> {
        const productos = await ProductoRepository.obtenerTodos()
        const producto = productos.find(p => p._id?.toString() === item_chatarra_id.toString())
        if (!producto) {
            throw new Error('El producto de chatarra no existe')
        }
        const costoTotal = producto.precio_final
        if (!producto.es_chatarra) {
            throw new Error('El producto no es chatarra')
        }
        if (producto.stock_disponible <= 0) {
            throw new Error('No hay stock disponible')
        }
        producto.stock_disponible -= 1
        const index = productos.findIndex(p => p.sku === producto.sku)
        if (index !== -1) {
            productos[index] = producto
            await ProductoRepository.guardarTodos(productos)
        }

        const transaccion: TransaccionCompra = {
            transaccion_id: `TX-CHAT-${Date.now()}`,
            jugador_id: jugador_id,
            sku: producto.sku,
            cantidad: 1,
            monto: costoTotal,
            fecha: new Date().toString(),
            origen: 'CHATARRA',
            estado: 'COMPLETADA'
        }
        return transaccion
    }

    public static async reabastecerInventario(sku: string, unidades_nuevas: number): Promise<{ sku: string; nuevo_stock: number }> {
        const productos = await ProductoRepository.obtenerTodos()
        const producto = productos.find(p => p.sku?.toString() === sku.toString())
        if (!producto) {
            throw new Error('El producto no existe ')
        }
        if (unidades_nuevas < 0) {
            throw new Error('La cantidad de unidades a añadir deben ser positivas')
        }
        producto.stock_disponible += unidades_nuevas
        const index = productos.findIndex(p => p.sku === producto.sku)
        if (index !== -1) {
            productos[index] = producto
            await ProductoRepository.guardarTodos(productos)
        }
        return {
            sku: producto.sku,
            nuevo_stock: producto.stock_disponible
        }
    }

    public static async webhookChatarra(robot_id: string, piezas_embargadas: any[]): Promise<{ recibido: boolean }> {
        const productos_act = await ProductoRepository.obtenerTodos()
        piezas_embargadas = piezas_embargadas.map((p: any): Producto => {
            return {
                sku: `SKU-CHAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                nombre_item: p.nombre_item,
                nombre_robot: robot_id,
                tipo: p.tipo,
                fuerza_bono: p.fuerza_bono,
                defensa_bono: p.defensa_bono,
                durabilidad_actual: p.durabilidad_actual,
                durabilidad_max: 100,
                precio_lista: p.precio_lista || 100,
                precio_final: Math.round((p.precio_lista || 100) * 0.5),
                es_chatarra: true,
                descuento_porcentaje: 50,
                imagen_url: p.imagen_url,
                stock_disponible: 1,
                descripcion: p.descripcion
            }
        })
        productos_act.push(...piezas_embargadas)
        await ProductoRepository.guardarTodos(productos_act);
        return { recibido: true }
    }

}



