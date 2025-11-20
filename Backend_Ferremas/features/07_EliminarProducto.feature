Feature: F07 Eliminar Producto

  Scenario: CP16 Eliminar producto correcto
    Given el usuario accede a la pagina de eliminar producto como administrador
    When accede al listado de productos para eliminar
    And selecciona eliminar producto "Taladro X200"
    And confirma la eliminación de producto
    Then el sistema elimina el registro de producto correctamente
    And lo refleja en el catálogo de productos

  Scenario: CP17 Cancelar eliminar producto
    Given el usuario accede a la pagina de eliminar producto como administrador
    When accede al listado de productos para eliminar
    And selecciona eliminar producto "Taladro X200"
    And cancela la eliminación de producto
    Then muestra lista de productos tras cancelar eliminación
    And el producto no es eliminado del catálogo de productos
