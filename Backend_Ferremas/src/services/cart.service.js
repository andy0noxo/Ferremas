const db = require('../models');
const logger = require('../middlewares/logger');

class CartService {
  async validateStock(items, sucursalId) {
    const transaction = await db.sequelize.transaction();
    try {
      const stockInfo = await Promise.all(
        items.map(async item => {
          const stock = await db.Stock.findOne({
            where: {
              producto_id: item.producto_id,
              sucursal_id: sucursalId
            },
            transaction
          });

          return {
            producto_id: item.producto_id,
            cantidad_solicitada: item.cantidad,
            stock_disponible: stock?.cantidad || 0,
            valido: stock?.cantidad >= item.cantidad
          };
        })
      );

      const allValid = stockInfo.every(item => item.valido);
      await transaction.commit();

      return {
        stockInfo,
        allValid
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error validando stock:', error);
      throw error;
    }
  }

  async calculateTotal(items) {
    try {
      const productos = await db.Producto.findAll({
        where: { id: items.map(i => i.producto_id) }
      });

      return items.reduce((total, item) => {
        const producto = productos.find(p => p.id === item.producto_id);
        return total + (producto.precio * item.cantidad);
      }, 0);
    } catch (error) {
      logger.error('Error calculando total del carrito:', error);
      throw error;
    }
  }

  async reserveStock(items, sucursalId) {
    const transaction = await db.sequelize.transaction();
    try {
      await Promise.all(
        items.map(item => 
          db.Stock.decrement('cantidad', {
            by: item.cantidad,
            where: {
              producto_id: item.producto_id,
              sucursal_id: sucursalId
            },
            transaction
          })
        )
      );
      
      await transaction.commit();
      logger.info(`Stock reservado para sucursal ${sucursalId}`);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error reservando stock:', error);
      throw error;
    }
  }

  /**
   * Calcula el total y valida stock de los productos para un pedido
   * @param {Array} items - [{ producto_id, cantidad }]
   * @param {number} sucursalId
   * @returns {Promise<{items: Array, total: number}>}
   */
  async calculateCartTotal(items, sucursalId) {
    // Validar stock
    const stockInfo = await this.validateStock(items, sucursalId);
    if (!stockInfo.allValid) {
      // Adjunta info de stock a cada item
      items = items.map(item => {
        const stock = stockInfo.stockInfo.find(s => s.producto_id === item.producto_id);
        return {
          ...item,
          stockValido: stock ? stock.valido : false
        };
      });
    } else {
      items = items.map(item => ({ ...item, stockValido: true }));
    }
    // Calcular total
    const productos = await db.Producto.findAll({
      where: { id: items.map(i => i.producto_id) }
    });
    const itemsWithPrecio = items.map(item => {
      const producto = productos.find(p => p.id === item.producto_id);
      return {
        ...item,
        precio: producto ? producto.precio : 0
      };
    });
    const total = itemsWithPrecio.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    return { items: itemsWithPrecio, total };
  }
}

module.exports = new CartService();