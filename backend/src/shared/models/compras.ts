export interface TransaccionCompra {
    transaccion_id: string;
    jugador_id: string;
    sku: string;
    cantidad: number;
    monto: number;
    fecha: string;
    origen: 'FABRICA' | 'CHATARRA';
    estado: 'COMPLETADA' | 'RECHAZADA';
}

export interface CompraFabricaRequest {
    jugador_id: string;
    sku: string;
    cantidad: number;
}

export interface CompraFabricaResponse {
    transaccion_id: string;
    estado: string;
    saldo: number;
}

export interface CompraChatarraRequest {
    jugador_id: string;
    item_chatarra_id: string;
}

export interface CompraChatarraResponse {
    transaccion_id: string;
    origen: string;
    estado: string;
}

export interface ValidarCuponRequest {
    cupon_codigo: string;
    monto_carrito: number;
}

export interface ValidarCuponResponse {
    valido: boolean;
    descuento_aplicado: number;
    monto_final: number;
    mensaje?: string;
}

export interface ItemHistorial {
    sku: string;
    fecha: string;
    monto: number;
}

export interface HistorialResponse {
    compras: ItemHistorial[];
}