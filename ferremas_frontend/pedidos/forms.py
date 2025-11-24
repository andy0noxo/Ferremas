from django import forms

class PedidoForm(forms.Form):
    sucursal_id = forms.IntegerField(required=True)
    metodo_pago = forms.ChoiceField(choices=[('debito', 'Débito'), ('credito', 'Crédito'), ('transferencia', 'Transferencia')], required=True)
    # productos será un campo especial (lista de dicts), se maneja en la vista
