import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, User, FileText, CheckCircle2, XCircle, Clock, Calendar, Download, Mail, CreditCard , Banknote } from 'lucide-react';
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

const GestionVentes = () => {
  const [pendingSales, setPendingSales] = useState([]);
  const [historySales, setHistorySales] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [justificatifs, setJustificatifs] = useState({});
  const [uploadingJustificatif, setUploadingJustificatif] = useState({});
  const token = localStorage.getItem('access');

  const fetchSales = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      console.log('Fetching sales with token:', token ? 'Token présent' : 'Pas de token');
      
      const res = await fetch('http://localhost:8000/api/ventes/', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erreur API:', errorText);
        throw new Error(`Erreur HTTP: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Données récupérées:', data);
      console.log('Nombre de ventes:', data.length);
      
      // Vérifiez la structure de vos objets vente
      if (data.length > 0) {
        console.log('Exemple de vente:', data[0]);
        console.log('Champs disponibles:', Object.keys(data[0]));
        console.log('Contract présent:', !!data[0].contract);
        console.log('Paiements présents:', !!data[0].paiements);
        console.log('Statut de la première vente:', data[0].statut);
      }
      
      const pending = data.filter(v => v.statut === 'EN_ATTENTE');
      const history = data.filter(v => v.statut === 'VALIDE' || v.statut === 'REFUSE');
      
      console.log('Ventes en attente:', pending.length);
      console.log('Ventes dans l\'historique:', history.length);
      
      setPendingSales(pending);
      setHistorySales(history);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement:', err);
      setError(`Erreur lors du chargement des ventes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      console.log(`Action ${action} pour la vente ${id}`);
      
      const res = await fetch(`http://localhost:8000/api/ventes/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ statut: action === 'valider' ? 'VALIDE' : 'REFUSE' })
      });
      
      console.log('Status de la réponse:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erreur serveur:', errorText);
        throw new Error(`Erreur HTTP: ${res.status} - ${errorText}`);
      }
      
      const responseData = await res.json();
      console.log('Réponse serveur:', responseData);
      
      // Recharger les données
      await fetchSales();
      
      // Message de succès
      console.log(`Vente ${action === 'valider' ? 'validée' : 'refusée'} avec succès`);
      
    } catch (err) {
      console.error('Erreur complète lors de la mise à jour:', err);
      setError(`Erreur lors de la mise à jour de la vente: ${err.message}`);
    }
  };

  const handleAddJustificatif = async (id) => {
    const file = justificatifs[id];
    if (!file) {
      setError("Veuillez sélectionner un fichier avant d'ajouter le justificatif.");
      return;
    }

    // Validation du fichier
    if (!file.type.includes('pdf')) {
      setError("Seuls les fichiers PDF sont acceptés.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Le fichier est trop volumineux (max 5MB).");
      return;
    }

    setUploadingJustificatif(prev => ({ ...prev, [id]: true }));
    
    const formData = new FormData();
    formData.append('contract', file);

    try {
      console.log('Envoi du fichier:', file.name, 'pour la vente:', id);
      console.log('Type de fichier:', file.type);
      console.log('Taille du fichier:', file.size);
      
      const res = await fetch(`http://localhost:8000/api/ventes/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`
          // Pas de Content-Type pour FormData
        },
        body: formData
      });
      
      console.log('Status de la réponse:', res.status);
      console.log('Headers de la réponse:', [...res.headers.entries()]);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Erreur serveur complète:', errorText);
        throw new Error(`Erreur HTTP: ${res.status} - ${errorText}`);
      }
      
      const responseData = await res.json();
      console.log('Réponse serveur complète:', responseData);
      
      await fetchSales();
      setJustificatifs(prev => ({ ...prev, [id]: null }));
      
      // Réinitialiser l'input file
      const fileInput = document.querySelector(`input[data-vente-id="${id}"]`);
      if (fileInput) fileInput.value = '';
      
      setError(null);
      console.log('Justificatif ajouté avec succès!');
      
    } catch (err) {
      console.error('Erreur complète lors de l\'ajout du justificatif:', err);
      setError(`Erreur lors de l'ajout du justificatif: ${err.message}`);
    } finally {
      setUploadingJustificatif(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => { 
    fetchSales(); 
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
          <p className="text-xl">Chargement des ventes...</p>
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
                fetchSales();
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

  const renderCard = (vente, isPending) => {
    const status = getStatus(vente.statut);
    const isUploading = uploadingJustificatif[vente.id];
    
    return (
      <motion.div
        key={vente.id}
        whileHover={{ scale: 1.02 }}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="rounded-2xl p-6 shadow-2xl border backdrop-blur-sm bg-gradient-to-br from-blue-800/80 to-blue-900/80 border-blue-500/30 mb-6"
      >
        <div className="flex items-center mb-4 space-x-3">
          <ShoppingCart className="h-7 w-7 text-blue-300" />
          <span className="text-xl font-bold text-white">
            {vente.voiture?.marque || 'N/A'} {vente.voiture?.modele || 'N/A'}
          </span>
        </div>
        
        <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <User className="h-5 w-5" />
          <span>Client: {vente.client?.user?.username || 'N/A'}</span>
        </div>
        
        {/* Affichage de l'email si disponible */}
        {vente.client?.user?.email && (
          <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <Mail className="h-5 w-5" />
            <span className="text-sm">Email: {vente.client.user.email}</span>
          </div>
        )}
        
        <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <Calendar className="h-5 w-5" />
          <span>Date d'achat : <span className="text-white">{vente.date_achat}</span></span>
        </div>
        
        <div className="flex items-center mb-2 space-x-2 text-gray-300">
          <Banknote className="h-5 w-5" />
          <span>Prix de vente : <span className="text-white font-semibold">{vente.prix_vente}DH</span></span>
        </div>
        
        {/* Affichage du type de paiement */}
        {vente.paiements && vente.paiements.length > 0 && (
          <div className="flex items-center mb-2 space-x-2 text-gray-300">
            <CreditCard className="h-5 w-5" />
            <span>Type de paiement : 
              <span className="text-white font-medium ml-1">
                {vente.paiements[0].type_paiement || 'N/A'}
              </span>
            </span>
          </div>
        )}
        
        {/* Afficher plusieurs paiements si nécessaire */}
        {vente.paiements && vente.paiements.length > 1 && (
          <div className="flex items-center mb-2 space-x-2 text-gray-300">
            <span className="text-sm text-blue-300">
              ({vente.paiements.length} paiements au total)
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
            <status.Icon className="h-4 w-4 mr-1" />
            {status.label}
          </span>
          {isPending && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('Bouton Valider cliqué pour vente:', vente.id);
                  handleAction(vente.id, 'valider');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Valider</span>
              </button>
              <button
                onClick={() => {
                  console.log('Bouton Refuser cliqué pour vente:', vente.id);
                  handleAction(vente.id, 'refuser');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
              >
                <XCircle className="h-4 w-4" />
                <span>Refuser</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Section justificatif */}
        <div className="border-t border-gray-600 pt-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-300">Justificatif (PDF uniquement):</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              data-vente-id={vente.id}
              onChange={(e) => setJustificatifs(prev => ({ ...prev, [vente.id]: e.target.files[0] }))}
              className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-600 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <button
              onClick={() => handleAddJustificatif(vente.id)}
              disabled={!justificatifs[vente.id] || isUploading}
              className={`text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center ${
                !justificatifs[vente.id] || isUploading
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
                  <FileText className="h-4 w-4 mr-1" /> Ajouter justificatif
                </>
              )}
            </button>
          </div>
          
          {/* Afficher le justificatif existant s'il y en a un */}
          {vente.contract && (
            <div className="mt-2 p-2 bg-green-900/20 rounded border border-green-500/30 flex items-center justify-between">
              <span className="text-green-400 text-sm">✓ Justificatif déjà ajouté</span>
              <a 
                href={`http://localhost:8000${vente.contract}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 underline"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </a>
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
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-cyan-400">
            Gestion des Ventes
          </h1>
          <p className="text-gray-400 text-lg">Validez, refusez ou consultez l'historique des ventes</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-300">
              Ventes en attente ({pendingSales.length})
            </h2>
            {pendingSales.length === 0 ? (
              <div className="text-gray-400 text-center py-16 bg-gray-800/20 rounded-lg border border-gray-600/30">
                Aucune vente en attente.
              </div>
            ) : (
              pendingSales.map(vente => renderCard(vente, true))
            )}
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-6 text-blue-300">
              Historique des ventes ({historySales.length})
            </h2>
            {historySales.length === 0 ? (
              <div className="text-gray-400 text-center py-16 bg-gray-800/20 rounded-lg border border-gray-600/30">
                Aucun historique disponible.
              </div>
            ) : (
              historySales.map(vente => renderCard(vente, false))
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

export default GestionVentes;