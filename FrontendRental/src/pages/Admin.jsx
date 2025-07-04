import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { Users, Car, ShoppingCart, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const cards = [
    {
      title: "Gestion Utilisateurs",
      icon: <Users size={40} className="text-purple-400" />,
      colorFrom: "from-purple-500",
      colorTo: "to-purple-800",
      link: "/gestionutilisateurs"
    },
    {
      title: "Gestion Voitures",
      icon: <Car size={40} className="text-blue-400" />,
      colorFrom: "from-blue-500",
      colorTo: "to-blue-800",
      link: "/gestionvoitures"
    },
    {
      title: "Gestion Ventes",
      icon: <ShoppingCart size={40} className="text-green-400" />,
      colorFrom: "from-green-500",
      colorTo: "to-green-800",
      link: "/gestionventes"
    },
    {
      title: "Gestion Locations",
      icon: <Calendar size={40} className="text-cyan-400" />,
      colorFrom: "from-cyan-500",
      colorTo: "to-cyan-800",
      link: "/gestionlocations"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>

      <div className="pt-24 pb-12 text-center">
        <motion.h1 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
        >
          Gestion Admin
        </motion.h1>
        <p className="mt-4 text-gray-300 text-lg">Gérez facilement toutes les sections de votre site</p>
      </div>

      <div className="flex-grow px-4 py-12 sm:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto"
        >
          {cards.map((card, index) => (
            <div 
              key={index}
              onClick={() => navigate(card.link)}
              className={`cursor-pointer bg-gradient-to-br ${card.colorFrom} ${card.colorTo} rounded-2xl p-6 flex flex-col items-center justify-center text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl`}
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="text-xl font-semibold">{card.title}</h3>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Admin;
