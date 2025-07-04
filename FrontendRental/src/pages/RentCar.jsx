import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const RentCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voiture, setVoiture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [nombreJours, setNombreJours] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction pour faire une requête authentifiée avec gestion du refresh token
  const authenticatedFetch = async (url, options = {}) => {
    let token = localStorage.getItem('access_token') || localStorage.getItem('access');
    
    if (!token) {
      throw new Error('Token d\'authentification manquant');
    }

    const makeRequest = async (authToken) => {
      return await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          ...options.headers
        }
      });
    };

    let response = await makeRequest(token);

    // Si le token est expiré, essayer de le rafraîchir
    if (response.status === 401) {
      const refreshSuccess = await refreshToken();
      if (!refreshSuccess) {
        navigate('/login');
        throw new Error('Authentification échouée');
      }
      
      token = localStorage.getItem('access_token');
      response = await makeRequest(token);
    }

    return response;
  };

  // Récupérer les données de la voiture depuis l'API
  useEffect(() => {
    const fetchVoiture = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await authenticatedFetch(`http://localhost:8000/api/voitures/${id}/`);

        if (response.ok) {
          const data = await response.json();
          
          // Vérifier si la voiture est disponible à la location
          if (!data.a_louer) {
            setError('Cette voiture n\'est pas disponible à la location');
            return;
          }
          
          setVoiture(data);
          setTotalPrice(parseFloat(data.prix_location) || 0);
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
        }

      } catch (error) {
        console.error('Erreur lors du chargement de la voiture:', error);
        if (error.message === 'Token d\'authentification manquant') {
          navigate('/login');
        } else {
          setError(error.message || 'Erreur lors du chargement de la voiture');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVoiture();
    }
  }, [id, navigate]);

  // Fonction pour rafraîchir le token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Aucun token de rafraîchissement disponible');
      }

      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (!response.ok) {
        throw new Error('Impossible de rafraîchir le token');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  };

  // Calculer le nombre de jours et le prix total
  useEffect(() => {
    if (dateDebut && dateFin && voiture) {
      const start = new Date(dateDebut);
      const end = new Date(dateFin);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setNombreJours(diffDays);
        setTotalPrice(parseFloat(voiture.prix_location) * diffDays);
      } else {
        setNombreJours(1);
        setTotalPrice(parseFloat(voiture.prix_location));
      }
    }
  }, [dateDebut, dateFin, voiture]);

  const handleRetour = () => {
    navigate('/rent');
  };

  const handleLouer = async () => {
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today || end < today) {
    alert("Les dates de location doivent être à partir d'aujourd'hui.");
    return;
  }

  if (start >= end) {
    alert("La date de début doit être antérieure à la date de fin.");
    return;
  }

  // Vérifie si la voiture est déjà réservée pour ces dates
  const isAvailable = !voiture.reservations?.some(reservation => {
    const resStart = new Date(reservation.date_debut);
    const resEnd = new Date(reservation.date_fin);
    return (start < resEnd && end > resStart);
  });

  if (!isAvailable) {
    alert("Cette voiture est déjà réservée pour les dates sélectionnées.");
    return;
  }

  // Calcule le nombre de jours
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  navigate('/payment', { 
    state: { 
      voiture: voiture,
      isRental: true,
      dateDebut: dateDebut,
      dateFin: dateFin,
      totalPrice: totalPrice,
      reservation: null, // Pas de réservation créée
      nombreJours: diffDays
    } 
  });
};


  // Format price with spaces for thousands
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Obtenir la date minimum (aujourd'hui)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Obtenir la date minimum pour la date de fin (lendemain de la date de début)
  const getMinEndDate = () => {
    if (!dateDebut) return getMinDate();
    const startDate = new Date(dateDebut);
    startDate.setDate(startDate.getDate() + 1);
    return startDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Chargement de la voiture...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="bg-red-900/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-red-300">Erreur</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <button
              onClick={handleRetour}
              className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition-all duration-300"
            >
              Retour aux voitures
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!voiture) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
        <NavBar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-white text-xl">Voiture non trouvée</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <button 
            onClick={handleRetour}
            className="mb-8 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Retour
          </button>
          
          <div className="bg-gradient-to-br from-purple-900 via-gray-900 to-black border border-white/[0.2] rounded-xl overflow-hidden shadow-2xl shadow-purple-500/[0.1]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image section */}
              <div className="h-64 md:h-auto">
                <img 
                  src={voiture.image} 
                  alt={`${voiture.marque} ${voiture.modele}`} 
                  className="w-full h-full object-contain ml-4"
                />
              </div>

              {/* Info section */}
              <div className="p-6 text-white">
                <h1 className="text-3xl font-bold text-white">{voiture.marque}</h1>
                <h2 className="text-2xl font-semibold text-purple-300 mt-1">{voiture.modele}</h2>
                
                <div className="mt-6 grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="text-gray-400">Couleur:</span>
                    <span className="ml-2">{voiture.couleur}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Kilométrage:</span>
                    <span className="ml-2">{voiture.kilometrage} km</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Carburant:</span>
                    <span className="ml-2">{voiture.type_carburant}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Boîte:</span>
                    <span className="ml-2">{voiture.boite_a_vitesse}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Année:</span>
                    <span className="ml-2">{voiture.annee}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white">
                    Prix: {formatPrice(parseFloat(voiture.prix_location))} DH/jour
                  </h3>
                </div>
                
                {/* Location details */}
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-1">Date de début:</label>
                    <input 
                      type="date" 
                      value={dateDebut} 
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      min={getMinDate()}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">Date de fin:</label>
                    <input 
                      type="date" 
                      value={dateFin} 
                      onChange={(e) => setDateFin(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                      min={getMinEndDate()}
                      disabled={isSubmitting || !dateDebut}
                    />
                  </div>
                  
                  {dateDebut && dateFin && nombreJours > 0 && (
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-purple-500/30">
                      <div className="flex justify-between mb-2">
                        <span>Durée:</span>
                        <span>{nombreJours} jour{nombreJours > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex justify-between font-bold text-purple-300">
                        <span>Total:</span>
                        <span>{formatPrice(totalPrice)} DH</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={handleLouer}
                    disabled={isSubmitting || !dateDebut || !dateFin || nombreJours <= 0}
                    className="w-full px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Réservation en cours...
                      </>
                    ) : (
                      'Réserver maintenant'
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Description section */}
            <div className="p-6 border-t border-white/[0.1] text-white">
              <h3 className="text-xl font-bold mb-4">Description</h3>
              <p className="text-gray-300">
                {voiture.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default RentCar;