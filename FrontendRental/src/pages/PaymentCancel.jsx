import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentRefused = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { voiture, isRental, dateDebut, dateFin, totalPrice } = location.state || {};

    const handleRetourAccueil = () => {
        navigate("/");
    };

    const handleVoirHistorique = () => {
        navigate("/client");
    };

    const formatPrice = (price) => {
        return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") || "0";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/[0.2] rounded-xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/[0.1]">
                        <h1 className="text-2xl font-bold text-white">Paiement Refusé</h1>
                    </div>
                    <div className="p-8 text-center">
                        <div className="mb-8">
                            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
                                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-4">
                            Votre {isRental ? "location" : "achat"} n'a pas pu être confirmée
                        </h2>
                        {voiture && (
                            <div className="bg-black/30 p-6 rounded-lg mb-6">
                                <div className="flex items-center justify-center mb-4">
                                    <div className="w-24 h-24 bg-gray-800 rounded overflow-hidden">
                                        <img
                                            src={voiture.image}
                                            alt={`${voiture.marque} ${voiture.modele}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                </div>
                                <p className="text-white font-bold text-lg">{voiture.marque} {voiture.modele}</p>
                                <p className="text-gray-400 text-sm mb-4">{voiture.couleur} • {voiture.boiteVitesse}</p>
                                {isRental ? (
                                    <div className="space-y-2 text-sm text-gray-300">
                                        <div className="flex justify-between">
                                            <span>Période de location:</span>
                                            <span>Du {dateDebut} au {dateFin}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-white text-base">
                                            <span>Montant:</span>
                                            <span>{formatPrice(totalPrice)} DH</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-sm text-gray-300">
                                        <div className="flex justify-between font-bold text-white text-base">
                                            <span>Montant:</span>
                                            <span>{formatPrice(voiture.prixVente)} DH</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <p className="text-gray-300 mb-8">
                            Votre paiement a été refusé. Veuillez vérifier vos informations de paiement ou réessayer avec une autre méthode.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleVoirHistorique}
                                className="px-6 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
                            >
                                Voir mon historique
                            </button>
                            <button
                                onClick={handleRetourAccueil}
                                className="px-6 py-3 rounded-xl text-white font-bold bg-red-600 hover:bg-red-700 transition-colors"
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

export default PaymentRefused;