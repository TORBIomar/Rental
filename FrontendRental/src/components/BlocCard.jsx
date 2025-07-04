import React from "react";

const BlogCard = ({ imageSrc, title, onClick }) => {
    return (
        <div className="antialiased text-gray-900">
            <div 
                className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 
                hover:scale-105 hover:shadow-2xl group cursor-pointer"
                onClick={onClick} // ✅ Ajout de l'événement onClick ici
            >
                <div className="relative">
                    <img
                        className="w-full object-cover object-center group-hover:brightness-90 transition-all duration-300"
                        src={imageSrc}
                        alt={title}
                    />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 bg-gray-800">
                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors duration-300">
                        {title}
                    </h4>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
