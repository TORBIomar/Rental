import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Car, User, FileText, CheckCircle2, XCircle, Clock, Mail, CreditCard, Banknote } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const getStatus = (statut) => {
  if (statut === 'EN_ATTENTE') return { label: 'En attente', bg: 'bg-yellow-500', text: 'text-yellow-100', Icon: Clock };
  if (statut === 'VALIDE') return { label: 'Validée', bg: 'bg-green-500', text: 'text-green-100', Icon: CheckCircle2 };
  if (statut === 'REFUSE') return { label: 'Refusée', bg: 'bg-red-500', text: 'text-red-100', Icon: XCircle };
  return { label: statut, bg: 'bg-blue-500', text: 'text-blue-100', Icon: Clock };
};

const GestionLocation = () => {
  const [pendingLocations, setPendingLocations] = useState([]);
  const [historyLocations, setHistoryLocations] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contrats, setContrats] = useState({});
  const [uploadingContract, setUploadingContract] = useState({});
  const token = localStorage.getItem('access');

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/locations/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('Données récupérées:', data); // Pour débugger
      
      setPendingLocations(data.filter(l => l.statut === 'EN_ATTENTE'));
      setHistoryLocations(data.filter(l => l.statut === 'VALIDE' || l.statut === 'REFUSE'));
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError("Erreur lors du chargement des locations.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`http://localhost:8000/api/locations/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ statut: action === 'valider' ? 'VALIDE' : 'REFUSE' })
      });
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }
      
      await fetchLocations();
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      setError("Erreur lors de la mise à jour de la location.");
    }
  };

  const handleAddContract = async (id) => {
    const file = contrats[id];
    if (!file) {
      setError("Veuillez sélectionner un fichier avant d'ajouter le contrat.");
      return;
    }

    setUploadingContract(prev => ({ ...prev, [id]: true }));
    
    const formData = new FormData();
    formData.append('contract', file);

    try {
      console.log('Envoi du fichier:', file.name, 'pour la location:', id);
      
      const res = await fetch(`http://localhost:8000/api/locations/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`Erreur HTTP: ${res.status} - ${errorText}`);
      }
      
      const responseData = await res.json();
      console.log('Réponse serveur:', responseData);
      
      await fetchLocations();
      setContrats(prev => ({ ...prev, [id]: null }));
      // Réinitialiser l'input file
      const fileInput = document.querySelector(`input[data-location-id="${id}"]`);
      if (fileInput) fileInput.value = '';
      
      setError(null); // Effacer les erreurs précédentes
      
    } catch (err) {
      console.error('Erreur lors de l\'ajout du contrat:', err);
      setError(`Erreur lors de l'ajout du contrat: ${err.message}`);
    } finally {
      setUploadingContract(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => { fetchLocations(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
          <p className="text-xl">Chargement des locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <div className="top-0 left-0 w-full z-50">
          <NavBar />
        </div>
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 max-w-md">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-400 text-xl mb-6">{error}</p>
            <button 
              onClick={() => {
                setError(null);
                fetchLocations();
              }}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Réessayer
            </button>
          </div>
        </div>
        <div className="mt-auto">
        <Footer />
      </div>
      </div>
    );
  }

  const renderCard = (loc, isPending) => {
    const status = getStatus(loc.statut);
    const isUploading = uploadingContract[loc.id];
    
    return (
      <motion.div
        key={loc.id}
        whileHover={{ scale: 1.02 }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className={`rounded-2xl p-6 shadow-2xl border backdrop-blur-sm bg-gradient-to-br from-blue-800/80 to-blue-900/80 border-blue-500/30 mb-6`}
      >
        <div className="flex items-center mb-4 space-x-3">
          <Car className="h-7 w-7 text-blue-300" />
          <span className="text-xl font-bold text-white">
            {loc.voiture?.marque || 'N/A'} {loc.voiture?.modele || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <User className="h-5 w-5" />
          <span>Client: {loc.client?.user?.username || 'N/A'}</span>
        </div>
        
        {/* Affichage de l'email si disponible */}
        {loc.client?.user?.email && (
          <div className="flex items-center mb-2 space-x-2 text-gray-300">
            <Mail className="h-5 w-5" />
            <span className="text-sm">Email: {loc.client.user.email}</span>
          </div>
        )}
        
        <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <Calendar className="h-5 w-5" />
          <span>Début : <span className="text-white">{loc.date_debut}</span></span>
        </div>
        
        <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <Calendar className="h-5 w-5" />
          <span>Fin : <span className="text-white">{loc.date_fin}</span></span>
        </div>
        
        <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <Banknote className="h-5 w-5" />
          <span>Coût total : <span className="text-white font-semibold">{loc.cout_total}€DH</span></span>
        </div>
        
        {/* Affichage du type de paiement */}
        {loc.paiements && loc.paiements.length > 0 && (
          <div className="flex items-center mb-2 space-x-2 text-gray-300">
            <CreditCard className="h-5 w-5" />
            <span>Type de paiement : 
              <span className="text-white font-medium ml-1">
                {loc.paiements[0].type_paiement || 'N/A'}
              </span>
            </span>
          </div>
        )}
        
        {/* Afficher plusieurs paiements si nécessaire */}
        {loc.paiements && loc.paiements.length > 1 && (
          <div className="flex items-center mb-2 space-x-2 text-gray-300">
            <span className="text-sm text-blue-300">
              ({loc.paiements.length} paiements au total)
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            <status.Icon className="h-4 w-4 mr-1" />
            {status.label}
          </span>
          {isPending && (
            <div className="space-x-2">
              <button
                onClick={() => handleAction(loc.id, 'valider')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors"
              >
                Valider
              </button>
              <button
                onClick={() => handleAction(loc.id, 'refuser')}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg transition-colors"
              >
                Refuser
              </button>
            </div>
          )}
        </div>
        
        {/* Section contrat */}
        <div className="border-t border-gray-600 pt-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-300">Contrat (PDF uniquement):</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              data-location-id={loc.id}
              onChange={(e) => setContrats(prev => ({ ...prev, [loc.id]: e.target.files[0] }))}
              className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <button
              onClick={() => handleAddContract(loc.id)}
              disabled={!contrats[loc.id] || isUploading}
              className={`text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                !contrats[loc.id] || isUploading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-1" /> Ajouter contrat
                </>
              )}
            </button>
          </div>
          
          {/* Afficher le contrat existant s'il y en a un */}
          {loc.contract && (
            <div className="mt-2 p-2 bg-green-900/20 rounded border border-green-500/30">
              <span className="text-green-400 text-sm">✓ Contrat déjà ajouté</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>
      
      <main className="flex-grow px-6 py-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Gestion des Locations
          </h1>
          <p className="text-gray-400 text-lg">Validez, refusez ou consultez l'historique des locations</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-300">
              Locations en attente ({pendingLocations.length})
            </h2>
            {pendingLocations.length === 0 ? (
              <div className="text-gray-400 text-center py-16 bg-gray-800/20 rounded-lg border border-gray-600/30">
                Aucune location en attente.
              </div>
            ) : (
              pendingLocations.map(loc => renderCard(loc, true))
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-300">
              Historique des locations ({historyLocations.length})
            </h2>
            {historyLocations.length === 0 ? (
              <div className="text-gray-400 text-center py-16 bg-gray-800/20 rounded-lg border border-gray-600/30">
                Aucun historique disponible.
              </div>
            ) : (
              historyLocations.map(loc => renderCard(loc, false))
            )}
          </section>
        </div>
      </main>
      <div className="mt-8 flex justify-center">
                    <a
                        href="/admin"
                        className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-semibold py-3 px-6 rounded-xl shadow hover:scale-105 transition duration-300"
                    >
                        Retour
                    </a>
                </div>
                <br />
                <br />
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default GestionLocation;