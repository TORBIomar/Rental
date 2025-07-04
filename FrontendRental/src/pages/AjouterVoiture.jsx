import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const AjouterVoiture = () => {
  const [formData, setFormData] = useState({
    marque: '',
    modele: '',
    couleur: '',
    kilometrage: '',
    type_carburant: '',
    boite_a_vitesse: '',
    annee: '',
    prix_vente: '',
    prix_location: '',
    description: '',
    a_vendre: false,
    a_louer: false,
    image: null,
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access');
      console.log('Token trouvé:', token ? 'Oui' : 'Non');
      console.log('Token value:', token);
      
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setError('Vous devez être connecté pour ajouter une voiture. Veuillez vous reconnecter.');
      }
    };
    
    checkAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.marque.trim()) errors.push('La marque est requise');
    if (!formData.modele.trim()) errors.push('Le modèle est requis');
    if (!formData.annee || formData.annee < 1900 || formData.annee > new Date().getFullYear() + 1)
      errors.push('Année invalide');
    if (!formData.prix_vente || parseFloat(formData.prix_vente) < 0)
      errors.push('Prix de vente invalide');
    if (!formData.prix_location || parseFloat(formData.prix_location) < 0)
      errors.push('Prix de location invalide');
    if (!formData.a_vendre && !formData.a_louer)
      errors.push('La voiture doit être soit à vendre soit à louer');
    return errors;
  };

  // Fonction pour rafraîchir le token
  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh');
      if (!refreshTokenValue) {
        throw new Error('Pas de refresh token');
      }

      const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh: refreshTokenValue
      });

      const newAccessToken = response.data.access;
      localStorage.setItem('access', newAccessToken);
      setIsAuthenticated(true);
      return newAccessToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      setIsAuthenticated(false);
      setError('Session expirée. Veuillez vous reconnecter.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    // Vérification de l'authentification
    if (!isAuthenticated) {
      setError('Vous devez être connecté pour ajouter une voiture.');
      setLoading(false);
      return;
    }

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(`Erreurs de validation: ${validationErrors.join(', ')}`);
      setLoading(false);
      return;
    }

    let token = localStorage.getItem('access');
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      setError('Token d\'accès manquant. Veuillez vous reconnecter.');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('marque', formData.marque.trim());
    data.append('modele', formData.modele.trim());
    data.append('couleur', formData.couleur.trim());
    data.append('kilometrage', formData.kilometrage.trim());
    data.append('type_carburant', formData.type_carburant.trim());
    data.append('boite_a_vitesse', formData.boite_a_vitesse.trim());
    data.append('annee', parseInt(formData.annee));
    data.append('prix_vente', parseFloat(formData.prix_vente).toFixed(2));
    data.append('prix_location', parseFloat(formData.prix_location).toFixed(2));
    data.append('description', formData.description.trim());
    data.append('a_vendre', formData.a_vendre);
    data.append('a_louer', formData.a_louer);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      console.log('Envoi avec token:', token);
      const response = await axios.post('http://127.0.0.1:8000/api/voitures/', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      setSuccess('Voiture ajoutée avec succès !');
      setFormData({
        marque: '',
        modele: '',
        couleur: '',
        kilometrage: '',
        type_carburant: '',
        boite_a_vitesse: '',
        annee: '',
        prix_vente: '',
        prix_location: '',
        description: '',
        a_vendre: false,
        a_louer: false,
        image: null,
      });
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Erreur complète:', err);
      
      if (err.response) {
        if (err.response.status === 401) {
          console.log('Token expiré, tentative de rafraîchissement...');
          const newToken = await refreshToken();
          if (newToken) {
            // Retry with new token
            try {
              const retryResponse = await axios.post('http://127.0.0.1:8000/api/voitures/', data, {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                  'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
              });
              setSuccess('Voiture ajoutée avec succès !');
              // Reset form...
            } catch (retryErr) {
              setError('Erreur lors de la nouvelle tentative après rafraîchissement du token.');
            }
          }
        } else if (err.response.status === 400) {
          const serverErrors = err.response.data;
          if (typeof serverErrors === 'object') {
            const errorMessages = Object.entries(serverErrors)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
            setError(`Erreurs: ${errorMessages}`);
          } else {
            setError(`Erreur: ${serverErrors}`);
          }
        } else if (err.response.status === 413) {
          setError('L\'image est trop volumineuse. Veuillez choisir une image plus petite.');
        } else {
          setError(`Erreur serveur: ${err.response.status} - ${err.response.data?.detail || 'Erreur inconnue'}`);
        }
      } else if (err.request) {
        setError('Impossible de contacter le serveur. Vérifiez votre connexion.');
      } else {
        setError('Erreur inconnue.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Si pas authentifié, afficher un message
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen text-white flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Accès refusé</h1>
            <p className="text-gray-400">Vous devez être connecté pour ajouter une voiture.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>
      <div className="pt-24 pb-6 text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Ajouter une Voiture
        </h1>
        <p className="text-gray-400 mt-2">Remplissez les informations ci-dessous</p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl space-y-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { name: 'marque', label: 'Marque' },
            { name: 'modele', label: 'Modèle' },
            { name: 'couleur', label: 'Couleur' },
            { name: 'kilometrage', label: 'Kilométrage' },
            { name: 'type_carburant', label: 'Type de carburant' },
            { name: 'boite_a_vitesse', label: 'Boîte à vitesse' },
            { name: 'annee', label: 'Année', type: 'number', min: 1900, max: new Date().getFullYear() + 1 },
            { name: 'prix_vente', label: 'Prix de vente (DH)', type: 'number', step: '0.01', min: '0' },
            { name: 'prix_location', label: 'Prix de location (DH/jour)', type: 'number', step: '0.01', min: '0' },
          ].map(({ name, label, type, min, max, step }) => (
            <div key={name} className="flex flex-col">
              <label className="mb-1 text-sm font-semibold">{label}</label>
              <input
                type={type || 'text'}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                className="p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 border border-gray-600"
                required
                disabled={loading}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 border border-gray-600"
            required
            disabled={loading}
          />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="a_vendre"
              checked={formData.a_vendre}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
              disabled={loading}
            />
            À vendre
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="a_louer"
              checked={formData.a_louer}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-cyan-600 rounded border-gray-300 focus:ring-cyan-500"
              disabled={loading}
            />
            À louer
          </label>
        </div>
        <div className="mt-4">
          <label className="block mb-2 text-sm font-semibold">
            Image de la voiture <span className="text-gray-400 text-xs">(optionnelle, max 5MB)</span>
          </label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            accept="image/*"
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow transition flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
              Envoi...
            </>
          ) : (
            'Ajouter la voiture'
          )}
        </button>
        {error && <p className="mt-4 text-red-500 font-semibold">{error}</p>}
        {success && <p className="mt-4 text-green-500 font-semibold">{success}</p>}
        <div className="max-w-3xl mx-auto mb-4">
        </div>
        {/* Bouton Retour */}
        <div className="mt-6 flex justify-center">
          <a
            href="/gestionvoitures"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
          >
            Retour
          </a>
        </div>
      </form>
      <div className='mt-auto'>
        <Footer />
      </div>
    </div>
  );
};

export default AjouterVoiture;