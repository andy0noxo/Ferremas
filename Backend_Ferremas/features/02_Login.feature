Feature: F02 Login

  Scenario: CP06 Login email y password correcto
    Given el usuario accede a la pagina de login
    When ingreso email de login "an.salcedo@duocuc.cl"
    And ingreso contraseña de login "Admin.123456789"
    And realizo el envío de los datos de login
    Then aparece un mensaje de ingreso correcto

  Scenario: CP07 Login email vacío y password correcto
    Given el usuario accede a la pagina de login
    When ingreso email de login ""
    And ingreso contraseña de login "Admin.123456789"
    And realizo el envío de los datos de login
    Then aparece un mensaje de datos equivocados

  Scenario: CP08 Login email correcto password vacío
    Given el usuario accede a la pagina de login
    When ingreso email de login "an.salcedo@duocuc.cl"
    And ingreso contraseña de login ""
    And realizo el envío de los datos de login
    Then aparece un mensaje de datos equivocados

  Scenario: CP09 Login email incorrecto password correcto
    Given el usuario accede a la pagina de login
    When ingreso email de login "adminmalo@adminmalo.com"
    And ingreso contraseña de login "Admin.123456789"
    And realizo el envío de los datos de login
    Then aparece un mensaje de datos equivocados

  Scenario: CP10 Login email correcto password incorrecto
    Given el usuario accede a la pagina de login
    When ingreso email de login "an.salcedo@duocuc.cl"
    And ingreso contraseña de login "Passmala.1234"
    And realizo el envío de los datos de login
    Then aparece un mensaje de datos equivocados