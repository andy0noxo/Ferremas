Feature: F06 Eliminar Usuario

  Scenario: CP33 Eliminar usuario correcto
    Given el usuario accede a la pagina de eliminar usuario como administrador
    When accede al listado de usuario para eliminar
    And click en eliminar usuario "Juan Pérez"
    And click en confirmar eliminación de usuario
    Then aparece mensaje de usuario eliminado exitosamente
    And el usuario es eliminado de la lista de usuarios registrados

  Scenario: CP34 Cancelar eliminar usuario
    Given el usuario accede a la pagina de eliminar usuario como administrador
    When accede al listado de usuario para eliminar
    And click en eliminar usuario "Juan Pérez"
    And click en cancelar eliminación de usuario
    Then muestra lista de usuarios tras cancelar eliminación
    And el usuario no es eliminado de la lista de usuarios registrados
