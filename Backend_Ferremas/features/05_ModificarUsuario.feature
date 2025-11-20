Feature: F08 Modificar Usuario

  Scenario: CP27 Modificar usuario correcto
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    And click en modificar usuario "Juan Pérez"
    And ingreso nombre "Juan Pérez 2"
    And ingreso contraseña "Contraseña.1234"
    And selecciono rol "Administrador"
    And selecciono sucursal "Sucursal Santiago Centro2"
    And click en crear
    Then aparece mensaje de que usuario modificado exitosamente
    And muestra lista de usuarios

  Scenario: CP28 Modificar usuario con rut duplicado
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña "Contraseña.1234"
    And ingreso rut "19134035-3"
    And selecciono rol "Administrador"
    And selecciono sucursal "Sucursal Santiago Centro2"
    And click en crear
    Then aparece mensaje de que el rut ya esta registrado

  Scenario: CP29 Modificar usuario con rut vacio
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña "Contraseña.1234"
    And ingreso rut ""
    And selecciono rol "Administrador"
    And selecciono sucursal "Sucursal Santiago Centro"
    And click en crear
    Then aparece mensaje de que falta ingresar el rut

  Scenario: CP30 Modificar usuario con mail duplicado
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña "Contraseña.1234"
    And ingreso email "an.salcedo@duocuc.cl"
    And selecciono rol "Administrador"
    And selecciono sucursal "Sucursal Santiago Centro"
    And click en crear
    Then aparece mensaje de que el email ya esta registrado

  Scenario: CP31 Modificar usuario con mail vacio
    Given el usuario accede a la pagina como administrador
    When accede al listado de usuario
    And click en modificar usuario "Juan Pérez"
    And ingreso contraseña "Contraseña.1234"
    And ingreso email ""
    And selecciono rol "Administrador"
    And selecciono sucursal "Sucursal Santiago Centro"
    And click en crear
    Then aparece mensaje de que falta ingresar el email
