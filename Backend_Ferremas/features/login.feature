Feature: F01 Login

  Scenario: CP01 Login correcto
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario 'an.salcedo@duocuc.cl'
    And ingreso como clave 'Admin.123456789'
    And realizo el envío de los datos
    Then aparece un mensaje de ingreso correcto

  Scenario: CP02 Login vacío
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario ''
    And ingreso como clave ''
    And realizo el envío de los datos
    Then aparece un mensaje de datos equivocados

  Scenario: CP03 Login user correcto pass incorrecto
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario 'an.salcedo@duocuc.cl'
    And ingreso como clave 'Contrase�amalo'
    And realizo el envío de los datos
    Then aparece un mensaje de datos equivocados

  Scenario: CP04 Login user incorrecto pass incorrecto
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario 'adminmalo'
    And ingreso como clave 'passwordmala'
    And realizo el envío de los datos
    Then aparece un mensaje de datos equivocados