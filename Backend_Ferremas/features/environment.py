from django.contrib.auth.models import User
from selenium import webdriver
from selenium.webdriver.chrome.service import Service  # <--- 1. IMPORTAMOS SERVICE
import os

def before_all(context):
    # Ruta al driver (esto está bien)
    chrome_driver_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'chromedriver.exe')
    
    # --- ESTA ES LA PARTE QUE CAMBIA ---
    
    # 2. Creamos el objeto Service
    service = Service(executable_path=chrome_driver_path)
    
    # 3. Creamos las opciones (esto está bien)
    options = webdriver.ChromeOptions()
    # Dejamos comentados los 'headless' para VER la ventana
    # options.add_argument('--headless')
    
    # 4. Iniciamos el browser usando 'service=' y 'options='
    #    (ya NO usamos executable_path)
    context.browser = webdriver.Chrome(service=service, options=options)
    
    # --- FIN DE LA PARTE QUE CAMBIA ---

    context.base_url = 'http://localhost:8000'

def before_scenario(context, scenario):
    # Esto está perfecto
    User.objects.all().delete()
    User.objects.create_user(username='testuser', password='testpass123')

def after_all(context):
    # Este error 'AttributeError' se arreglará solo,
    # porque ahora 'context.browser' sí se creará.
    context.browser.quit()