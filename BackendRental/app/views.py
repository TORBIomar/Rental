from rest_framework import generics, permissions, viewsets, status, serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.conf import settings

from .models import Utilisateur, Voiture, Vente, Location
from .serializers import VoitureSerializer, VenteSerializer, LocationSerializer, RegisterSerializer, UserSerializer, \
    PaiementSerializer

import stripe
import logging

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    username=serializer.validated_data['username'],
                    email=serializer.validated_data['email'],
                    password=serializer.validated_data['password']
                )
                utilisateur = Utilisateur.objects.create(
                    user=user,
                    rôle=serializer.validated_data.get('role', 'client')
                )
                return Response({
                    'status': 'success',
                    'message': 'Utilisateur et profil créés avec succès',
                    'user_id': user.id,
                    'utilisateur_id': utilisateur.id,
                    'username': user.username,
                    'role': utilisateur.rôle
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Erreur lors de l\'inscription : {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    class LoginSerializer(serializers.Serializer):
        username = serializers.CharField()
        password = serializers.CharField(write_only=True)

    def post(self, request):
        serializer = self.LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        if user:
            refresh = RefreshToken.for_user(user)
            utilisateur, _ = Utilisateur.objects.get_or_create(user=user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username,
                'role': utilisateur.rôle
            })

        return Response({'detail': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)

class VoitureViewSet(viewsets.ModelViewSet):
    queryset = Voiture.objects.all()
    serializer_class = VoitureSerializer


class VenteViewSet(viewsets.ModelViewSet):
    queryset = Vente.objects.all()
    serializer_class = VenteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['contract'] = data.get('contract') or None

        try:
            voiture = Voiture.objects.get(pk=data.get('voiture_id'))
        except Voiture.DoesNotExist:
            return Response({'error': 'Voiture introuvable'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        utilisateur = Utilisateur.objects.get(user=request.user)

        # 👇 On passe prix_vente ici car il est read_only
        vente = serializer.save(client=utilisateur, prix_vente=voiture.prix_vente)

        return Response(self.get_serializer(vente).data, status=status.HTTP_201_CREATED)


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        utilisateur = Utilisateur.objects.get(user=self.request.user)
        serializer.save(client=utilisateur)

class MesVentesView(generics.ListAPIView):
    serializer_class = VenteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        utilisateur = Utilisateur.objects.get(user=self.request.user)
        return Vente.objects.filter(client=utilisateur).select_related('voiture')

class MesLocationsView(generics.ListAPIView):
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        utilisateur = Utilisateur.objects.get(user=self.request.user)
        return Location.objects.filter(client=utilisateur).select_related('voiture')


import json
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
import logging

# Configuration du logger
logger = logging.getLogger(__name__)

# Configuration de Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeCheckoutView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        try:
            # Log pour diagnostiquer
            logger.info(f"=== DEBUG STRIPE CHECKOUT ===")
            logger.info(f"Content-Type: {request.content_type}")
            logger.info(f"Request body: {request.body}")
            logger.info(f"Request method: {request.method}")

            # Vérifier le Content-Type
            if request.content_type != 'application/json':
                logger.error(f"Content-Type incorrect: {request.content_type}")
                return JsonResponse({
                    'error': 'Content-Type doit être application/json'
                }, status=400)

            # Parser les données JSON
            try:
                data = json.loads(request.body)
                logger.info(f"Données reçues: {data}")
            except json.JSONDecodeError as e:
                logger.error(f"Erreur JSON: {e}")
                return JsonResponse({
                    'error': 'Données JSON invalides'
                }, status=400)

            # Extraire les données
            amount = data.get('amount')  # Déjà en centimes depuis le frontend
            currency = data.get('currency', 'mad')
            voiture_id = data.get('voiture_id')
            is_rental = data.get('is_rental', False)
            date_debut = data.get('date_debut')
            date_fin = data.get('date_fin')
            nombre_jours = data.get('nombre_jours')

            # Validation des données requises
            if not amount or not voiture_id:
                return JsonResponse({
                    'error': 'Montant et ID de voiture requis'
                }, status=400)

            # Validation du montant
            if not isinstance(amount, (int, float)) or amount <= 0:
                return JsonResponse({
                    'error': 'Montant invalide'
                }, status=400)

            # Conversion en entier (centimes)
            amount_in_cents = int(amount)

            # Préparer les métadonnées
            metadata = {
                'voiture_id': str(voiture_id),
                'is_rental': str(is_rental),
            }

            if is_rental and date_debut and date_fin:
                metadata.update({
                    'date_debut': date_debut,
                    'date_fin': date_fin,
                    'nombre_jours': str(nombre_jours) if nombre_jours else '1'
                })

            # Créer la session Stripe
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency.lower(),
                        'unit_amount': amount_in_cents,
                        'product_data': {
                            'name': f'{"Location" if is_rental else "Achat"} de voiture',
                            'description': f'Voiture ID: {voiture_id}',
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
               success_url=f'{settings.FRONTEND_URL}/paiement-reussi?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{settings.FRONTEND_URL}/paymentcancel',
                metadata=metadata,
                # Optionnel: ajouter des informations de facturation
                billing_address_collection='required',
            )

            logger.info(f"Session Stripe créée: {session.id} pour voiture {voiture_id}")

            return JsonResponse({
                'id': session.id,
                'url': session.url
            })

        except stripe.error.CardError as e:
            logger.error(f"Erreur carte Stripe: {e}")
            return JsonResponse({
                'error': 'Erreur de carte bancaire'
            }, status=400)

        except stripe.error.RateLimitError as e:
            logger.error(f"Rate limit Stripe: {e}")
            return JsonResponse({
                'error': 'Trop de requêtes, veuillez réessayer'
            }, status=429)

        except stripe.error.InvalidRequestError as e:
            logger.error(f"Requête invalide Stripe: {e}")
            return JsonResponse({
                'error': 'Paramètres de paiement invalides'
            }, status=400)

        except stripe.error.AuthenticationError as e:
            logger.error(f"Authentification Stripe échouée: {e}")
            return JsonResponse({
                'error': 'Erreur de configuration du paiement'
            }, status=500)

        except stripe.error.APIConnectionError as e:
            logger.error(f"Connexion API Stripe échouée: {e}")
            return JsonResponse({
                'error': 'Erreur de connexion au service de paiement'
            }, status=503)

        except stripe.error.StripeError as e:
            logger.error(f"Erreur Stripe générale: {e}")
            return JsonResponse({
                'error': 'Erreur du service de paiement'
            }, status=500)

        except Exception as e:
            logger.error(f"Erreur inattendue: {e}")
            return JsonResponse({
                'error': 'Erreur interne du serveur'
            }, status=500)

class DeleteUserView(APIView):
    def delete(self, request, user_id):
        try:
            with transaction.atomic():
                user = User.objects.get(id=user_id)
                utilisateur = Utilisateur.objects.get(user=user)
                utilisateur.delete()  # supprime le profil utilisateur
                user.delete()  # supprime l'utilisateur Django
            return Response({'status': 'success', 'message': 'Utilisateur supprimé avec succès'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'status': 'error', 'message': 'Utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        except Utilisateur.DoesNotExist:
            return Response({'status': 'error', 'message': 'Profil utilisateur non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'status': 'error', 'message': f'Erreur lors de la suppression : {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer  # Utilisez le serializer que vous avez déjà
    permission_classes = [permissions.IsAuthenticated]


class DeleteUserByEmailView(APIView):
    def delete(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=400)

        try:
            user = User.objects.get(email=email)
            user.delete()
            return Response({'status': 'success'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)

@api_view(['POST'])
def ajouter_paiement(request):
    data = request.data

    location_id = data.get('location')
    vente_id = data.get('vente')

    # Vérifie que soit location soit vente est renseigné, mais pas les deux
    if (location_id and vente_id) or (not location_id and not vente_id):
        return Response(
            {"error": "Vous devez fournir soit location, soit vente, mais pas les deux."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Valide que location ou vente existe
    if location_id:
        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            return Response({"error": "Location non trouvée."}, status=status.HTTP_404_NOT_FOUND)
    else:
        location = None

    if vente_id:
        try:
            vente = Vente.objects.get(id=vente_id)
        except Vente.DoesNotExist:
            return Response({"error": "Vente non trouvée."}, status=status.HTTP_404_NOT_FOUND)
    else:
        vente = None

    # Récupère client à partir de location ou vente, ou depuis les données reçues
    client = None
    if location:
        client = location.client
    elif vente:
        client = vente.client
    else:
        client_id = data.get('client')
        if client_id:
            try:
                client = Utilisateur.objects.get(id=client_id)
            except Utilisateur.DoesNotExist:
                return Response({"error": "Client non trouvé."}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"error": "Client obligatoire si pas de location ou vente."},
                            status=status.HTTP_400_BAD_REQUEST)

    # Crée le paiement
    paiement_data = {
        'client': client.id,
        'montant': data.get('montant'),
        'type_paiement': data.get('type_paiement'),
        'location': location.id if location else None,
        'vente': vente.id if vente else None,
    }

    serializer = PaiementSerializer(data=paiement_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


