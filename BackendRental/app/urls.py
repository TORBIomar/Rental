from django.urls import path, include
from rest_framework import routers
from django.conf import settings
from django.conf.urls.static import static

from .views import (
    RegisterView, LoginView,
    VoitureViewSet, VenteViewSet, LocationViewSet,
    MesVentesView, MesLocationsView,
    StripeCheckoutView, DeleteUserView, UserListView, DeleteUserByEmailView, ajouter_paiement,
)

router = routers.DefaultRouter()
router.register(r'voitures', VoitureViewSet)
router.register(r'ventes', VenteViewSet)
router.register(r'locations', LocationViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('mes-ventes/', MesVentesView.as_view(), name='mes-ventes'),
    path('mes-locations/', MesLocationsView.as_view(), name='mes-locations'),
    path('stripe-checkout/', StripeCheckoutView.as_view(), name='stripe-checkout'),
    path('', include(router.urls)),
    path('users/delete/<int:user_id>/', DeleteUserView.as_view(), name='delete_user'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/delete/<int:user_id>/', DeleteUserView.as_view(), name='delete-user'),
    path('users/delete-by-email/', DeleteUserByEmailView.as_view(), name='delete-user-by-email'),

    path('ajouterpaiement/', ajouter_paiement, name='ajouter_paiement'),




]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
