import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import assets from '../assets/assets';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const NavBar = () => {
    const [visible, setVisible] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();

    // Effet de scroll pour la navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Vérifier l'état d'authentification au chargement
    useEffect(() => {
        const checkAuthStatus = () => {
            const token = localStorage.getItem('access');
            const role = localStorage.getItem('userRole');
            const user = localStorage.getItem('user');
            
            if (token && role) {
                setIsAuthenticated(true);
                setUserRole(role);
                
                // Extraire le nom d'utilisateur
                if (user) {
                    try {
                        const userData = JSON.parse(user);
                        setUserName(userData.name || userData.username || 'Utilisateur');
                    } catch (e) {
                        setUserName('Utilisateur');
                    }
                }
            } else {
                setIsAuthenticated(false);
                setUserRole(null);
                setUserName('');
            }
        };

        checkAuthStatus();

        // Écouter les changements dans le localStorage
        const handleStorageChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Fonction de déconnexion
    const handleLogout = () => {
        console.log('=== DÉCONNEXION ===');
        
        // Nettoyer le localStorage
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        
        // Mettre à jour l'état
        setIsAuthenticated(false);
        setUserRole(null);
        setUserName('');
        setUserMenuOpen(false);
        
        // Rediriger vers la page d'accueil
        navigate('/');
        
        console.log('✅ Déconnexion réussie');
    };

    // Fonction pour naviguer vers le dashboard approprié
    const navigateToDashboard = () => {
        if (userRole === 'client') {
            navigate('/client');
        } else if (userRole === 'admin') {
            navigate('/admin');
        }
        setUserMenuOpen(false);
    };

    return (
        <div className='mx-auto max-w-5xl'>
            <div className={`flex items-center justify-between py-5 px-6 font-medium bg-white rounded-lg shadow-md transition-all duration-300 ${
                scrolled ? 'shadow-lg' : ''
            }`}>
                {/* Logo - Largeur fixe */}
                <div className="w-1/4 flex justify-start">
                    <Link to='/' className='group'>
                        <img 
                            src={assets.LogoNavbar} 
                            alt="Logo" 
                            className='h-12 transition-transform duration-300 group-hover:scale-105' 
                        />
                    </Link>
                </div>
               
                {/* Navigation principale (Desktop) - Parfaitement centrée */}
                <div className="w-1/2 flex justify-center">
                    <ul className='hidden md:flex gap-8 text-sm text-gray-600'>
                        {['HOME', 'ABOUT', 'CONTACT'].map((item, index) => (
                            <NavLink
                                key={index}
                                to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 hover:text-black transition-all duration-300 relative group ${
                                        isActive ? 'text-black' : ''
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <p className="font-medium">{item}</p>
                                        {/* Ligne de soulignement améliorée */}
                                        <div className={`w-full h-[2px] bg-gradient-to-r from-blue-600 to-purple-600 origin-center transition-transform duration-300 ease-out ${
                                            isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                                        }`}></div>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </ul>
                </div>
               
                {/* Section authentification (Desktop) - Largeur fixe */}
                <div className='w-1/4 flex items-center justify-end gap-4'>
                    {isAuthenticated ? (
                        <div className='relative'>
                            {/* Menu utilisateur */}
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className='flex items-center space-x-3 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            >
                                <div className='w-8 h-8 bg-white/20 rounded-full flex items-center justify-center'>
                                    <User size={16} />
                                </div>
                                <div className='text-left hidden md:block'>
                                    <p className='font-medium'>{userName}</p>
                                    <p className='text-xs opacity-75'>{userRole === 'admin' ? 'Admin' : 'Client'}</p>
                                </div>
                                <ChevronDown size={16} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {/* Dropdown menu */}
                            {userMenuOpen && (
                                <div className='absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50'>
                                    <button
                                        onClick={navigateToDashboard}
                                        className='w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200'
                                    >
                                        <User size={16} className='mr-3' />
                                        {userRole === 'admin' ? 'Admin' : 'Mon Espace'}
                                    </button>
                                    <hr className='my-1 border-gray-200' />
                                    <button
                                        onClick={handleLogout}
                                        className='w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200'
                                    >
                                        <LogOut size={16} className='mr-3' />
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <NavLink 
                            to='/login'
                            className='flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all duration-300'
                        >
                            <User size={16} />
                            <span className='hidden md:block'>Connexion</span>
                        </NavLink>
                    )}
                    
                    <button 
                        className='md:hidden hover:scale-110 transition-transform text-gray-600' 
                        onClick={() => setVisible(true)}
                    >
                        <Menu />
                    </button>
                </div>
            </div>
           
            {/* Menu mobile overlay */}
            {visible && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={() => setVisible(false)}
                    ></div>
                    
                    {/* Menu mobile */}
                    <div className="fixed top-0 right-0 w-full max-w-sm h-full bg-white z-50">
                        <div className="p-6">
                            {/* Header du menu mobile */}
                            <div className="flex items-center justify-between mb-8">
                                <img src={assets.LogoNavbar} alt="Logo" className="h-8" />
                                <button
                                    onClick={() => setVisible(false)}
                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            {/* Navigation mobile */}
                            <nav className="space-y-2 mb-8">
                                {['HOME', 'ABOUT', 'CONTACT'].map((item, index) => (
                                    <NavLink
                                        key={index}
                                        onClick={() => setVisible(false)}
                                        to={item === 'HOME' ? '/' : `/${item.toLowerCase()}`}
                                        className={({ isActive }) =>
                                            `block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                                                isActive 
                                                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600" 
                                                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                                            }`
                                        }
                                    >
                                        {item}
                                    </NavLink>
                                ))}
                            </nav>
                            
                            {/* Section authentification mobile */}
                            <div className="border-t border-gray-200 pt-6">
                                {isAuthenticated ? (
                                    <div className="space-y-4">
                                        {/* Profil utilisateur */}
                                        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{userName}</p>
                                                <p className="text-sm text-gray-600">{userRole === 'admin' ? 'Administrateur' : 'Client'}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Actions utilisateur */}
                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    navigateToDashboard();
                                                    setVisible(false);
                                                }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                <User size={20} />
                                                <span>{userRole === 'admin' ? 'Admin' : 'Mon Espace'}</span>
                                            </button>
                                            
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setVisible(false);
                                                }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                                            >
                                                <LogOut size={20} />
                                                <span>Déconnexion</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <NavLink
                                        to="/login"
                                        onClick={() => setVisible(false)}
                                        className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                                    >
                                        <User size={20} />
                                        <span>Se connecter</span>
                                    </NavLink>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
            
            {/* Click outside to close user menu */}
            {userMenuOpen && (
                <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setUserMenuOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default NavBar;