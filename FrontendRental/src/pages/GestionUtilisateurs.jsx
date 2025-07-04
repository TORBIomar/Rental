import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import React from 'react';

const GestionUtilisateurs = () => {
  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>

      <div className="pt-24 pb-12 text-center">
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Gestion des Utilisateurs
        </h1>
        <p className="mt-4 text-gray-300 text-lg">Ajoutez ou supprimez un utilisateur facilement</p>
        <div className="flex-grow px-4 py-12 sm:px-8 flex justify-center items-center">
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center w-full">
            <a href="/ajouteradmin" className="bg-gradient-to-br from-green-500 to-green-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center">
              Ajouter un utilisateur
            </a>
            <a href="/supprimeradmin" className="bg-gradient-to-br from-red-500 to-red-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:scale-105 transition duration-300 flex items-center justify-center">
              Supprimer un utilisateur
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

export default GestionUtilisateurs;