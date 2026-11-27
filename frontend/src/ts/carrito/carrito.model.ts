import { ProductoFrontend } from '../shared/api.service';


export interface ItemCarrito {
    producto: ProductoFrontend;
    cantidad: number;
}


export interface ResumenCarrito {
    items: ItemCarrito[];
    totalBruto: number;       // Suma de todos los productos sin descuento
    descuento: number;        // Monto descontado mediante cupón (API 04)
    totalNeto: number;        // Total final a pagar en créditos
    cantidadTotal: number;    // Total de unidades (para el contador del icono 🛒)
    cuponCodigo?: string;     // Código de cupón activo si fue aplicado
}