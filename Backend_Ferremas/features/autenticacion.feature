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