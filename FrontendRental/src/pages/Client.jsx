import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Calendar, CreditCard, User, Car, MapPin, Phone, Mail } from 'lucide-react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';



const Client = () => {
  const [locations, setLocations] = useState([]);
  const [ventes, setVentes] = useState([]);
  const [activeTab, setActiveTab] = useState('locations');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access');
      
      if (!token) {
        setError('Vous devez être connecté');
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        };

        const [locationsRes, ventesRes] = await Promise.all([
          fetch('http://localhost:8000/api/mes-locations/', { headers }),
          fetch('http://localhost:8000/api/mes-ventes/', { headers }),
        ]);

        if (locationsRes.status === 401 || ventesRes.status === 401) {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('userRole');
          setError('Session expirée. Veuillez vous reconnecter.');
          setLoading(false);
          return;
        }

        if (!locationsRes.ok || !ventesRes.ok) {
          throw new Error(`Erreur HTTP: ${locationsRes.status} / ${ventesRes.status}`);
        }

        const locationsData = await locationsRes.json();
        const ventesData = await ventesRes.json();

        setLocations(Array.isArray(locationsData) ? locationsData : []);
        setVentes(Array.isArray(ventesData) ? ventesData : []);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération:', err);
        setError('Erreur lors de la récupération des données: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const getStatusColor = (statut) => {
    const statutLower = statut?.toString().toLowerCase();
    
    if (statutLower?.includes('attente') || statutLower?.includes('pending')) {
      return { bg: 'bg-yellow-500', text: 'text-yellow-100' };
    }
    if (statutLower?.includes('validé') || statutLower?.includes('valide') || 
        statutLower?.includes('accepté') || statutLower?.includes('accepte') || 
        statutLower?.includes('confirmed') || statutLower?.includes('approved')) {
      return { bg: 'bg-green-500', text: 'text-green-100' };
    }
    if (statutLower?.includes('refusé') || statutLower?.includes('refuse') || 
        statutLower?.includes('rejected') || statutLower?.includes('declined')) {
      return { bg: 'bg-red-500', text: 'text-red-100' };
    }
    
    return { bg: 'bg-blue-500', text: 'text-blue-100' };
  };

  const getCarInfo = (item) => {
    let marque = '';
    let modele = '';
    
    if (item.voiture && typeof item.voiture === 'object') {
      marque = item.voiture.marque || '';
      modele = item.voiture.modele || '';
    } else {
      const marqueOptions = [item.marque, item.voiture_marque, item.car_brand, item.brand];
      const modeleOptions = [item.modele, item.voiture_modele, item.model, item.car_model];
      
      marque = marqueOptions.find(val => val && val !== '') || '';
      modele = modeleOptions.find(val => val && val !== '') || '';
    }
    
    let nomVoiture = '';
    if (item.voiture && typeof item.voiture === 'object') {
      nomVoiture = item.voiture.nom || `${marque} ${modele}`.trim();
    } else {
      const nomOptions = [item.voiture_nom, item.nom, item.name, item.car_name];
      nomVoiture = nomOptions.find(val => val && val !== '') || `${marque} ${modele}`.trim();
    }
    
    return {
      marque: marque || 'Marque inconnue',
      modele: modele || 'Modèle inconnu', 
      nomVoiture: nomVoiture || 'Véhicule'
    };
  };

  const handleContractView = (contractUrl, itemType, itemId) => {
    if (contractUrl) {
      setSelectedContract({ url: contractUrl, type: itemType, id: itemId });
    }
  };

  const handleContractDownload = (contractUrl, carInfo, type) => {
    if (contractUrl) {
      const link = document.createElement('a');
      link.href = contractUrl;
      link.download = `contrat_${type}_${carInfo.marque}_${carInfo.modele}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderCard = (item, type) => {
    const carInfo = getCarInfo(item);
    const statusColors = getStatusColor(item.statut || item.status);
    const hasContract = item.contract && item.contract !== '';
    
    return (
      <motion.div
        key={item.id}
        whileHover={{ scale: 1.02 }}
        className={`rounded-2xl p-6 shadow-2xl border backdrop-blur-sm ${
          type === 'location'
            ? 'bg-gradient-to-br from-blue-800/80 to-blue-900/80 border-blue-500/30'
            : 'bg-gradient-to-br from-green-800/80 to-green-900/80 border-green-500/30'
        }`}
      >
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Car className="h-6 w-6" />
              <span>{carInfo.marque}</span>
            </h3>
          </div>
          <p className="text-gray-300 text-lg font-medium">{carInfo.modele}</p>
        </div>
        
        <div className="space-y-4 text-sm">
          {type === 'location' ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-blue-500/20">
                <span className="text-gray-300 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de début</span>
                </span>
                <span className="font-medium text-white">{item.date_debut || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-blue-500/20">
                <span className="text-gray-300 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date de fin</span>
                </span>
                <span className="font-medium text-white">{item.date_fin || 'N/A'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between py-2 border-b border-green-500/20">
                <span className="text-gray-300 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Date d'achat</span>
                </span>
                <span className="font-medium text-white">{item.date_achat || 'N/A'}</span>
              </div>
            </>
          )}
          
          {/* Section Contrat */}
          <div className="py-2 border-b border-gray-500/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Contrat</span>
              </span>
              {hasContract ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleContractView(item.contract, type, item.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Voir</span>
                  </button>
                  <button
                    onClick={() => handleContractDownload(item.contract, carInfo, type)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  >
                    <Download className="h-3 w-3" />
                    <span>Télécharger</span>
                  </button>
                </div>
              ) : (
                <span className="text-gray-500 text-xs">Aucun</span>
              )}
            </div>
          </div>

          {/* Section Statut */}
          <div className="py-2 border-b border-gray-500/20">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Statut</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                {item.statut || item.status || 'En cours'}
              </span>
            </div>
          </div>

          {/* Section Prix/Coût */}
          {type === 'location' ? (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300 flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Coût total</span>
              </span>
              <span className="font-medium text-white text-lg">{item.cout_total || '0'} DH</span>
            </div>
          ) : (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300 flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Prix de vente</span>
              </span>
              <span className="font-medium text-white text-lg">{item.prix_vente || '0'} DH</span>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Modal pour visualiser le contrat
  const ContractModal = () => {
    if (!selectedContract) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <FileText className="h-6 w-6" />
              <span>Contrat - {selectedContract.type === 'location' ? 'Location' : 'Vente'}</span>
            </h3>
            <button
              onClick={() => setSelectedContract(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-auto">
            <img
              src={selectedContract.url}
              alt="Contrat"
              className="w-full h-auto rounded-lg border border-gray-600"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="hidden text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Impossible de charger le contrat</p>
              <a
                href={selectedContract.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
          <p className="text-xl">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
        
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30 max-w-md">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <p className="text-red-400 text-xl mb-6">{error}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Se reconnecter
            </button>
          </div>
        </div>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-900 via-gray-900 to-black text-white">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>

      <main className="flex-grow px-6 py-12 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
            Mes Réservations
          </h1>
          <p className="text-gray-400 text-lg">Gérez vos locations et achats de véhicules</p>
        </div>

        <div className="flex space-x-8 border-b border-gray-700 mb-10">
          {[
            { key: 'locations', label: 'Mes Locations', icon: Calendar },
            { key: 'ventes', label: 'Mes Achats', icon: CreditCard }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`pb-4 transition-all duration-200 flex items-center space-x-2 ${
                activeTab === key
                  ? 'border-b-4 border-blue-500 text-blue-400 scale-105'
                  : 'text-gray-400 hover:text-gray-200 hover:scale-102'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-lg font-semibold">{label}</span>
            </button>
          ))}
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {(activeTab === 'locations' ? locations : ventes).length === 0 ? (
            <div className="col-span-full text-center mt-20">
              <div className="text-gray-400 text-8xl mb-6">📋</div>
              <p className="text-gray-400 text-2xl mb-4">
                {activeTab === 'locations'
                  ? "Vous n'avez aucune location enregistrée."
                  : "Vous n'avez aucun achat enregistré."}
              </p>
              <p className="text-gray-500 text-lg">
                Vos {activeTab === 'locations' ? 'locations' : 'achats'} apparaîtront ici une fois effectué(e)s.
              </p>
            </div>
          ) : (
            (activeTab === 'locations' ? locations : ventes).map((item) =>
              renderCard(item, activeTab === 'locations' ? 'location' : 'vente')
            )
          )}
        </motion.div>
      </main>

      <ContractModal />
      <div className="mt-auto">
        <Footer />
      </div>
     
    </div>
  );
};

export default Client;