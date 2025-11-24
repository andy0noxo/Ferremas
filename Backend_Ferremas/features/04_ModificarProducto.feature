Feature: F04 Modificar Producto

  Scenario: CP15 Modificar producto correcto
    Given el usuario accede a la pagina de modificar producto como administrador
    When accede al formulario de modificar producto
    And ingreso nombre de producto modificado "Producto4"
    Then el sistema guarda la modificación del producto correctamente
    And lo muestra en el catálogo de productos

  Scenario: CP16 Modificar producto vacío
    Given el usuario accede a la pagina de modificar producto como administrador
    When accede al formulario de modificar producto
    And ingreso nombre de producto modificado ""
    And ingreso descripción de producto modificado ""
    And ingreso precio de producto modificado ""
    And selecciono marca de producto modificado ""
    And selecciono categoria de producto modificado ""
    Then aparece mensaje de datos faltantes en producto modificado

  Scenario: CP17 Modificar producto con precio negativo
    Given el usuario accede a la pagina de modificar producto como administrador
    When accede al formulario de modificar producto
    And ingreso precio de producto modificado "-1"
    Then aparece mensaje de valor debe ser mayor a 0 en producto modificado

  Scenario: CP18 Modificar producto con precio 0
    Given el usuario accede a la pagina de modificar producto como administrador
    When accede al formulario de modificar producto
    And ingreso precio de producto modificado "0"
    Then aparece mensaje de valor debe ser mayor a 0 en producto modificado
