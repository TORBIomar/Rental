import React from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import assets from '../assets/assets';

const About = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8 } },
    exit: { opacity: 0, y: -50, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>
      <motion.div
        className="flex-grow py-16 px-4 sm:px-8 overflow-x-hidden"
        variants={fadeIn}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Notre Histoire Section */}
          <motion.div
            className="text-center"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <h1 className="text-5xl font-extrabold mb-8 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Notre Histoire
            </h1>
            <div className="max-w-4xl mx-auto text-lg leading-relaxed space-y-6">
              <p className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                Fondée en 2025, notre entreprise est née de la passion pour l'automobile et du désir de révolutionner l'expérience de location et d'achat de véhicules. 
                Nous croyons en la liberté de mouvement et en la qualité du service.
              </p>
            </div>
          </motion.div>
          
          {/* Nos Valeurs Section */}
          <motion.div
            className="text-center"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-4xl font-bold mb-12 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Nos Valeurs
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {/* Valeur 1 */}
              <div className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                rounded-2xl overflow-hidden border-2 border-blue-600/30 
                hover:border-blue-500 shadow-lg hover:shadow-blue-500/50 p-6 bg-gray-800/60 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-white">Qualité</h3>
                <p>Nous sélectionnons rigoureusement chaque véhicule pour vous offrir le meilleur service.</p>
              </div>
              
              {/* Valeur 2 */}
              <div className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                rounded-2xl overflow-hidden border-2 border-purple-600/30 
                hover:border-purple-500 shadow-lg hover:shadow-purple-500/50 p-6 bg-gray-800/60 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-white">Innovation</h3>
                <p>Nous innovons constamment pour simplifier votre expérience de location et d'achat.</p>
              </div>
              
              {/* Valeur 3 */}
              <div className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                rounded-2xl overflow-hidden border-2 border-green-600/30 
                hover:border-green-500 shadow-lg hover:shadow-green-500/50 p-6 bg-gray-800/60 backdrop-blur-sm">
                <h3 className="text-2xl font-semibold mb-4 text-white">Satisfaction</h3>
                <p>Votre satisfaction est notre priorité absolue, et nous mettons tout en œuvre pour la garantir.</p>
              </div>
            </div>
          </motion.div>
          
          {/* Notre Équipe Section */}
          <motion.div
            className="text-center"
            variants={fadeIn}
            initial="initial"
            animate="animate"
          >
            <h2 className="text-3xl font-bold mb-12 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Notre Équipe
            </h2>
            <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
              {/* Membre 1 */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-64">
                <img 
                  src={assets.Membre1} 
                  alt="Membre de l'équipe" 
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-blue-500"
                />
                <h3 className="text-xl font-semibold text-white">Omar Torbi</h3>
              </div>
              
              {/* Membre 2 */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-64">
                <img 
                  src={assets.Rizq} 
                  alt="Membre de l'équipe" 
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-orange-500"
                />
                <h3 className="text-xl font-semibold text-white">Rizq Boulahcen</h3>
              </div>
              
              {/* Membre 3 */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-xl w-64">
                <img 
                  src={assets.Membre3} 
                  alt="Membre de l'équipe" 
                  className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-green-500"
                />
                <h3 className="text-xl font-semibold text-white text-center">
                  Salah-Eddine<br />Mezzane
                </h3>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default About;
