import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export const TiposProducto = ['chasis', 'arma', 'escudo', 'motor'] as const;

// 1. Esquema oficial de la colección "productos" para tienda_db
const productoSchema = new Schema(
    {
        sku: {
            type: String,
            required: [true, 'El SKU es obligatorio'],
            unique: true,
            trim: true
        },
        nombre_item: {
            type: String,
            required: [true, 'El nombre comercial del ítem es obligatorio'],
            trim: true
        },
        nombre_robot: {
            type: String,
            required: false,
            trim: true
        },
        tipo: {
            type: String,
            required: [true, 'El tipo de componente es obligatorio'],
            enum: TiposProducto
        },
        fuerza_bono: {
            type: Number,
            required: true,
            min: [0, 'La fuerza no puede ser negativa'],
            max: [200, 'La fuerza máxima es 200'],
            default: 0
        },
        defensa_bono: {
            type: Number,
            required: true,
            min: [0, 'La defensa no puede ser negativa'],
            max: [200, 'La defensa máxima es 200'],
            default: 0
        },
        durabilidad_max: {
            type: Number,
            required: true,
            default: 100.0
        },
        durabilidad_actual: {
            type: Number,
            required: true,
            min: 0,
            max: 100.0
        },
        precio_lista: {
            type: Number,
            required: [true, 'El precio de lista es obligatorio'],
            min: [1, 'El precio debe ser mayor a 0']
        },
        precio_final: {
            type: Number,
            required: true
        },
        es_chatarra: {
            type: Boolean,
            required: true,
            default: false
        },
        descuento_porcentaje: {
            type: Number,
            required: true,
            min: 0,
            max: 80,
            default: 0
        },
        imagen_url: {
            type: String,
            required: [true, 'La URL de la imagen es obligatoria'],
            trim: true
        },
        descripcion: {
            type: String,
            required: false,
            trim: true
        },
        stock_disponible: {
            type: Number,
            required: true,
            min: [0, 'El stock no puede ser negativo'],
            default: 1
        }
    },
    {
        timestamps: true, // Registra createdAt y updatedAt automáticamente
        versionKey: false
    }
);

// 2. Inferencia de tipos de TypeScript (Estándar de la guía de Yisheng)
export type ProductoDTO = InferSchemaType<typeof productoSchema>;
export type ProductoDocument = HydratedDocument<ProductoDTO>;

// 3. Modelo exportado para interactuar con MongoDB
export const ProductoModel = model<ProductoDTO>('Producto', productoSchema);