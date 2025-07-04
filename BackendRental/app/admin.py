from django.contrib import admin
from .models import Utilisateur, Voiture, Vente, Location, Paiement

admin.site.register(Utilisateur)
admin.site.register(Voiture)
admin.site.register(Vente)
admin.site.register(Location)
admin.site.register(Paiement)
