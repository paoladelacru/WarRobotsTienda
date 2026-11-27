import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { ProductoModel, ProductoDTO } from '../../models/producto.model';

export class ProductoRepository {
  private static seedFilePath = path.join(__dirname, 'productos.json');

  /**
   * Si la colección de MongoDB está vacía, la siembra con los datos iniciales de productos.json
   */
  public static async sembrarDatosSiEstaVacio(): Promise<void> {
    try {
      if (mongoose.connection.readyState === 1) {
        const cantidad = await ProductoModel.countDocuments();
        if (cantidad === 0 && fs.existsSync(this.seedFilePath)) {
          const rawData = await fs.promises.readFile(this.seedFilePath, 'utf-8');
          const productosIniciales: any[] = JSON.parse(rawData);
          await ProductoModel.insertMany(productosIniciales);
          console.log(`🌱 [Seed]: Se sembraron ${productosIniciales.length} productos en MongoDB (tienda_db)`);
        }
      }
    } catch (error) {
      console.warn('Advertencia al sembrar datos en MongoDB:', error);
    }
  }

  /**
   * Obtiene todos los productos directamente desde MongoDB o desde productos.json si MongoDB no está activo
   */
  public static async obtenerTodos(): Promise<any[]> {
    try {
      if (mongoose.connection.readyState === 1) {
        await this.sembrarDatosSiEstaVacio();
        return await ProductoModel.find().lean();
      }
    } catch (error) {
      console.warn('MongoDB no disponible, recurriendo a productos.json');
    }

    // Fallback seguro a productos.json
    try {
      if (fs.existsSync(this.seedFilePath)) {
        const rawData = await fs.promises.readFile(this.seedFilePath, 'utf-8');
        return JSON.parse(rawData);
      }
    } catch (e) {
      console.error('Error al leer productos.json:', e);
    }
    return [];
  }

  /**
   * Busca un producto por su SKU en MongoDB o en productos.json
   */
  public static async obtenerPorSku(sku: string): Promise<any | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await ProductoModel.findOne({ sku }).lean();
      }
    } catch (error) {
      console.warn(`Error al buscar SKU ${sku} en MongoDB:`, error);
    }

    const productos = await this.obtenerTodos();
    return productos.find(p => p.sku === sku) || null;
  }

  /**
   * Inserta o actualiza un producto en MongoDB
   */
  public static async guardarProducto(producto: any): Promise<any | null> {
    try {
      if (mongoose.connection.readyState === 1) {
        return await ProductoModel.findOneAndUpdate(
          { sku: producto.sku },
          producto,
          { upsert: true, new: true, runValidators: true }
        ).lean();
      }
    } catch (error) {
      console.warn('Error al guardar producto en MongoDB:', error);
    }
    return null;
  }

  /**
   * Compatibilidad con Compras: Guarda o actualiza múltiples productos en MongoDB y en productos.json
   */
  public static async guardarTodos(productos: any[]): Promise<boolean> {
    try {
      if (mongoose.connection.readyState === 1) {
        for (const prod of productos) {
          await this.guardarProducto(prod);
        }
      }
    } catch (error) {
      console.warn('Error al guardar lista en MongoDB:', error);
    }

    try {
      await fs.promises.writeFile(this.seedFilePath, JSON.stringify(productos, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error('Error al guardar en productos.json:', e);
      return false;
    }
  }
}