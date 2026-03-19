from django import forms

class StockUpdateForm(forms.Form):
    cantidad = forms.IntegerField(min_value=0, required=True)

class StockUpdateDetailedForm(forms.Form):
    producto_id = forms.ChoiceField(label='Producto')
    sucursal_id = forms.ChoiceField(label='Sucursal')
    cantidad = forms.IntegerField(min_value=0, label='Cantidad')

    def __init__(self, *args, **kwargs):
        productos = kwargs.pop('productos', [])
        sucursales = kwargs.pop('sucursales', [])
        super().__init__(*args, **kwargs)
        self.fields['producto_id'].choices = [(p['id'], f"{p['nombre']} (ID: {p['id']})") for p in productos]
        self.fields['sucursal_id'].choices = [(s['id'], s['nombre']) for s in sucursales]

