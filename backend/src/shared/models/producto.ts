import { Types } from 'mongoose'


export const Tipos = ['chasis', 'arma', 'escudo', 'motor'] as const

export interface Producto {
    _id?: Types.ObjectId//
    sku: string//
    nombre_item: string//
    nombre_robot?: string//
    tipo: string//
    fuerza_bono: number//
    defensa_bono: number//
    durabilidad_max: number//
    durabilidad_actual: number//
    precio_lista: number//
    precio_final: number
    es_chatarra: boolean //
    descuento_porcentaje: number//
    imagen_url: string//
    descripcion?: string//
    stock_disponible: number//
}

export type CrearProductoInput = Omit<Producto, '_id' | 'sku' | 'precio_final' | 'es_chatarra'> & {
    _id?: Types.ObjectId
    sku?: string
    precio_final?: number
    es_chatarra?: boolean
}

function generarSku(tipo: string, esChatarra: boolean): string {
    const prefijo = 'SKU'
    let tag = ''
    if (esChatarra) {
        tag = 'CHAT'
    } else {
        tag = tipo.toUpperCase()
    }
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const letraAleatoria = letras[Math.floor(Math.random() * letras.length)]
    const numeroAleatorio = Math.floor(Math.random() * 90) + 10
    const sufijo = `${letraAleatoria}${numeroAleatorio}`

    return `${prefijo}-${tag}-${sufijo}`
}

function esImagenValida(url: string): boolean {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return false;
        }
        const extensionesValidas = /\.(jpg|jpeg|png|webp|gif|svg|glb|gltf)$/i;
        return extensionesValidas.test(parsedUrl.pathname);
    } catch (e) {
        return false;
    }
}

export function crearProducto(producto: CrearProductoInput): Producto {
    const errores: string[] = [
        producto.precio_lista <= 0 ? "El precio debe ser mayor que 0" : "",
        producto.descuento_porcentaje < 0 || producto.descuento_porcentaje > 80 ? "El porcentaje de descuento debe estar entre 0% y 80%" : "",
        producto.durabilidad_actual > 100 || producto.durabilidad_actual < 0 ? "La durabilidad debe estar entre 0 y 100" : "",
        producto.durabilidad_max > 100 || producto.durabilidad_max < 0 ? "La durabilidad maxima debe estar entre 0 y 100" : "",
        producto.durabilidad_actual > producto.durabilidad_max ? "La durabilidad actual no puede ser mayor que la durabilidad maxima" : "",
        !producto.nombre_item || producto.nombre_item.trim().length === 0 ? "El nombre del item es requerido" : "",
        producto.nombre_robot !== undefined && typeof producto.nombre_robot !== 'string' ? "Nombre del robot invalido" : "",
        !Tipos.includes(producto.tipo as any) ? "Tipo invalido" : "",
        producto.defensa_bono < 0 || producto.defensa_bono > 200 ? "Un item solo puede dar entre 0 y 200 puntos de defensa adicionales" : "",
        producto.fuerza_bono < 0 || producto.fuerza_bono > 200 ? "Un item solo puede dar entre 0 y 200 puntos de fuerza adicionales" : "",
        producto.descripcion !== undefined && typeof producto.descripcion !== 'string' ? "Descripcion invalida" : "",
        !esImagenValida(producto.imagen_url) ? "El formato de imagen no es valido" : "",
        producto.stock_disponible < 0 ? "El stock debe ser mayor o igual a 0" : ""
    ].filter(Boolean)

    if (errores.length > 0) {
        throw new Error(`Errores de validación: ${errores.join(" | ")}`);
    }

    const es_chatarra = producto.durabilidad_actual < 75
    const sku = producto.sku ?? generarSku(producto.tipo, es_chatarra)
    const _id = producto._id ?? new Types.ObjectId()
    const precio_final = Number((producto.precio_lista * (1 - producto.descuento_porcentaje / 100)).toFixed(2))

    const nuevoProducto: Producto = {
        ...producto,
        es_chatarra,
        sku,
        _id,
        precio_final
    }

    return Object.freeze({ ...nuevoProducto })
}

// DTOs para las APIs del Módulo 1
export interface FiltroCatalogo {
    tipo?: typeof Tipos[number];
    es_chatarra?: boolean;
    precio_max?: number;
}

export interface RespuestaCatalogo {
    items: Producto[];
    total: number;
}

export interface CompraFabricaPayload {
    jugador_id: string;
    sku: string;
    cantidad: number;
}

export interface CompraChatarraPayload {
    jugador_id: string;
    item_chatarra_id: string;
}

export interface CuponValidacion {
    cupon_codigo: string;
    monto_carrito: number;
}