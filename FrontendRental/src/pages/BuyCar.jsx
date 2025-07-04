import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const BuyCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [voiture, setVoiture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les données de la voiture depuis l'API
  useEffect(() => {
    const fetchVoiture = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token') || localStorage.getItem('access');
        if (!token) {
          setError('Token d\'authentification manquant');
          navigate('/login');
          return;
        }

        const response = await fetch(`http://localhost:8000/api/voitures/${id}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.status === 401) {
          const refreshSuccess = await refreshToken();
          if (!refreshSuccess) {
            navigate('/login');
            return;
          }
          const newToken = localStorage.getItem('access_token');
          const retryResponse = await fetch(`http://localhost:8000/api/voitures/${id}/`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${newToken}`
            },
          });
          if (!retryResponse.ok) throw new Error('Erreur lors du chargement de la voiture');
          const retryData = await retryResponse.json();
          setVoiture(retryData);
        } else if (response.ok) {
          const data = await response.json();
          if (!data.a_vendre) {
            setError('Cette voiture n\'est pas disponible à la vente');
            return;
          }
          setVoiture(data);
        } else {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
      } catch (error) {
        setError(error.message || 'Erreur lors du chargement de la voiture');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchVoiture();
  }, [id, navigate]);

  // Fonction pour rafraîchir le token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error('Aucun token de rafraîchissement disponible');
      const response = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });
      if (!response.ok) throw new Error('Impossible de rafraîchir le token');
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return true;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return false;
    }
  };

  const handleRetour = () => {
    navigate('/buy');
  };

  const handleAcheter = () => {
    navigate(`/payment/${voiture.id}`, {
      state: {
        voiture: voiture,
        isRental: false
      }
    });
  };

  // Format price with spaces for thousands
  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") : "";
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
          
          <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black border border-white/[0.2] rounded-xl overflow-hidden shadow-2xl shadow-blue-500/[0.1]">
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
                <h2 className="text-2xl font-semibold text-blue-300 mt-1">{voiture.modele}</h2>
                
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
                    Prix: {formatPrice(parseFloat(voiture.prix_vente))} DH
                  </h3>
                </div>
                
                <div className="mt-8">
                  <button 
                    onClick={handleAcheter}
                    className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                  >
                    Finaliser l'achat
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

export default BuyCar;