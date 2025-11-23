Feature: F05 Modificar Usuario

  Scenario: CP18 Modificar usuario correcto
    Given el usuario accede a la pagina de modificar usuario como administrador
    When accede al listado de usuario para modificar
    And click en modificar usuario "Juan Pérez"
    And ingreso nombre de usuario modificado "Juan Pérez 2"
    And ingreso contraseña de usuario modificado "Contraseña.1234"
    And selecciono rol de usuario modificado "Administrador"
    And selecciono sucursal de usuario modificado "Sucursal Santiago Centro2"
    And click en crear usuario modificado
    Then aparece mensaje de que usuario modificado exitosamente
    And muestra lista de usuarios modificados

  Scenario: CP19 Modificar usuario con rut duplicado
    Given el usuario accede a la pagina de modificar usuario como administrador
    When accede al listado de usuario para modificar
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña de usuario modificado "Contraseña.1234"
    And ingreso rut de usuario modificado "19134035-3"
    And selecciono rol de usuario modificado "Administrador"
    And selecciono sucursal de usuario modificado "Sucursal Santiago Centro2"
    And click en crear usuario modificado
    Then aparece mensaje de que el rut ya esta registrado en usuario modificado

  Scenario: CP20 Modificar usuario con rut vacio
    Given el usuario accede a la pagina de modificar usuario como administrador
    When accede al listado de usuario para modificar
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña de usuario modificado "Contraseña.1234"
    And ingreso rut de usuario modificado ""
    And selecciono rol de usuario modificado "Administrador"
    And selecciono sucursal de usuario modificado "Sucursal Santiago Centro"
    And click en crear usuario modificado
    Then aparece mensaje de que falta ingresar el rut en usuario modificado

  Scenario: CP21 Modificar usuario con mail duplicado
    Given el usuario accede a la pagina de modificar usuario como administrador
    When accede al listado de usuario para modificar
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña de usuario modificado "Contraseña.1234"
    And ingreso email de usuario modificado "an.salcedo@duocuc.cl"
    And selecciono rol de usuario modificado "Administrador"
    And selecciono sucursal de usuario modificado "Sucursal Santiago Centro"
    And click en crear usuario modificado
    Then aparece mensaje de que el email ya esta registrado en usuario modificado

  Scenario: CP22 Modificar usuario con mail vacio
    Given el usuario accede a la pagina de modificar usuario como administrador
    When accede al listado de usuario para modificar
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña de usuario modificado "Contraseña.1234"
    And ingreso email de usuario modificado ""
    And selecciono rol de usuario modificado "Administrador"
    And selecciono sucursal de usuario modificado "Sucursal Santiago Centro"
    And click en crear usuario modificado
    Then aparece mensaje de que falta ingresar el email en usuario modificado
