Feature: F02 Registrar Producto

  Scenario: CP05 Registrar producto correcto
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de producto
    And ingreso nombre "Producto1"
    And ingreso descripción "Producto1"
    And ingreso precio "11000"
    And selecciono marca "Bosch"
    And selecciono categoria "Herramientas Eléctricas"
    Then el sistema guarda el producto
    And lo muestra en el catálogo

  Scenario: CP06 Registrar producto vacío
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de producto
    And ingreso nombre ""
    And ingreso descripción ""
    And ingreso precio ""
    And selecciono marca ""
    And selecciono categoria ""
    Then aparece mensaje de datos faltantes

  Scenario: CP07 Registrar producto con precio negativo
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de producto
    And ingreso nombre "Producto2"
    And ingreso descripción "Producto2"
    And ingreso precio "-1"
    And selecciono marca "Bosch"
    And selecciono categoria "Herramientas Eléctricas"
    Then aparece mensaje de valor debe ser mayor a 0

  Scenario: CP08 Registrar producto con precio 0
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de producto
    And ingreso nombre "Producto2"
    And ingreso descripción "Producto2"
    And ingreso precio "0"
    And selecciono marca "Bosch"
    And selecciono categoria "Herramientas Eléctricas"
    Then aparece mensaje de valor debe ser mayor a 0
