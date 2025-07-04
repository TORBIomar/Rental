import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const SupprimerVoiture = () => {
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      setError('Vous devez être connecté pour supprimer une voiture. Veuillez vous reconnecter.');
    }
  }, []);

  // Recherche de l'ID de la voiture par marque et modèle
  const fetchIdVoiture = async (marqueRecherche, modeleRecherche) => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/voitures/', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des voitures.');
      }
      const voitures = await response.json();

      const voitureTrouvee = voitures.find(v => 
        v.marque.toLowerCase().trim() === marqueRecherche.toLowerCase().trim() &&
        v.modele.toLowerCase().trim() === modeleRecherche.toLowerCase().trim()
      );

      setLoading(false);
      return voitureTrouvee ? voitureTrouvee.id : null;
    } catch (error) {
      console.error(error);
      setLoading(false);
      return null;
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!marque.trim() || !modele.trim()) {
      setError('Veuillez remplir la marque et le modèle.');
      return;
    }

    const idVoiture = await fetchIdVoiture(marque, modele);

    if (!idVoiture) {
      setError('Aucune voiture trouvée avec cette marque et ce modèle.');
      return;
    }

    if (!window.confirm(`Voulez-vous vraiment supprimer la voiture ${marque} ${modele} ?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/api/voitures/${idVoiture}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`,
        },
      });

      setLoading(false);

      if (response.ok) {
        setSuccess(`La voiture ${marque} ${modele} a bien été supprimée.`);
        setMarque('');
        setModele('');
      } else {
        setError('Erreur lors de la suppression de la voiture.');
      }
    } catch (err) {
      setLoading(false);
      setError('Erreur réseau ou serveur.');
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen text-white flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Accès refusé</h1>
            <p className="text-gray-400">Vous devez être connecté pour supprimer une voiture.</p>
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
        <h1 className="text-4xl font-bold text-[#d70000]">
  Supprimer une Voiture par Marque et Modèle
</h1>
        <p className="text-gray-400 mt-2">Entrez la marque et le modèle de la voiture à supprimer</p>
      </div>
      <form
        onSubmit={handleDelete}
        className="max-w-xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6 mb-8"
      >
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Marque</label>
          <input
            type="text"
            value={marque}
            onChange={(e) => setMarque(e.target.value)}
            placeholder="Marque"
            className="p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-pink-500 border border-gray-600"
            required
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-semibold">Modèle</label>
          <input
            type="text"
            value={modele}
            onChange={(e) => setModele(e.target.value)}
            placeholder="Modèle"
            className="p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-pink-500 border border-gray-600"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-[#d70000] hover:bg-p[#d70000] text-white font-semibold py-3 px-6 rounded-lg shadow transition flex items-center justify-center"
          disabled={loading}
        >
          {loading ? 'Suppression en cours...' : 'Supprimer la voiture'}
        </button>
        {error && <p className="mt-2 text-red-500 font-semibold">{error}</p>}
        {success && <p className="mt-2 text-green-500 font-semibold">{success}</p>}
        <div className="mt-6 flex justify-center">
          <a
            href="/gestionvoitures"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
          >
            Retour
          </a>
        </div>
      </form>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default SupprimerVoiture;
