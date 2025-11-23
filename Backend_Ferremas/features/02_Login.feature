Feature: F02 Login

  Scenario: CP06 Login correcto
    Given el usuario accede a la pagina de login
    When ingreso email de login "an.salcedo@duocuc.cl"
    And ingreso contraseña de login "Admin.123456789"
    And realizo el envío de los datos de login
    Then aparece un mensaje de ingreso correcto

  Scenario: CP07 Login vacío
    Given el usuario accede a la pagina de login
    When ingreso email de login ""
    And ingreso contraseña de login ""
    And realizo el envío de los datos de login
    Then aparece un mensaje de datos equivocados

  Scenario: CP08 Login user correcto pass incorrecto
    Given el usuario accede a la pagina de login
    When ingreso email de login "an.salcedo@duocuc.cl"
    And ingreso contraseña de login "Contraseñamalo"
    And realizo el envío de los datos de login
    Then aparece un mensaje de datos equivocados

  Scenario: CP09 Login user incorrecto pass incorrecto
    Given el usuario accede a la pagina de login
    When ingreso email de login "adminmalo@adminmalo.com"
    And ingreso contraseña de login "passwordmala"
    And realizo el envío de los datos de login
    Then aparece un mensaje de datos equivocados