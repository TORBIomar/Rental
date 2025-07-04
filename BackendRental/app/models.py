from django.db import models
from django.contrib.auth.models import User
from django.db import models


class Utilisateur(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rôle = models.CharField(max_length=50, default='client')

    def __str__(self):
        return self.user.username



class Voiture(models.Model):
    marque = models.CharField(max_length=100)
    modele = models.CharField(max_length=100)
    couleur = models.CharField(max_length=100)
    kilometrage = models.CharField(max_length=100)
    type_carburant = models.CharField(max_length=100)
    boite_a_vitesse = models.CharField(max_length=100)
    annee = models.PositiveIntegerField()
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)
    prix_location = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    a_vendre = models.BooleanField(default=False)
    a_louer = models.BooleanField(default=False)
    image = models.ImageField()

    def __str__(self):
        return f"{self.marque} {self.modele} ({self.annee})"


from django.db import models

class Statut(models.TextChoices):
    EN_ATTENTE = 'EN_ATTENTE', 'En attente'
    VALIDE = 'VALIDE', 'Validé'
    REFUSE = 'REFUSE', 'Refusé'

class Vente(models.Model):
    client = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    voiture = models.ForeignKey(Voiture, on_delete=models.CASCADE)
    date_achat = models.DateField()
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2)
    contract = models.FileField(upload_to='contracts/', null=True, blank=True)
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE,
    )

    def __str__(self):
        return f"Vente {self.id} - Client {self.client.nom}"


class Location(models.Model):
    client = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    voiture = models.ForeignKey(Voiture, on_delete=models.CASCADE)
    date_debut = models.DateField()
    date_fin = models.DateField()
    contract = models.FileField(upload_to='contracts/', null=True, blank=True)
    cout_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    statut = models.CharField(
        max_length=20,
        choices=Statut.choices,
        default=Statut.EN_ATTENTE,
    )

    def save(self, *args, **kwargs):
        jours = (self.date_fin - self.date_debut).days
        self.cout_total = self.voiture.prix_location * max(jours, 1)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Location {self.id} - Client {self.client.nom}"




from django.utils import timezone

class Paiement(models.Model):
    client = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    type_paiement = models.CharField(max_length=50)
    date_creation = models.DateTimeField(default=timezone.now)
    location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL)
    vente = models.ForeignKey(Vente, null=True, blank=True, on_delete=models.SET_NULL)
    stripe_session_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Paiement {self.id} - {self.montant}€"
