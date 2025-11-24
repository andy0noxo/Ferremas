from django import forms

class ProductoForm(forms.Form):
    nombre = forms.CharField(min_length=3, max_length=100, required=True)
    descripcion = forms.CharField(max_length=500, required=False)
    precio = forms.DecimalField(min_value=1, required=True)
    marca_id = forms.IntegerField(required=True)
    categoria_id = forms.IntegerField(required=True)

class UsuarioForm(forms.Form):
    nombre = forms.CharField(min_length=2, max_length=100, required=True)
    email = forms.EmailField(required=True)
    password = forms.CharField(min_length=8, required=False, widget=forms.PasswordInput)
    rut = forms.RegexField(regex=r'^[0-9]{7,8}-[0-9kK]$', required=True)
    rol_id = forms.IntegerField(required=True)
    sucursal_id = forms.IntegerField(required=True)
