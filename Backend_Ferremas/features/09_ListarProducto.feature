Feature: F09 Listar Producto

  Scenario: CP29 Listar producto completo
    Given el usuario accede a la pagina como administrador
    When accede a productos
    Then el sistema muestra los productos correspondientes

  Scenario: CP30 Listar producto con filtro categoria
    Given el usuario accede a la pagina como administrador
    When accede a productos
    And selecciona categoria "Herramientas Eléctricas"
    And Click en Filtrar
    Then el sistema muestra los productos correspondientes

  Scenario: CP31 Listar producto con filtro sucursal
    Given el usuario accede a la pagina como administrador
    When accede a productos
    And selecciona sucursal "Sucursal Santiago Centro"
    And Click en Filtrar
    Then el sistema muestra los productos correspondientes
