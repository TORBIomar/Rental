import React, { useState, useEffect, useRef } from 'react';
import assets from '../assets/assets';

const TexteAnime = ({ className }) => {
    const texte = "Bienvenue sur Rental, votre plateforme de location et de vente de véhicules. Nous vous offrons une large gamme de voitures, avec des prix compétitifs et un service de qualité.";
    const [affichage, setAffichage] = useState('');
    const [index, setIndex] = useState(0);
    const containerRef = useRef(null);

    useEffect(() => {
        if (index < texte.length) {
            const timeout = setTimeout(() => {
                setAffichage((prev) => prev + texte[index]);
                setIndex(index + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [index]);

    return (
        <div className="container mx-auto px-4 w-4/5" ref={containerRef}>
            <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
                <div className="md:w-1/2 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 
                        bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Rental
                    </h1>
                    <p className={`${className || 'text-gray-200 leading-relaxed tracking-wide min-h-[150px] font-medium text-lg md:text-xl lg:text-2xl'}`}>
                        {affichage}
                        {index === texte.length && <span className="animate-pulse ml-1">|</span>}
                    </p>
                </div>
                <div className="md:w-1/2 flex justify-center">
                    <div className="relative group w-full max-w-[600px]">
                        <img 
                            src={assets.ImageVoitures} 
                            alt="Illustration de voitures" 
                            className="rounded-2xl shadow-2xl transform transition-all duration-500 
                                       group-hover:scale-105 group-hover:rotate-2 group-hover:shadow-2xl 
                                       border-4 border-blue-600/30 hover:border-blue-500 w-full h-auto"
                        />
                        <div className="absolute inset-0 bg-blue-500/20 rounded-2xl opacity-0 
                                        group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TexteAnime;