Feature: F06 Carrito de compras

  Scenario: CP18 Agregar al carrito
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    Then el sistema actualiza el carrito con el producto

  Scenario: CP19 Calcular total carrito
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    And accede a mi pedido
    Then el sistema actualiza el carrito con el producto y subtotal

  Scenario: CP20 Seleccionar método pago
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    And accede a mi pedido
    And selecciona metodo de pago "Credito"
    Then el sistema actualiza el carrito con el producto y subtotal

  Scenario: CP21 Seleccionar sucursal entrega
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    And accede a mi pedido
    And selecciona sucursal "Sucursal Santiago centro2"
    Then el sistema actualiza el carrito con el producto y subtotal
