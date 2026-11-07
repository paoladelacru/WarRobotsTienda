// Categorías de ítems permitidas en la tienda WAR-BOTS
export type TipoItem = 'chasis' | 'arma' | 'escudo' | 'motor';

// Modelo de datos oficial para productos de la Tienda (Módulo 1)
export interface Producto {
    _id?: string;
    sku: string;                     // ej. 'SKU-LASER-X1' o 'SKU-CHAT-99'
    nombre_item: string;             // Nombre comercial del componente
    nombre_robot?: string;           // Nombre del robot original si proviene de embargo
    tipo: TipoItem;                  // Categoría de la pieza
    fuerza_bono: number;             // Puntos de ataque adicionales (0 a 200)
    defensa_bono: number;            // Puntos de blindaje adicionales (0 a 200)
    durabilidad_max: number;         // HP máximo (100.0)
    durabilidad_actual: number;      // HP actual (100.0 en fábrica; <75.0 en chatarra)
    precio_lista: number;            // Precio base en créditos
    precio_final: number;            // Precio final con descuento aplicado
    es_chatarra: boolean;            // false para Fábrica, true para La Chatarrería
    descuento_porcentaje: number;    // Rebaja (0.0% a 80.0%)
    imagen_url: string;              // URL a la imagen o render 3D
    descripcion?: string;            // Especificaciones o historial
    stock_disponible: number;        // Unidades en inventario (>= 0)
}

// Parámetros de búsqueda para el catálogo (API 01)
export interface FiltroCatalogo {
    tipo?: TipoItem;
    es_chatarra?: boolean;
    precio_max?: number;
}

// Respuesta del catálogo unificado
export interface RespuestaCatalogo {
    items: Producto[];
    total: number;
}

// Payload para compra de producto nuevo en Fábrica (API 02)
export interface CompraFabricaPayload {
    jugador_id: string;
    sku: string;
    cantidad: number;
}

// Payload para compra en La Chatarrería (API 03)
export interface CompraChatarraPayload {
    jugador_id: string;
    item_chatarra_id: string;
}

// Validación de cupones de descuento (API 04)
export interface CuponValidacion {
    cupon_codigo: string;
    monto_carrito: number;
}