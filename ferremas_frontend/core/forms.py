from django import forms

class ProductoForm(forms.Form):
    nombre = forms.CharField(min_length=3, max_length=100, required=True)
    descripcion = forms.CharField(max_length=500, required=False)
    precio = forms.DecimalField(min_value=1, required=True)
    stock = forms.IntegerField(min_value=0, required=True, initial=0)
    marca_id = forms.IntegerField(required=False)
    categoria_id = forms.IntegerField(required=False)
    nueva_marca = forms.CharField(max_length=50, required=False)
    nueva_categoria = forms.CharField(max_length=50, required=False)
    imagen_url = forms.URLField(required=False)

    def clean(self):
        cleaned_data = super().clean()
        marca_id = cleaned_data.get('marca_id')
        nueva_marca = cleaned_data.get('nueva_marca')
        categoria_id = cleaned_data.get('categoria_id')
        nueva_categoria = cleaned_data.get('nueva_categoria')

        if not marca_id and not nueva_marca:
            raise forms.ValidationError("Debe seleccionar una marca existente o proveer una nueva.")
        if not categoria_id and not nueva_categoria:
            raise forms.ValidationError("Debe seleccionar una categoría existente o proveer una nueva.")
            
        return cleaned_data

class UsuarioForm(forms.Form):
    nombre = forms.CharField(min_length=2, max_length=100, required=True)
    email = forms.EmailField(required=True)
    password = forms.CharField(min_length=8, required=False, widget=forms.PasswordInput)
    rut = forms.RegexField(regex=r'^[0-9]{7,8}-[0-9kK]$', required=True)
    rol_id = forms.IntegerField(required=True)
    sucursal_id = forms.IntegerField(required=True)
    sucursal_id = forms.IntegerField(required=True)
