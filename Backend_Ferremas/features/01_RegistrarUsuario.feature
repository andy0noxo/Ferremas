Feature: F01 Registrar Usuario

  Scenario: CP01a Registrar usuario correcto
    Given el usuario accede a la pagina de registro de usuario como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre de usuario "Cliente"
    And ingreso email de usuario "cliente@cliente.com"
    And ingreso contraseña de usuario "Cliente.1234"
    And ingreso rut de usuario "12345678-8"
    And selecciono rol de usuario "Cliente"
    And click en crear usuario
    Then usuario se crea correctamente
    And aparece en la lista de usuarios

  Scenario: CP01b Registrar usuario bodeguero correcto
    Given el usuario accede a la pagina de registro de usuario como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre de usuario "Bodeguero"
    And ingreso email de usuario "bodeguero@bodeguero.com"
    And ingreso contraseña de usuario "Bodeguero.1234"
    And ingreso rut de usuario "12345678-6"
    And selecciono rol de usuario "Bodeguero"
    And click en crear usuario
    Then usuario se crea correctamente
    And aparece en la lista de usuarios

  Scenario: CP02 Registrar usuario con mail duplicado
    Given el usuario accede a la pagina de registro de usuario como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre de usuario "mailduplicado"
    And ingreso email de usuario "an.salcedo@duocuc.cl"
    And ingreso contraseña de usuario "Mailduplicado.1234"
    And ingreso rut de usuario "12345678-5"
    And selecciono rol de usuario "Vendedor"
    And click en crear usuario
    Then aparece mensaje de mail ya registrado

  Scenario: CP03 Registrar usuario con mail vacio
    Given el usuario accede a la pagina de registro de usuario como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre de usuario "mailvacio"
    And ingreso email de usuario ""
    And ingreso contraseña de usuario "Mailvacio.1234"
    And ingreso rut de usuario "12345678-3"
    And selecciono rol de usuario "Vendedor"
    And click en crear usuario
    Then aparece mensaje de que falta ingresar email

  Scenario: CP04 Registrar usuario con rut duplicado
    Given el usuario accede a la pagina de registro de usuario como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre de usuario "rutduplicado"
    And ingreso email de usuario "rutduplicado@rutduplicado.com"
    And ingreso contraseña de usuario "Rutduplicado.1234"
    And ingreso rut de usuario "19134035-3"
    And selecciono rol de usuario "Vendedor"
    And click en crear usuario
    Then aparece mensaje de que el rut ya esta registrado

  Scenario: CP05 Registrar usuario con rut vacio
    Given el usuario accede a la pagina de registro de usuario como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre de usuario "rutvacio"
    And ingreso email de usuario "rutvacio@rutvacio.com"
    And ingreso contraseña de usuario "Rutvacio.1234"
    And ingreso rut de usuario ""
    And selecciono rol de usuario "Vendedor"
    And click en crear usuario
    Then aparece mensaje de que falta ingresar el rut
