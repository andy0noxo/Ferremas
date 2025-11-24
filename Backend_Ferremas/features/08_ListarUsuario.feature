Feature: F08 Listar Usuario

  Scenario: CP27 Listar usuario completo
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    Then muestra listado de todos los usuarios registrados
