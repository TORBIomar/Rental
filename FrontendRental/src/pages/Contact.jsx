import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Contact = () => {
  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>
      <div className="flex-grow py-16 px-4 sm:px-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Titre Principal */}
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-8 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Contactez-Nous
            </h1>
            <div className="max-w-4xl mx-auto text-lg leading-relaxed space-y-6">
              <p className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                Notre équipe est à votre disposition pour répondre à toutes vos questions. 
                N'hésitez pas à nous contacter par téléphone, email ou via le formulaire ci-dessous.
              </p>
            </div>
          </div>
          
          {/* Informations de Contact */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-12 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Nos Coordonnées
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Téléphone */}
              <div className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                rounded-2xl overflow-hidden border-2 border-blue-600/30 
                hover:border-blue-500 shadow-lg hover:shadow-blue-500/50 p-6 bg-gray-800/60 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  <i className="fas fa-phone-alt mr-2"></i> Téléphone
                </h3>
                <p>📞+212 6 12 34 56 78</p>
                <p className="mt-2 text-sm text-gray-300">Lun-Ven: 9h-18h</p>
              </div>
              
              {/* Email */}
              <div className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                rounded-2xl overflow-hidden border-2 border-orange-600/30 
                hover:border-purple-500 shadow-lg hover:shadow-purple-500/50 p-6 bg-gray-800/60 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  <i className="fas fa-envelope mr-2"></i> Email
                </h3>
                <p>📧contact@autolux.com</p>
                <p className="mt-2 text-sm text-gray-300">Réponse sous 24h</p>
              </div>
              
              {/* Adresse */}
              <div className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                rounded-2xl overflow-hidden border-2 border-green-600/30 
                hover:border-green-500 shadow-lg hover:shadow-green-500/50 p-6 bg-gray-800/60 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-white">
                  <i className="fas fa-map-marker-alt mr-2"></i> Adresse
                </h3>
                <p>📍Avenue Oqba, Angle Rue Assouhaili, Rabat 10000</p>
                
              </div>
            </div>
          </div>
          
          {/* Formulaire de Contact */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Formulaire de Contact
            </h2>
            <div className="max-w-2xl mx-auto bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-left mb-2 text-sm font-medium text-gray-300">Nom Complet</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-left mb-2 text-sm font-medium text-gray-300">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Votre email"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-left mb-2 text-sm font-medium text-gray-300">Sujet</label>
                  <input 
                    type="text" 
                    id="subject" 
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Objet de votre message"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-left mb-2 text-sm font-medium text-gray-300">Message</label>
                  <textarea 
                    id="message" 
                    rows="5" 
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre message..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                >
                  Envoyer le Message
                </button>
              </form>
            </div>
          </div>
          
          {/* Localisation */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              Nous Trouver
            </h2>
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.4657557381347!2d-6.848331824441551!3d34.00625377317431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76d6be9c30d2f%3A0x1228617674ab5382!2sEMSI%20Agdal%202!5e0!3m2!1sfr!2sma!4v1743118010334!5m2!1sfr!2sma" 
                  width="100%" 
                  height="450" 
                  style={{border:0}} 
                  allowFullScreen="" 
                  loading="lazy"
                  className="rounded-lg"
                ></iframe>
              </div>
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

export default Contact;