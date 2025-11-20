Feature: F10 Eliminar Usuario

  Scenario: CP33 Eliminar usuario correcto
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    And click en eliminar usuario "Juan Pérez"
    And click en confirmar
    Then aparece mensaje de usuario eliminado exitosamente
    And el usuario es eliminado de la lista de usuarios registrados

  Scenario: CP34 Cancelar eliminar usuario
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    And click en eliminar usuario "Juan Pérez"
    And click en cancelar
    Then muestra lista de usuarios
    And el usuario no es eliminado de la lista de usuarios registrados
