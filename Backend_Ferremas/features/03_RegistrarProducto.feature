Feature: F03 Registrar Producto

  Scenario: CP05 Registrar producto correcto
    Given el usuario accede a la pagina de registro de producto como administrador
    When accede al formulario de registro de producto
    And ingreso nombre de producto "Producto1"
    And ingreso descripción de producto "Producto1"
    And ingreso precio de producto "11000"
    And selecciono marca de producto "Bosch"
    And selecciono categoria de producto "Herramientas Eléctricas"
    Then el sistema guarda el producto correctamente
    And lo muestra en el catálogo de productos

  Scenario: CP06 Registrar producto vacío
    Given el usuario accede a la pagina de registro de producto como administrador
    When accede al formulario de registro de producto
    And ingreso nombre de producto ""
    And ingreso descripción de producto ""
    And ingreso precio de producto ""
    And selecciono marca de producto ""
    And selecciono categoria de producto ""
    Then aparece mensaje de datos faltantes en producto

  Scenario: CP07 Registrar producto con precio negativo
    Given el usuario accede a la pagina de registro de producto como administrador
    When accede al formulario de registro de producto
    And ingreso nombre de producto "Producto2"
    And ingreso descripción de producto "Producto2"
    And ingreso precio de producto "-1"
    And selecciono marca de producto "Bosch"
    And selecciono categoria de producto "Herramientas Eléctricas"
    Then aparece mensaje de valor debe ser mayor a 0 en producto

  Scenario: CP08 Registrar producto con precio 0
    Given el usuario accede a la pagina de registro de producto como administrador
    When accede al formulario de registro de producto
    And ingreso nombre de producto "Producto2"
    And ingreso descripción de producto "Producto2"
    And ingreso precio de producto "0"
    And selecciono marca de producto "Bosch"
    And selecciono categoria de producto "Herramientas Eléctricas"
    Then aparece mensaje de valor debe ser mayor a 0 en producto
