Feature: F12 Búsqueda de productos

  Scenario: CP36 Búsqueda producto existente
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And escribe "Taladro X200" en la barra de búsqueda
    And presiona enter o hace clic en el botón de filtrar
    Then el sistema muestra los productos que coinciden con la búsqueda

  Scenario: CP37 Búsqueda producto vacío
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And escribe "" en la barra de búsqueda
    And presiona enter o hace clic en el botón de filtrar
    Then el sistema muestra todos los productos

  Scenario: CP38 Búsqueda por categoría
    Given el usuario accede a la pagina como cliente
    When accede a productos
    And selecciona categoria "Herramientas Eléctricas"
    And presiona enter o hace clic en el botón de filtrar
    Then el sistema muestra los productos que coinciden con la búsqueda
