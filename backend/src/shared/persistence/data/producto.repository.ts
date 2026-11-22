import fs from 'fs';
import path from 'path';
import { ProductoModel, ProductoDTO } from '../../models/producto.model';

export class ProductoRepository {
  private static seedFilePath = path.join(__dirname, 'productos.json');

  /**
   * Si la colección de MongoDB está vacía, la siembra con los datos iniciales de productos.json
   */
  public static async sembrarDatosSiEstaVacio(): Promise<void> {
    try {
      const cantidad = await ProductoModel.countDocuments();
      if (cantidad === 0 && fs.existsSync(this.seedFilePath)) {
        const rawData = await fs.promises.readFile(this.seedFilePath, 'utf-8');
        const productosIniciales: any[] = JSON.parse(rawData);
        await ProductoModel.insertMany(productosIniciales);
        console.log(`🌱 [Seed]: Se sembraron ${productosIniciales.length} productos en MongoDB (tienda_db)`);
      }
    } catch (error) {
      console.error('Error al sembrar datos en MongoDB:', error);
    }
  }

  /**
   * Obtiene todos los productos directamente desde MongoDB
   */
  public static async obtenerTodos(): Promise<any[]> {
    try {
      await this.sembrarDatosSiEstaVacio();
      return await ProductoModel.find().lean();
    } catch (error) {
      console.error('Error al obtener productos desde MongoDB:', error);
      return [];
    }
  }

  /**
   * Busca un producto por su SKU en MongoDB
   */
  public static async obtenerPorSku(sku: string): Promise<any | null> {
    try {
      return await ProductoModel.findOne({ sku }).lean();
    } catch (error) {
      console.error(`Error al buscar SKU ${sku} en MongoDB:`, error);
      return null;
    }
  }

  /**
   * Inserta o actualiza un producto en MongoDB
   */
  public static async guardarProducto(producto: any): Promise<any | null> {
    try {
      return await ProductoModel.findOneAndUpdate(
        { sku: producto.sku },
        producto,
        { upsert: true, new: true, runValidators: true }
      ).lean();
    } catch (error) {
      console.error('Error al guardar producto en MongoDB:', error);
      return null;
    }
  }

  /**
   * Compatibilidad con Compras: Guarda o actualiza múltiples productos en MongoDB
   */
  public static async guardarTodos(productos: any[]): Promise<boolean> {
    try {
      for (const prod of productos) {
        await this.guardarProducto(prod);
      }
      return true;
    } catch (error) {
      console.error('Error al guardar lista de productos:', error);
      return false;
    }
  }
}