const db = require('./src/models');

async function checkAndFixStock() {
    try {
        console.log("Conectando a la base de datos...");
        
        // Productos que intentamos comprar en el flujo (IDs 1 y 2)
        const productosIds = [1, 2];
        const sucursalId = 1; // La sucursal por defecto para despachos

        for (const productoId of productosIds) {
            let stock = await db.Stock.findOne({
                where: {
                    producto_id: productoId,
                    sucursal_id: sucursalId
                }
            });

            if (!stock) {
                console.log(`Creando stock para producto ${productoId} en sucursal ${sucursalId}`);
                await db.Stock.create({
                    producto_id: productoId,
                    sucursal_id: sucursalId,
                    cantidad: 100 // Stock inicial generoso
                });
            } else {
                console.log(`Stock actual para producto ${productoId}: ${stock.cantidad}`);
                if (stock.cantidad < 10) {
                    console.log(`Actualizando stock para producto ${productoId}...`);
                    stock.cantidad = 100;
                    await stock.save();
                }
            }
        }
        
        console.log("¡Stock actualizado correctamente!");

    } catch (error) {
        console.error("Error actualizando stock:", error);
    } finally {
        process.exit();
    }
}

checkAndFixStock();