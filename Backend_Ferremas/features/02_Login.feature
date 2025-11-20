Feature: User Login
  As a user
  I want to log in to the site
  To be able to see my home page

  Scenario: Successful Login
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario "an.salcedo@duocuc.cl"
    And ingreso como clave "Admin.123456789"
    And realizo el envío de los datos
    Then aparece un mensaje de ingreso correcto

  Scenario: Login vacío
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario ""
    And ingreso como clave ""
    And realizo el envío de los datos
    Then aparece un mensaje de datos equivocados

  Scenario: Login user correcto pass incorrecto
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario "an.salcedo@duocuc.cl"
    And ingreso como clave "Contraseñamalo"
    And realizo el envío de los datos
    Then aparece un mensaje de datos equivocados

  Scenario: Login user incorrecto pass incorrecto
    Given que puedo acceder a la pagina
    When puedo acceder al login
    And ingreso como usuario "adminmalo"
    And ingreso como clave "passwordmala"
    And realizo el envío de los datos
    Then aparece un mensaje de datos equivocados