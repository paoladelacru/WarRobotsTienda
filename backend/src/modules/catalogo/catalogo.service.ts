import { Producto } from '../../shared/models/producto';

export interface FiltrosCatalogo {
    tipo?: string;
    es_chatarra?: boolean;
    precio_max?: number;
    busqueda?: string;
}

export interface RespuestaCatalogo {
    items: Producto[];
    total: number;
}

export class CatalogoService {
    /**
   * Calcula el descuento y precio final para ítems de La Chatarrería
   * Regla oficial: 50% base + rebaja proporcional según desgaste (HP perdido).
   * Tope máximo: 80% de descuento.
   */
    public static calcularPrecioChatarra(producto: Producto): Producto {
        if (!producto.es_chatarra) {
            return {
                ...producto,
                descuento_porcentaje: 0,
                precio_final: producto.precio_lista
            };
        }

        const durabilidadMax = producto.durabilidad_max || 100;
        const durabilidadActual = producto.durabilidad_actual;

        // Proporción de daño recibido (0 = intacto, 1 = totalmente destruido)
        const factorDesgaste = Math.max(0, 1 - (durabilidadActual / durabilidadMax));

        // 50% base + hasta un 30% adicional por desgaste = máximo 80%
        const descuentoCalculado = Math.min(80, Math.round(50 + (factorDesgaste * 30)));

        const precioFinal = Math.round(producto.precio_lista * (1 - descuentoCalculado / 100));
        return {
            ...producto,
            descuento_porcentaje: descuentoCalculado,
            precio_final: precioFinal
        };
    }
    /**
     * Filtra una lista de productos según los criterios del contrato de API 01
     */
    public static filtrarProductos(productos: Producto[], filtros: FiltrosCatalogo): RespuestaCatalogo {
        let resultado = [...productos];
        // 1. Filtro por origen (Fábrica vs Chatarrería)
        if (filtros.es_chatarra !== undefined) {
            resultado = resultado.filter(p => p.es_chatarra === filtros.es_chatarra);
        }
        // 2. Filtro por categoría/tipo (chasis, arma, escudo, motor)
        if (filtros.tipo && filtros.tipo.trim() !== '') {
            resultado = resultado.filter(p => p.tipo.toLowerCase() === filtros.tipo!.toLowerCase());
        }
        // 3. Filtro por precio máximo
        if (filtros.precio_max !== undefined && !isNaN(filtros.precio_max)) {
            resultado = resultado.filter(p => p.precio_final <= filtros.precio_max!);
        }
        // 4. Búsqueda por texto (nombre de ítem o de robot)
        if (filtros.busqueda && filtros.busqueda.trim() !== '') {
            const termino = filtros.busqueda.toLowerCase().trim();
            resultado = resultado.filter(p =>
                p.nombre_item.toLowerCase().includes(termino) ||
                (p.nombre_robot && p.nombre_robot.toLowerCase().includes(termino))
            );
        }
        return {
            items: resultado,
            total: resultado.length
        };
    }
}