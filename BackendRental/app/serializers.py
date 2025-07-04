from rest_framework import serializers
from .models import Utilisateur, Voiture, Vente, Location, Paiement
from django.contrib.auth.models import User


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(max_length=50, default='client')


# Serializer pour l'utilisateur Django
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


# Serializer pour Utilisateur avec les données User incluses
class UtilisateurSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Utilisateur
        fields = ['id', 'user', 'rôle']


class VoitureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voiture
        fields = '__all__'


class PaiementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paiement
        fields = ['id', 'client', 'montant', 'type_paiement', 'location', 'vente', 'date_creation']

# Serializer pour Vente avec les paiements inclus
class VenteSerializer(serializers.ModelSerializer):
    voiture = VoitureSerializer(read_only=True)
    client = UtilisateurSerializer(read_only=True)
    # Inclure les paiements liés à cette vente
    paiements = PaiementSerializer(many=True, read_only=True, source='paiement_set')

    voiture_id = serializers.PrimaryKeyRelatedField(
        queryset=Voiture.objects.all(),
        write_only=True,
        source='voiture'
    )

    class Meta:
        model = Vente
        fields = [
            'id', 'client', 'voiture', 'voiture_id',
            'date_achat', 'prix_vente', 'contract', 'statut', 'paiements'
        ]
        read_only_fields = ['client', 'prix_vente']


class LocationSerializer(serializers.ModelSerializer):
    voiture = VoitureSerializer(read_only=True)
    client = UtilisateurSerializer(read_only=True)
    # Inclure les paiements liés à cette location
    paiements = PaiementSerializer(many=True, read_only=True, source='paiement_set')

    voiture_id = serializers.PrimaryKeyRelatedField(
        queryset=Voiture.objects.all(), write_only=True, source='voiture'
    )

    class Meta:
        model = Location
        fields = [
            'id',
            'client',  # lecture seule
            'voiture',  # lecture seule
            'voiture_id',  # requis dans la requête
            'date_debut',
            'date_fin',
            'contract',
            'cout_total',
            'statut',
            'paiements'
        ]
        read_only_fields = ['client', 'cout_total']


# Serializer complet pour les paiements (pour les vues dédiées aux paiements)
class PaiementDetailSerializer(serializers.ModelSerializer):
    client = UtilisateurSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    vente = VenteSerializer(read_only=True)

    class Meta:
        model = Paiement
        fields = ['id', 'client', 'montant', 'type_paiement', 'date_creation', 'location', 'vente', 'stripe_session_id']