export interface ProductoFrontend {
    sku: string;
    nombre_item: string;
    nombre_robot?: string;
    tipo: 'chasis' | 'arma' | 'escudo' | 'motor';
    fuerza_bono: number;
    defensa_bono: number;
    durabilidad_max: number;
    durabilidad_actual: number;
    precio_lista: number;
    precio_final: number;
    es_chatarra: boolean;
    descuento_porcentaje: number;
    imagen_url: string;
    descripcion?: string;
    stock_disponible: number;
}

export interface FiltrosFrontend {
    tipo?: string;
    es_chatarra?: boolean;
    precio_max?: number;
    busqueda?: string;
}

export interface RespuestaApiCatalogo {
    items: ProductoFrontend[];
    total: number;
}

export class ApiService {
    private static readonly BASE_URL = 'http://localhost:3000/api/v1/tienda';

    /**
     * Consulta el catálogo de la API de backend con filtros seguros
     */
    public static async obtenerCatalogo(filtros: FiltrosFrontend): Promise<RespuestaApiCatalogo> {
        const params = new URLSearchParams();

        if (filtros.es_chatarra !== undefined) {
            params.append('es_chatarra', String(filtros.es_chatarra));
        }
        if (filtros.tipo && filtros.tipo.trim() !== '') {
            params.append('tipo', filtros.tipo);
        }
        if (filtros.precio_max !== undefined) {
            params.append('precio_max', String(filtros.precio_max));
        }
        if (filtros.busqueda && filtros.busqueda.trim() !== '') {
            params.append('busqueda', filtros.busqueda);
        }

        const url = `${this.BASE_URL}/catalogo?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
        }

        return (await response.json()) as RespuestaApiCatalogo;
    }
    /**
 * API 04: Valida un cupón de descuento en el backend
 */
    public static async validarCupon(cuponCodigo: string, montoCarrito: number): Promise<RespuestaCupon> {
        const response = await fetch(`${this.BASE_URL}/cupones/validar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cupon_codigo: cuponCodigo,
                monto_carrito: montoCarrito
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al validar cupón');
        }
        return data as RespuestaCupon;
    }

    /**
     * API 02: Ejecuta la compra de fábrica en el backend
     */
    public static async comprarEnFabrica(sku: string, cantidad: number, jugadorId: string = 'piloto-nacho'): Promise<RespuestaCompra> {
        const response = await fetch(`${this.BASE_URL}/comprar-fabrica`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jugador_id: jugadorId,
                sku: sku,
                cantidad: cantidad
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al procesar compra de fábrica');
        }
        return data as RespuestaCompra;
    }

    /**
     * API 03: Ejecuta la compra de chatarra en el backend
     */
    public static async comprarEnChatarra(itemChatarraId: string, jugadorId: string = 'piloto-nacho'): Promise<RespuestaCompra> {
        const response = await fetch(`${this.BASE_URL}/comprar-chatarra`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jugador_id: jugadorId,
                item_chatarra_id: itemChatarraId
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al procesar compra de chatarra');
        }
        return data as RespuestaCompra;
    }
}

export interface RespuestaCupon {
    valido: boolean;
    descuento_aplicado: number;
    monto_final: number;
    mensaje?: string;
}

export interface RespuestaCompra {
    transaccion_id: string;
    estado: string;
    saldo?: number;
    origen?: string;
}