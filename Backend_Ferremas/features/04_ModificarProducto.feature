Feature: F03 Modificar Producto

  Scenario: CP09 Modificar producto correcto
    Given el usuario accede a la pagina como administrador
    When accede al formulario de modificar producto
    And ingreso nombre "Producto4"
    Then el sistema guarda la modificación del producto
    And lo muestra en el catálogo

  Scenario: CP10 Modificar producto vacío
    Given el usuario accede a la pagina como administrador
    When accede al formulario de modificar producto
    And ingreso nombre ""
    And ingreso descripción ""
    And ingreso precio ""
    And selecciono marca ""
    And selecciono categoria ""
    Then aparece mensaje de datos faltantes

  Scenario: CP11 Modificar producto con precio negativo
    Given el usuario accede a la pagina como administrador
    When accede al formulario de modificar producto
    And ingreso precio "-1"
    Then aparece mensaje de valor debe ser mayor a 0

  Scenario: CP12 Modificar producto con precio 0
    Given el usuario accede a la pagina como administrador
    When accede al formulario de modificar producto
    And ingreso precio "0"
    Then aparece mensaje de valor debe ser mayor a 0
