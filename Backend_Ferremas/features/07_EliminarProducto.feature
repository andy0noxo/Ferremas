Feature: F05 Eliminar Producto

  Scenario: CP16 Eliminar producto correcto
    Given el usuario accede a la pagina como administrador
    When accede a productos
    And selecciona eliminar producto "Taladro X200"
    And confirma la eliminación
    Then el sistema elimina el registro
    And lo refleja en el catálogo

  Scenario: CP17 Cancelar eliminar producto
    Given el usuario accede a la pagina como administrador
    When accede a productos
    And selecciona eliminar producto "Taladro X200"
    And cancela la eliminación
    Then el sistema no elimina el registro
    And lo refleja en el catálogo
