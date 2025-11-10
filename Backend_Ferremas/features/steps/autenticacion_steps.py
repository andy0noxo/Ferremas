from behave import *
import time
from selenium.webdriver.common.by import By

@given('a user "{username}" with password "{password}" exists')
def step_impl(context, username, password):
    pass

@given('I am on the login page')
def step_impl(context):
    context.browser.get(context.base_url + '/accounts/login/')

@when('I enter the username "{username}"')
def step_impl(context, username):
    context.browser.find_element(By.ID, 'id_username').send_keys(username)

@when('I enter the password "{password}"')
def step_impl(context, password):
    context.browser.find_element(By.ID, 'id_password').send_keys(password)

@when('I press the "Entrar" button')
def step_impl(context):  # <--- ¡¡ARREGLADO!! Ya no pide 'mensaje'
    context.browser.find_element(By.CSS_SELECTOR, 'button[type="submit"]').click()
    time.sleep(0.5) 

@then('I am redirected to the home page')
def step_impl(context):
    assert context.browser.current_url == context.base_url + '/'

@then('I see the message "{mensaje}"')
def step_impl(context, mensaje): # <--- Este SÍ lo necesita
    titulo = context.browser.find_element(By.TAG_NAME, 'h1').text
    assert titulo == mensaje