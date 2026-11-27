import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

export interface AppConfig {
    port: number;
    nodeEnv: string;
    allowedOrigins: string[];
    mongoUri: string;
}

const {
    PORT = '3000',
    NODE_ENV = 'development',
    ALLOWED_ORIGINS = 'http://localhost:5173,http://localhost:3000',
    MONGO_URI = 'mongodb://localhost:27017/tienda_db'
} = process.env;

export const config: AppConfig = {
    port: parseInt(PORT, 10),
    nodeEnv: NODE_ENV,
    allowedOrigins: ALLOWED_ORIGINS.split(',').map(o => o.trim()),
    mongoUri: MONGO_URI
};

/**
 * Conexión asíncrona tipada a MongoDB con Mongoose
 */
export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 2000 });
        console.log('🍃 [MongoDB]: Conectado exitosamente a tienda_db local (Docker)');
    } catch (error) {
        console.warn('⚠️ [MongoDB]: Servidor MongoDB no disponible. Operando en modo local seguro con productos.json.');
    }
}