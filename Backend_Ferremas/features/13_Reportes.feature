Feature: F13 Reportes

  Scenario: CP41 Generar informe ventas mensual
    Given el usuario accede a la pagina como administrador
    When accede a Informe Ventas Mensual
    And selecciona sucursal "Sucursal Santiago Centro"
    And click en crear
    Then muestra informe de ventas del mes
