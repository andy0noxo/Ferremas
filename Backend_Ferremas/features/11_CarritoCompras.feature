Feature: F11 Carrito de compras

  Scenario: CP35 Agregar al carrito
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    Then el sistema actualiza el carrito con el producto

  Scenario: CP36 Calcular total carrito
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    And accede a mi pedido
    Then el sistema actualiza el carrito con el producto y subtotal

  Scenario: CP37 Seleccionar método pago
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    And accede a mi pedido
    And selecciona metodo de pago "Credito"
    Then el sistema actualiza el carrito con el producto y subtotal

  Scenario: CP38 Seleccionar sucursal entrega
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona un producto "Taladro X200"
    And lo agrega al carrito
    And accede a mi pedido
    And selecciona sucursal "Sucursal Santiago centro2"
    Then el sistema actualiza el carrito con el producto y subtotal
