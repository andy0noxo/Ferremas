Feature: F12 Modificar Stock

  Scenario: CP39 Bodeguero actualiza stock correcto
    Given el usuario accede a la pagina como bodeguero
    When accede a Stock General
    And selecciona actualizar en el producto "Taladro X200"
    And cambia cantidad a "500"
    And presiona enter o hace clic en el botón de actualizar
    Then aparece mensaje de stock actualizado
    And se actualiza el valor del stock en la lista de stock general

  Scenario: CP40 Bodeguero actualiza stock con valor negativo
    Given el usuario accede a la pagina como bodeguero
    When accede a Stock General
    And selecciona actualizar en el producto "Taladro X200"
    And cambia cantidad a "-1"
    And presiona enter o hace clic en el botón de actualizar
    Then aparece mensaje de que el valor debe ser igual o mayor a 0

  Scenario: CP41 Bodeguero actualiza stock con valor 0
    Given el usuario accede a la pagina como bodeguero
    When accede a Stock General
    And selecciona actualizar en el producto "Taladro X200"
    And cambia cantidad a "0"
    And presiona enter o hace clic en el botón de actualizar
    Then aparece mensaje de stock actualizado
    And se actualiza el valor del stock en la lista de stock general
