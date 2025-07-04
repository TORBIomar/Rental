import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import React from 'react';

const GestionVoitures = () => {
    return (
        <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
            <div className="top-0 left-0 w-full z-50">
                <NavBar />
            </div>

            <div className="pt-24 pb-12 text-center">
                <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                    Gestion des Voitures
                </h1>
                <p className="mt-4 text-gray-300 text-lg">Ajoutez, modifiez ou supprimez une voiture facilement</p>
                <div className="flex-grow px-4 py-12 sm:px-8 flex justify-center items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        <a href="/ajoutervoiture" className="bg-gradient-to-br from-green-500 to-green-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center">
                            Ajouter une voiture
                        </a>
                        <a href="/getidvoiture" className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center">
                            Modifier une voiture
                        </a>
                        <a href="/supprimervoiture" className="bg-gradient-to-br from-red-500 to-red-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center">
                            Supprimer une voiture
                        </a>
                    </div>
                </div>
                <div className="mt-8 flex justify-center">
                    <a
                        href="/admin"
                        className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-semibold py-3 px-6 rounded-xl shadow hover:scale-105 transition duration-300"
                    >
                        Retour
                    </a>
                </div>
            </div>
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default GestionVoitures;
