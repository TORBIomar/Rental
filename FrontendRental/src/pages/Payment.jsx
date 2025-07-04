import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data passed from the previous component
  const {
    voiture,
    isRental,
    dateDebut,
    dateFin,
    totalPrice,
    nombreJours,
    clientId,
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [error, setError] = useState(null);

  // Load Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (!stripePublicKey) {
        setError("Configuration de paiement manquante");
        return;
      }
      try {
        const stripeInstance = await loadStripe(stripePublicKey);
        setStripe(stripeInstance);
      } catch (err) {
        setError("Erreur de chargement du service de paiement");
      }
    };
    initializeStripe();
  }, []);

  const handleRetour = () => {
    navigate(-1);
  };

  const getAuthToken = () => {
    const possibleKeys = ['access_token', 'access', 'token', 'authToken'];
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) return token;
    }
    return null;
  };

  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || price === '') return "0";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const calculateFinalPrice = () => {
    if (isRental) {
      if (totalPrice && totalPrice > 0) return totalPrice;
      const prixJournalier = voiture?.prix_location || 0;
      const jours = nombreJours || 1;
      return prixJournalier * jours;
    } else {
      if (totalPrice && totalPrice > 0) return totalPrice;
      return voiture?.prix_vente || voiture?.prix_location || 0;
    }
  };

  const finalPrice = calculateFinalPrice();

  useEffect(() => {
    if (!voiture) {
      setTimeout(() => {
        navigate("/rent");
      }, 3000);
    }
  }, [voiture, navigate]);

  const handleAgencePayment = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const user = getCurrentUser();
      const userId = user?.id || clientId || 2;
      const voitureId = voiture.id || voiture._id || voiture.pk;

      if (!voiture || !voitureId) {
        throw new Error("Informations de voiture manquantes");
      }

      console.log("=== DÉBUT PAIEMENT AGENCE ===");
      console.log("Type:", isRental ? "Location" : "Vente");
      console.log("Voiture ID:", voitureId);
      console.log("User ID:", userId);
      console.log("Prix final:", finalPrice);

      let mainResponse, mainData, paiementBody;

      if (!isRental) {
        // === REQUÊTE VENTE ===
        const venteBody = {
          prix_vente: parseFloat(finalPrice),
          voiture_id: voitureId,
          client: userId,
          date_achat: new Date().toISOString().slice(0, 10),
        };

        console.log("Envoi requête VENTE:", venteBody);
        console.log("URL:", "http://127.0.0.1:8000/api/ventes/");

        mainResponse = await fetch("http://127.0.0.1:8000/api/ventes/", {
          method: "POST",
          headers,
          body: JSON.stringify(venteBody),
        });
        
        mainData = await mainResponse.json();
        console.log("Réponse VENTE:", mainData);

        if (!mainResponse.ok) {
          console.error("Erreur vente:", mainData);
          throw new Error(mainData.error || mainData.detail || "Erreur lors de la création de la vente");
        }

        // Préparer le body pour le paiement VENTE
        paiementBody = {
          montant: finalPrice.toString(),
          type_paiement: "Directement a l'agence",
          vente: mainData.id || mainData.pk,
        };
      } else {
        // === REQUÊTE LOCATION ===
        const locationBody = {
          voiture_id: voitureId,
          date_debut: dateDebut,
          date_fin: dateFin,
          client: userId,
        };

        console.log("Envoi requête LOCATION:", locationBody);
        console.log("URL:", "http://127.0.0.1:8000/api/locations/");

        mainResponse = await fetch("http://127.0.0.1:8000/api/locations/", {
          method: "POST",
          headers,
          body: JSON.stringify(locationBody),
        });
        
        mainData = await mainResponse.json();
        console.log("Réponse LOCATION:", mainData);

        if (!mainResponse.ok) {
          console.error("Erreur location:", mainData);
          throw new Error(mainData.error || mainData.detail || "Erreur lors de la création de la location");
        }

        // Préparer le body pour le paiement LOCATION
        paiementBody = {
          montant: finalPrice.toString(),
          type_paiement: "Directement a l'agence",
          location: mainData.id || mainData.pk,
        };
      }

      // === REQUÊTE PAIEMENT ===
      console.log("Envoi requête PAIEMENT:", paiementBody);
      console.log("URL:", "http://localhost:8000/api/ajouterpaiement/");

      const paiementResponse = await fetch("http://localhost:8000/api/ajouterpaiement/", {
        method: "POST",
        headers,
        body: JSON.stringify(paiementBody),
      });
      
      const paiementData = await paiementResponse.json();
      console.log("Réponse PAIEMENT:", paiementData);

      if (!paiementResponse.ok) {
        console.error("Erreur paiement:", paiementData);
        throw new Error(paiementData.error || paiementData.detail || "Erreur lors de l'ajout du paiement");
      }

      console.log("=== PAIEMENT AGENCE RÉUSSI ===");

      // Navigation vers la page de confirmation
      navigate("/reservation", {
        state: {
          voiture,
          isRental,
          dateDebut,
          dateFin,
          totalPrice: finalPrice,
          nombreJours,
          paiement: paiementData,
          transaction: mainData,
        },
      });

    } catch (err) {
      console.error("Erreur dans handleAgencePayment:", err);
      setError(err.message || "Erreur lors du paiement à l'agence.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = getAuthToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const user = getCurrentUser();
      const userId = user?.id || clientId || 2;
      const voitureId = voiture.id || voiture._id || voiture.pk;
      
      if (!voitureId) throw new Error("ID de voiture manquant");

      const requestBody = {
        amount: Math.round(finalPrice * 100),
        currency: 'mad',
        voiture_id: voitureId,
        user_id: userId,
        is_rental: isRental,
      };

      if (isRental && dateDebut && dateFin) {
        requestBody.date_debut = dateDebut;
        requestBody.date_fin = dateFin;
        requestBody.nombre_jours = nombreJours;
      }

      const response = await fetch('http://localhost:8000/api/stripe-checkout/', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Erreur HTTP: ${response.status}`);
      }

      if (!data.id) {
        throw new Error("ID de session manquant dans la réponse");
      }

      // Sauvegarder les données de paiement dans localStorage avant la redirection Stripe
      const paymentDataToStore = {
        voiture,
        isRental,
        dateDebut,
        dateFin,
        totalPrice: finalPrice,
        clientId,
        nombreJours,
        sessionId: data.id,
        timestamp: Date.now()
      };
      
      try {
        localStorage.setItem('pendingPaymentData', JSON.stringify(paymentDataToStore));
        console.log("Payment data saved to localStorage:", paymentDataToStore);
      } catch (e) {
        console.error("Error saving payment data to localStorage:", e);
      }

      // Redirection vers Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: data.id
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      setError(error.message || 'Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "agence") {
      await handleAgencePayment();
    } else {
      await handleStripePayment();
    }
  };

  if (!voiture) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Redirection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleRetour}
          className="mb-8 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          disabled={isProcessing}
        >
          ← Retour
        </button>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-600 rounded-lg">
            <p className="text-red-300">❌ {error}</p>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-900 via-gray-900 to-black border border-white/[0.2] rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/[0.1]">
            <h1 className="text-3xl font-bold text-white">
              {isRental ? 'Paiement de la location' : 'Paiement de l\'achat'}
            </h1>
          </div>

          <div className="p-6 bg-black/30 border-b border-white/[0.1]">
            <h2 className="text-xl font-semibold text-purple-300 mb-4">Résumé de la commande</h2>
            <div className="flex items-center mb-4">
              <div className="w-24 h-20 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                <img
                  src={voiture.image || '/placeholder-car.jpg'}
                  alt={`${voiture.marque || 'Marque'} ${voiture.modele || 'Modèle'}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/placeholder-car.jpg';
                  }}
                />
              </div>
              <div className="ml-4">
                <p className="text-white font-bold text-lg">
                  {voiture.marque || 'Marque inconnue'} {voiture.modele || 'Modèle inconnu'}
                </p>
                <p className="text-gray-400">
                  {voiture.couleur || 'Couleur non spécifiée'} • {voiture.boite_a_vitesse || voiture.boiteVitesse || 'Transmission non spécifiée'}
                </p>
              </div>
            </div>
            {isRental ? (
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span>Date de début:</span>
                  <span>{new Date(dateDebut).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date de fin:</span>
                  <span>{new Date(dateFin).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée:</span>
                  <span>{nombreJours} jour{nombreJours > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prix journalier:</span>
                  <span>{formatPrice(voiture.prix_location)} DH</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-purple-300 text-xl">
                  <span>Total à payer:</span>
                  <span>{formatPrice(finalPrice)} DH</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between font-bold text-purple-300 text-xl">
                  <span>Prix d'achat:</span>
                  <span>{formatPrice(finalPrice)} DH</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-purple-300 mb-4">Méthode de paiement</h2>
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  className={`px-6 py-3 rounded-lg flex items-center transition-colors ${
                    paymentMethod === "card"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                  disabled={isProcessing}
                >
                  💳 Carte bancaire (Stripe)
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 rounded-lg flex items-center transition-colors ${
                    paymentMethod === "agence"
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setPaymentMethod("agence")}
                  disabled={isProcessing}
                >
                  🏢 Paiement à l'agence
                </button>
              </div>
              {paymentMethod === "card" && (
                <div className="py-8 px-4 text-center bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 mb-6">
                    Vous serez redirigé vers Stripe pour finaliser votre paiement en toute sécurité.
                  </p>
                </div>
              )}
              {paymentMethod === "agence" && (
                <div className="py-8 px-4 text-center bg-green-800/50 rounded-lg">
                  <p className="text-green-300 mb-6">
                    Vous allez réserver votre véhicule et payer directement à l'agence.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 space-y-4">
              <button
                type="submit"
                disabled={isProcessing || (paymentMethod === "card" && (!stripe || !!error))}
                className={`w-full px-6 py-4 rounded-xl text-white font-bold text-lg transition-colors ${
                  isProcessing || (paymentMethod === "card" && (!stripe || !!error))
                    ? "bg-gray-600 cursor-not-allowed"
                    : paymentMethod === "agence"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                } flex items-center justify-center`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Traitement en cours...
                  </>
                ) : paymentMethod === "card" ? (
                  `Payer ${formatPrice(finalPrice)} DH`
                ) : (
                  "Réserver et payer à l'agence"
                )}
              </button>
              <p className="text-gray-400 text-sm text-center">
                {paymentMethod === "card"
                  ? "🔒 Paiement sécurisé par Stripe • Vos données sont protégées"
                  : "🏢 Paiement à effectuer à l'agence lors du retrait du véhicule"}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;