import React from 'react';
import { motion } from 'framer-motion';
import TexteAnime from '../components/TexteAnime';
import BlogCard from '../components/BlocCard';
import assets from '../assets/assets';
import CarBrandsCarousel from '../components/CarBrandsCarousel';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { User, Star, Award } from 'lucide-react';

const Home = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  // Témoignages clients
  const testimonials = [
    {
      id: 1,
      name: "Sophie Dupont",
      role: "Cliente fidèle",
      comment: "J'ai trouvé ma voiture idéale en seulement quelques clics. Le service est impeccable !",
      icon: <User color="#a78bfa" size={32} />
    },
    {
      id: 2,
      name: "Thomas Martin",
      role: "Client régulier",
      comment: "La location était super simple et les prix très compétitifs. Je recommande vivement !",
      icon: <Star color="#60a5fa" size={32} />
    },
    {
      id: 3,
      name: "Julie Leclerc",
      role: "Nouvelle cliente",
      comment: "Un service client exceptionnel et des voitures en parfait état. Je reviendrai !",
      icon: <Award color="#34d399" size={32} />
    }
  ];
  
  // Stats impressionnants
  const stats = [
    { id: 1, value: "15K+", label: "Voitures disponibles" },
    { id: 2, value: "98%", label: "Clients satisfaits" },
    { id: 3, value: "24/7", label: "Support client" },
    { id: 4, value: "50+", label: "Villes desservies" }
  ];
  
  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>
      
      {/* Hero Section with new title and TexteAnime */}
      <div className="pt-24 pb-12">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12 px-4"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Rental
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            La solution complète pour tous vos besoins automobiles
          </p>
        </motion.div>
        
        <TexteAnime className="text-xl md:text-3xl font-medium" />
      </div>
      
      <div className="flex-grow py-16 px-4 sm:px-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-24">
          {/* Stats Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="py-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((stat) => (
                <div key={stat.id} className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-md p-6 rounded-xl border border-blue-500/20">
                  <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">{stat.value}</p>
                  <p className="mt-2 text-gray-300">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Car Options Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="text-4xl font-extrabold mb-4 text-gray-100 tracking-tight 
              bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-500">
              Choisissez votre option :
            </h2>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
              Que vous souhaitiez acheter ou louer, nous avons la solution parfaite pour tous vos besoins automobiles.
            </p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <BlogCard 
                imageSrc={assets.VenteVoiture} 
                title="Achetez une voiture" 
                description="Trouvez la voiture de vos rêves parmi notre vaste sélection de véhicules neufs et d'occasion."
                className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                  rounded-2xl overflow-hidden border-2 border-blue-600/30 
                  hover:border-blue-500 shadow-lg hover:shadow-blue-500/50"
                  onClick={() => window.location.href = '/buy'}
              />
              <BlogCard 
                imageSrc={assets.LocationVoiture} 
                title="Louez une voiture" 
                description="Flexibilité maximale avec nos options de location journalières, hebdomadaires ou mensuelles."
                className="transform transition duration-500 hover:scale-105 hover:shadow-2xl 
                  rounded-2xl overflow-hidden border-2 border-purple-600/30 
                  hover:border-purple-500 shadow-lg hover:shadow-purple-500/50"
                  onClick={() => window.location.href = '/rent'}
              />
            </div>
          </motion.div>
          
          {/* Why Choose Us Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-12 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
              Pourquoi nous choisir
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 transform transition duration-300 hover:translate-y-[-5px]">
                <div className="bg-blue-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Prix compétitifs</h3>
                <p className="text-gray-300">Nous offrons les meilleurs prix du marché, garantis sans frais cachés.</p>
              </div>
              
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 transform transition duration-300 hover:translate-y-[-5px]">
                <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Sécurité garantie</h3>
                <p className="text-gray-300">Tous nos véhicules sont régulièrement entretenus et inspectés pour votre sécurité.</p>
              </div>
              
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20 transform transition duration-300 hover:translate-y-[-5px]">
                <div className="bg-cyan-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Service rapide</h3>
                <p className="text-gray-300">Processus simplifié pour vous faire gagner du temps, de la réservation à la prise en main.</p>
              </div>
            </div>
          </motion.div>
          
          {/* Car Brands Section */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
              Nos grandes marques disponibles
            </h2>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
              Nous travaillons avec les plus grandes marques automobiles pour vous offrir qualité et fiabilité.
            </p>
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-500/20">
              <CarBrandsCarousel />
            </div>
          </motion.div>
          
          {/* Testimonials Section with Lucide Icons */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-white 
              bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Ce que disent nos clients
            </h2>
            <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
              La satisfaction de nos clients est notre priorité absolue.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-xl p-6 text-left border border-purple-500/20 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-700/60 flex items-center justify-center mr-4">
                      {testimonial.icon}
                    </div>
                    <div>
                      <h3 className="font-bold">{testimonial.name}</h3>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="italic text-gray-300">"{testimonial.comment}"</p>
                  <div className="mt-4 text-yellow-400">★★★★★</div>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* Call to Action */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-12 border border-blue-500/30 shadow-lg">
              <h2 className="text-3xl font-bold mb-4">Prêt à démarrer votre aventure automobile ?</h2>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers de clients satisfaits et trouvez le véhicule parfait pour vos besoins.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full font-bold text-lg transform transition hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
                  onClick={() => window.location.href = '/login'}
                >
                  Créer un compte
                </button>
                <button 
                  className="px-8 py-3 bg-transparent border-2 border-white/30 rounded-full font-bold text-lg transform transition hover:scale-105 hover:bg-white/10"
                  onClick={() => window.location.href = '/contact'}
                >
                  Nous contacter
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Home;