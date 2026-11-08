import fs from 'fs';
import path from 'path';
import { Producto } from '../../models/producto';

export class ProductoRepository {
  private static filePath = path.join(__dirname, 'productos.json');

  /**
   * Lee todos los productos almacenados en el archivo JSON
   */
  public static async obtenerTodos(): Promise<Producto[]> {
    try {
      if (!fs.existsSync(this.filePath)) {
        return [];
      }
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as Producto[];
    } catch (error) {
      console.error('Error al leer productos.json:', error);
      return [];
    }
  }

  /**
   * Guarda o actualiza la lista completa de productos
   */
  public static async guardarTodos(productos: Producto[]): Promise<boolean> {
    try {
      await fs.promises.writeFile(this.filePath, JSON.stringify(productos, null, 2), 'utf-8');
      return true;
    } catch (error) {
      console.error('Error al escribir productos.json:', error);
      return false;
    }
  }

  /**
   * Busca un producto específico por su SKU
   */
  public static async obtenerPorSku(sku: string): Promise<Producto | null> {
    const productos = await this.obtenerTodos();
    return productos.find(p => p.sku === sku) || null;
  }
}