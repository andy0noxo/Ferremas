from django import forms

class StockUpdateForm(forms.Form):
    cantidad = forms.IntegerField(min_value=0, required=True)
