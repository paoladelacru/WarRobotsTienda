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
}