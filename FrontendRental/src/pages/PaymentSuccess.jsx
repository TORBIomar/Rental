import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer les données passées via l'état de navigation ou depuis localStorage
  const stateData = location.state || {};
  const [voitureData, setVoitureData] = useState(stateData.voiture || null);
  const [isRentalData, setIsRentalData] = useState(stateData.isRental || false);
  const [dateDebutData, setDateDebutData] = useState(stateData.dateDebut || null);
  const [dateFinData, setDateFinData] = useState(stateData.dateFin || null);
  const [totalPriceData, setTotalPriceData] = useState(stateData.totalPrice || null);
  const [clientIdData, setClientIdData] = useState(stateData.clientId || null);
  const [nombreJoursData, setNombreJoursData] = useState(stateData.nombreJours || null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [apiCallsCompleted, setApiCallsCompleted] = useState(false);

  const handleRetourAccueil = () => {
    navigate("/");
  };

  const handleVoirHistorique = () => {
    navigate("/client");
  };

  // Format price with spaces for thousands
  const formatPrice = (price) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "0";
  };

  // Fonction pour récupérer les données de paiement depuis localStorage
  const getPaymentDataFromStorage = () => {
    try {
      const paymentData = localStorage.getItem('pendingPaymentData');
      if (paymentData) {
        const data = JSON.parse(paymentData);
        console.log("Found payment data in localStorage:", data);
        return data;
      }
    } catch (e) {
      console.error("Error reading payment data from localStorage:", e);
    }
    return null;
  };

  // Fonction pour nettoyer les données de localStorage après utilisation
  const clearPaymentDataFromStorage = () => {
    try {
      localStorage.removeItem('pendingPaymentData');
      console.log("Cleared payment data from localStorage");
    } catch (e) {
      console.error("Error clearing payment data from localStorage:", e);
    }
  };

  // Fixed: Added missing function declaration
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

  const calculateFinalPrice = () => {
    if (isRentalData) {
      if (totalPriceData && totalPriceData > 0) return totalPriceData;
      const prixJournalier = voitureData?.prix_location || 0;
      const jours = nombreJoursData || 1;
      return prixJournalier * jours;
    } else {
      if (totalPriceData && totalPriceData > 0) return totalPriceData;
      return voitureData?.prix_vente || voitureData?.prix_location || 0;
    }
  };

  const processPaymentSuccess = async () => {
    console.log("processPaymentSuccess called");
    
    if (!voitureData) {
      console.log("No voiture data available");
      setError("Données de voiture manquantes");
      return;
    }
    
    if (apiCallsCompleted) {
      console.log("API calls already completed");
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    console.log("Starting API calls...");

    try {
      const token = getAuthToken();
      console.log("Token:", token ? "Found" : "Not found");
      
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const user = getCurrentUser();
      const userId = user?.id || clientIdData || 2;
      const finalPrice = calculateFinalPrice();
      
      console.log("User ID:", userId);
      console.log("Final Price:", finalPrice);
      console.log("Is Rental:", isRentalData);

      let mainResponse, paiementBody;

      if (!isRentalData) {
        console.log("Creating vente...");
        // Créer une vente
        const venteBody = {
          prix_vente: finalPrice,
          voiture_id: voitureData.id || voitureData._id || voitureData.pk,
          client: userId,
          date_achat: new Date().toISOString().slice(0, 10),
        };
        
        console.log("Vente body:", venteBody);

        mainResponse = await fetch("http://127.0.0.1:8000/api/ventes/", {
          method: "POST",
          headers,
          body: JSON.stringify(venteBody),
        });
        
        const mainData = await mainResponse.json();
        console.log("Vente response:", mainData);
        
        if (!mainResponse.ok) {
          throw new Error(mainData.error || "Erreur lors de la création de la vente");
        }

        // Créer le paiement pour la vente
        paiementBody = {
          montant: finalPrice.toString(),
          type_paiement: "Carte bancaire (Stripe)",
          vente: mainData.id || mainData.pk,
        };
      } else {
        console.log("Creating location...");
        // Créer une location
        const locationBody = {
          voiture_id: voitureData.id || voitureData._id || voitureData.pk,
          date_debut: dateDebutData,
          date_fin: dateFinData,
          client: userId,
        };
        
        console.log("Location body:", locationBody);

        mainResponse = await fetch("http://127.0.0.1:8000/api/locations/", {
          method: "POST",
          headers,
          body: JSON.stringify(locationBody),
        });
        
        const mainData = await mainResponse.json();
        console.log("Location response:", mainData);
        
        if (!mainResponse.ok) {
          throw new Error(mainData.error || "Erreur lors de la création de la location");
        }

        // Créer le paiement pour la location
        paiementBody = {
          montant: finalPrice.toString(),
          type_paiement: "Carte bancaire (Stripe)",
          location: mainData.id || mainData.pk,
        };
      }

      console.log("Creating payment...");
      console.log("Payment body:", paiementBody);

      // Enregistrer le paiement
      const paiementResponse = await fetch("http://localhost:8000/api/ajouterpaiement/", {
        method: "POST",
        headers,
        body: JSON.stringify(paiementBody),
      });
      
      const paiementData = await paiementResponse.json();
      console.log("Payment response:", paiementData);
      
      if (!paiementResponse.ok) {
        throw new Error(paiementData.error || "Erreur lors de l'enregistrement du paiement");
      }

      setApiCallsCompleted(true);
      // Nettoyer les données de localStorage après succès
      clearPaymentDataFromStorage();
      console.log("All API calls completed successfully!");
      
    } catch (err) {
      console.error("Error in processPaymentSuccess:", err);
      setError(err.message || "Erreur lors du traitement du paiement.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Effectuer les appels API au chargement du composant
  useEffect(() => {
    console.log("PaymentSuccess component loaded");
    console.log("Voiture data from state:", voitureData);
    console.log("isRental from state:", isRentalData);
    
    // Si pas de données dans l'état, essayer de récupérer depuis localStorage
    if (!voitureData) {
      const storedData = getPaymentDataFromStorage();
      if (storedData) {
        setVoitureData(storedData.voiture);
        setIsRentalData(storedData.isRental);
        setDateDebutData(storedData.dateDebut);
        setDateFinData(storedData.dateFin);
        setTotalPriceData(storedData.totalPrice);
        setClientIdData(storedData.clientId);
        setNombreJoursData(storedData.nombreJours);
        
        console.log("Loaded data from localStorage:", storedData);
        return; // Les données seront traitées dans le prochain useEffect
      }
    }
    
    // Exécuter immédiatement au chargement si les données sont disponibles
    if (voitureData) {
      processPaymentSuccess();
    }
  }, []); // Tableau de dépendances vide = s'exécute une seule fois au montage
  
  // Effet séparé pour traiter les données chargées depuis localStorage
  useEffect(() => {
    if (voitureData && !apiCallsCompleted && !isProcessing) {
      console.log("Processing payment with loaded data");
      processPaymentSuccess();
    }
  }, [voitureData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/[0.2] rounded-xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/[0.1]">
            <h1 className="text-2xl font-bold text-white">Paiement Réussi</h1>
          </div>
          
          {/* Message de traitement */}
          {isProcessing && (
            <div className="p-6 bg-blue-600/20 border-b border-blue-600/30">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mr-3"></div>
                <p className="text-blue-300">Finalisation de votre commande...</p>
              </div>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="p-6 bg-red-600/20 border-b border-red-600/30">
              <div className="flex items-center">
                <span className="text-red-400 mr-3">⚠️</span>
                <div>
                  <p className="text-red-300 font-semibold">Erreur lors de la finalisation</p>
                  <p className="text-red-400 text-sm">{error}</p>
                  <p className="text-red-400 text-sm mt-1">
                    Votre paiement a été effectué, mais nous n'avons pas pu enregistrer votre commande. 
                    Veuillez contacter le support.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Message de succès */}
          <div className="p-8 text-center">
            <div className="mb-8">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-4">
              Votre {isRentalData ? "location" : "achat"} a été confirmé
            </h2>
            
            {voitureData && (
              <div className="bg-black/30 p-6 rounded-lg mb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-24 h-24 bg-gray-800 rounded overflow-hidden">
                    <img 
                      src={voitureData.image} 
                      alt={`${voitureData.marque} ${voitureData.modele}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                <p className="text-white font-bold text-lg">{voitureData.marque} {voitureData.modele}</p>
                <p className="text-gray-400 text-sm mb-4">{voitureData.couleur} • {voitureData.boiteVitesse || voitureData.boite_a_vitesse}</p>
                
                {isRentalData ? (
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Période de location:</span>
                      <span>Du {new Date(dateDebutData).toLocaleDateString('fr-FR')} au {new Date(dateFinData).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Durée:</span>
                      <span>{nombreJoursData} jour{nombreJoursData > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between font-bold text-white text-base">
                      <span>Montant payé:</span>
                      <span>{formatPrice(calculateFinalPrice())} DH</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between font-bold text-white text-base">
                      <span>Montant payé:</span>
                      <span>{formatPrice(calculateFinalPrice())} DH</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="mb-6">
              <div className="flex items-center justify-center mb-2">
                <span className="text-green-400 mr-2">✅</span>
                <span className="text-green-300 font-semibold">Paiement effectué avec succès</span>
              </div>
              {apiCallsCompleted && (
                <div className="flex items-center justify-center">
                  <span className="text-blue-400 mr-2">📋</span>
                  <span className="text-blue-300 font-semibold">Commande enregistrée</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-300 mb-8">
              {isRentalData 
                ? "Vous pouvez récupérer votre véhicule à l'agence à la date prévue."
                : "Vous pouvez récupérer votre véhicule à l'agence dès maintenant."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleVoirHistorique}
                className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                disabled={isProcessing}
              >
                Voir mon historique
              </button>
              
              <button
                onClick={handleRetourAccueil}
                className={`px-6 py-3 rounded-xl text-white font-bold ${
                  isRentalData ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
                } transition-colors`}
                disabled={isProcessing}
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;