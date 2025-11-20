Feature: F07 Registrar Usuario

  Scenario: CP22 Registrar usuario correcto
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre "Cliente"
    And ingreso email "cliente@cliente.com"
    And ingreso contraseña "Cliente.1234"
    And ingreso rut "12345678-8"
    And selecciono rol "Cliente"
    And click en crear
    Then usuario se crea
    And aparece en la lista de usuarios

  Scenario: CP22b Registrar usuario bodeguero correcto
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre "Bodeguero"
    And ingreso email "bodeguero@bodeguero.com"
    And ingreso contraseña "Bodeguero.1234"
    And ingreso rut "12345678-6"
    And selecciono rol "Bodeguero"
    And click en crear
    Then usuario se crea
    And aparece en la lista de usuarios

  Scenario: CP23 Registrar usuario con mail duplicado
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre "mailduplicado"
    And ingreso email "an.salcedo@duocuc.cl"
    And ingreso contraseña "Mailduplicado.1234"
    And ingreso rut "12345678-5"
    And selecciono rol "Vendedor"
    And click en crear
    Then aparece mensaje de mail ya registrado

  Scenario: CP24 Registrar usuario con mail vacio
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre "mailvacio"
    And ingreso email ""
    And ingreso contraseña "Mailvacio.1234"
    And ingreso rut "12345678-3"
    And selecciono rol "Vendedor"
    And click en crear
    Then aparece mensaje de que falta ingresar email

  Scenario: CP25 Registrar usuario con rut duplicado
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre "rutduplicado"
    And ingreso email "rutduplicado@rutduplicado.com"
    And ingreso contraseña "Rutduplicado.1234"
    And ingreso rut "19134035-3"
    And selecciono rol "Vendedor"
    And click en crear
    Then aparece mensaje de que el rut ya esta registrado

  Scenario: CP26 Registrar usuario con rut vacio
    Given el usuario accede a la pagina como administrador
    When accede al formulario de registro de usuario
    And ingreso nombre "rutvacio"
    And ingreso email "rutvacio@rutvacio.com"
    And ingreso contraseña "Rutvacio.1234"
    And ingreso rut ""
    And selecciono rol "Vendedor"
    And click en crear
    Then aparece mensaje de que falta ingresar el rut
