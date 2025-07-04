import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import FloatingCarCard from '../components/FloatingCarCard';

const Rent = () => {
  const [voitures, setVoitures] = useState([]);
  const [voituresFiltrees, setVoituresFiltrees] = useState([]);
  const [marques, setMarques] = useState([]);
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [marqueSelectionnee, setMarqueSelectionnee] = useState('');
  const [modeleSelectionne, setModeleSelectionne] = useState('');
  const [prixMin, setPrixMin] = useState('');
  const [prixMax, setPrixMax] = useState('');

  useEffect(() => {
    const fetchVoitures = async () => {
      try {
        setLoading(true);
        setError(null);

        // Essayer d'abord avec authentification si disponible
        const possibleKeys = ['access_token', 'accessToken', 'token', 'authToken', 'access'];
        let token = null;
        for (const key of possibleKeys) {
          const value = localStorage.getItem(key);
          if (value) {
            token = value;
            break;
          }
        }

        let successful = false;
        let voituresData = [];

        // Si on a un token, essayer avec authentification
        if (token) {
          const authFormats = [
            `Bearer ${token}`,
            `Token ${token}`,
            token
          ];

          for (let i = 0; i < authFormats.length && !successful; i++) {
            const authHeader = authFormats[i];
            try {
              const response = await fetch('http://localhost:8000/api/voitures/', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': authHeader
                },
              });
              
              if (response.ok) {
                successful = true;
                const data = await response.json();
                if (Array.isArray(data)) {
                  voituresData = data;
                }
                console.log('Données récupérées avec authentification');
                break;
              }
            } catch (err) {
              console.log(`Échec authentification avec ${authHeader}`);
              continue;
            }
          }
        }

        // Si l'authentification a échoué ou n'était pas disponible, essayer sans authentification
        if (!successful) {
          try {
            console.log('Tentative sans authentification...');
            const response = await fetch('http://localhost:8000/api/voitures/', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              },
            });
            
            if (response.ok) {
              successful = true;
              const data = await response.json();
              if (Array.isArray(data)) {
                voituresData = data;
              }
              console.log('Données récupérées sans authentification');
            } else {
              console.error(`Erreur API: ${response.status} - ${response.statusText}`);
              throw new Error(`Impossible d'accéder aux données. Statut: ${response.status}`);
            }
          } catch (err) {
            console.error('Erreur lors de la requête:', err);
            throw new Error('Impossible de se connecter au serveur. Vérifiez que l\'API est accessible.');
          }
        }

        if (successful && Array.isArray(voituresData)) {
          // Filtrer les voitures à louer et formater les données
          const voituresALouer = voituresData
            .filter(v => v && v.a_louer === true)
            .map(v => ({
              id: v.id,
              marque: v.marque || '',
              modele: v.modele || '',
              couleur: v.couleur || '',
              kilometrage: v.kilometrage || '',
              typeCarburant: v.type_carburant || '',
              boiteVitesse: v.boite_a_vitesse || '',
              annee: v.annee || 0,
              prixVente: parseFloat(v.prix_vente) || 0,
              prixLocation: parseFloat(v.prix_location) || 0,
              description: v.description || '',
              image: v.image || '',
              aVendre: v.a_vendre || false,
              aLouer: v.a_louer || false
            }));

          setVoitures(voituresALouer);
          setVoituresFiltrees(voituresALouer);

          // Extraire les marques uniques
          const marquesUniques = [...new Set(voituresALouer
            .map(v => v.marque)
            .filter(marque => marque && marque.trim() !== '')
          )];
          setMarques(marquesUniques);

          console.log(`${voituresALouer.length} voitures à louer trouvées`);
        } else {
          throw new Error('Aucune donnée de voiture reçue du serveur');
        }

      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setError(error.message || 'Erreur lors du chargement des voitures');
      } finally {
        setLoading(false);
      }
    };

    fetchVoitures();
  }, []);

  useEffect(() => {
    if (marqueSelectionnee && voitures.length > 0) {
      const modelesFiltres = [...new Set(
        voitures
          .filter(v => v.marque === marqueSelectionnee)
          .map(v => v.modele)
          .filter(modele => modele && modele.trim() !== '')
      )];
      setModeles(modelesFiltres);
    } else {
      setModeles([]);
    }
    setModeleSelectionne('');
  }, [marqueSelectionnee, voitures]);

  useEffect(() => {
    if (voitures.length === 0) return;
    let resultat = [...voitures];
    
    if (marqueSelectionnee && marqueSelectionnee.trim() !== '') {
      resultat = resultat.filter(v => v.marque === marqueSelectionnee);
    }
    
    if (modeleSelectionne && modeleSelectionne.trim() !== '') {
      resultat = resultat.filter(v => v.modele === modeleSelectionne);
    }
    
    if (prixMin && prixMin.trim() !== '') {
      const prixMinParsed = parseFloat(prixMin);
      if (!isNaN(prixMinParsed) && prixMinParsed >= 0) {
        resultat = resultat.filter(v => v.prixLocation >= prixMinParsed);
      }
    }
    
    if (prixMax && prixMax.trim() !== '') {
      const prixMaxParsed = parseFloat(prixMax);
      if (!isNaN(prixMaxParsed) && prixMaxParsed >= 0) {
        resultat = resultat.filter(v => v.prixLocation <= prixMaxParsed);
      }
    }
    
    setVoituresFiltrees(resultat);
  }, [voitures, marqueSelectionnee, modeleSelectionne, prixMin, prixMax]);

  const resetFiltres = () => {
    setMarqueSelectionnee('');
    setModeleSelectionne('');
    setPrixMin('');
    setPrixMax('');
  };

  const handlePrixChange = (value, setter) => {
    if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
      setter(value);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
        <div className="top-0 left-0 w-full z-50">
          <NavBar />
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-xl">Chargement des voitures...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
        <div className="top-0 left-0 w-full z-50">
          <NavBar />
        </div>
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="bg-red-900/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center max-w-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-300">Problème de connexion</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">
                Vérifiez que votre serveur Django est démarré sur http://localhost:8000
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition-all duration-300"
              >
                Réessayer
              </button>
            </div>
          </div>
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
      <div className="flex-grow py-16 px-4 sm:px-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Nos Voitures à Louer
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Découvrez notre sélection de véhicules disponibles à la location. Utilisez les filtres ci-dessous pour affiner votre recherche.
          </p>
        </div>

        {/* Section des filtres */}
        <div className="max-w-7xl mx-auto bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl mt-8">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Marque</label>
              <select 
                value={marqueSelectionnee} 
                onChange={(e) => setMarqueSelectionnee(e.target.value)} 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Toutes les marques</option>
                {marques.map(marque => (
                  <option key={marque} value={marque}>{marque}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Modèle</label>
              <select 
                value={modeleSelectionne} 
                onChange={(e) => setModeleSelectionne(e.target.value)} 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50" 
                disabled={!marqueSelectionnee}
              >
                <option value="">Tous les modèles</option>
                {modeles.map(modele => (
                  <option key={modele} value={modele}>{modele}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prix minimum (DH)</label>
              <input 
                type="number" 
                min="0" 
                value={prixMin} 
                onChange={(e) => handlePrixChange(e.target.value, setPrixMin)} 
                placeholder="Prix min" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prix maximum (DH)</label>
              <input 
                type="number" 
                min="0" 
                value={prixMax} 
                onChange={(e) => handlePrixChange(e.target.value, setPrixMax)} 
                placeholder="Prix max" 
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
          <div className="text-center mt-6">
            <button 
              onClick={resetFiltres} 
              className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* Section des résultats */}
        <div className="max-w-7xl mx-auto mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {voituresFiltrees.length} {voituresFiltrees.length > 1 ? 'voitures trouvées' : 'voiture trouvée'}
            </h2>
            {voituresFiltrees.length > 0 && (
              <span className="text-sm text-gray-400">
                
              </span>
            )}
          </div>
          
          {voituresFiltrees.length === 0 ? (
            <div className="text-center mt-12 py-16">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold text-gray-300 mb-4">
                  Aucune voiture trouvée
                </h3>
                <p className="text-gray-400 mb-6">
                  Aucune voiture ne correspond à vos critères de recherche.
                </p>
                <button 
                  onClick={resetFiltres}
                  className="px-8 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                >
                  Voir toutes les voitures
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {voituresFiltrees.map(voiture => (
                <FloatingCarCard key={voiture.id} voiture={voiture} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className='mt-auto'>
        <Footer />
      </div>
    </div>
  );
};

export default Rent;