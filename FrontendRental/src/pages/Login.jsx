import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const API_LOGIN = 'http://localhost:8000/api/login/';
const API_REGISTER = 'http://localhost:8000/api/register/';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '', // Add username field
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveTokensAndNavigate = (data) => {
    console.log('=== SAUVEGARDE DES TOKENS ===');
    console.log('Données reçues du serveur:', data);
    
    // Sauvegarder les tokens dans localStorage
    if (data.access) {
      localStorage.setItem('access', data.access);
      console.log('✅ Token access sauvegardé:', data.access);
      
      // Vérifier immédiatement après sauvegarde
      const savedToken = localStorage.getItem('access');
      console.log('✅ Vérification token sauvegardé:', savedToken);
      console.log('✅ Tokens identiques?', data.access === savedToken);
    } else {
      console.error('❌ Pas de token access dans la réponse!');
    }
    
    if (data.refresh) {
      localStorage.setItem('refresh', data.refresh);
      console.log('✅ Token refresh sauvegardé:', data.refresh);
    } else {
      console.error('❌ Pas de token refresh dans la réponse!');
    }
    
    // Sauvegarder d'autres informations utiles
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('✅ User data sauvegardé:', data.user);
    }
    if (data.role) {
      localStorage.setItem('userRole', data.role);
      console.log('✅ User role sauvegardé:', data.role);
    }
    
    // Afficher l'état complet du localStorage
    console.log('=== ÉTAT COMPLET DU LOCALSTORAGE ===');
    console.log('access:', localStorage.getItem('access'));
    console.log('refresh:', localStorage.getItem('refresh'));
    console.log('user:', localStorage.getItem('user'));
    console.log('userRole:', localStorage.getItem('userRole'));
    console.log('Toutes les clés:', Object.keys(localStorage));
    
    // Navigation selon le rôle
    console.log('=== NAVIGATION ===');
    console.log('Rôle détecté:', data.role);
    
    if (data.role === 'client') {
      console.log('📍 Navigation vers /client');
      navigate('/client');
    } else if (data.role === 'admin') {
      console.log('📍 Navigation vers /admin');
      navigate('/admin');
    } else {
      console.error('❌ Rôle inconnu:', data.role);
      setError("Rôle inconnu: " + data.role);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        console.log('=== TENTATIVE DE CONNEXION ===');
        console.log('Email:', formData.email);
        console.log('URL API:', API_LOGIN);
        
        const requestBody = {
          username: formData.username, // Use username field instead of email
          password: formData.password
        };
        console.log('Corps de la requête:', requestBody);
        
        const res = await fetch(API_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
        
        console.log('=== RÉPONSE DU SERVEUR ===');
        console.log('Status:', res.status);
        console.log('OK:', res.ok);
        console.log('Headers:', Object.fromEntries(res.headers.entries()));
        
        const data = await res.json();
        console.log('=== DONNÉES DE RÉPONSE ===');
        console.log('Réponse complète:', data);
        console.log('Type de réponse:', typeof data);
        console.log('Clés de la réponse:', Object.keys(data));
        
        if (!res.ok) {
          console.error('❌ Erreur de connexion:', data);
          throw new Error(data.detail || data.message || "Erreur de connexion");
        }
        
        // Sauvegarder les tokens et naviguer
        saveTokensAndNavigate(data);
        
      } else {
        // Register
        console.log('=== TENTATIVE D\'INSCRIPTION ===');
        console.log('Email:', formData.email);
        console.log('Name:', formData.name);
        
        const registerBody = {
          username: formData.username, // Use username field
          email: formData.email,
          password: formData.password,
          name: formData.name
        };
        console.log('Corps de la requête d\'inscription:', registerBody);
        
        const res = await fetch(API_REGISTER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerBody)
        });
        
        console.log('Status inscription:', res.status);
        const data = await res.json();
        console.log('Réponse inscription:', data);
        
        if (!res.ok) {
          console.error('❌ Erreur d\'inscription:', data);
          throw new Error(data.message || data.detail || "Erreur d'inscription");
        }
        
        console.log('=== LOGIN AUTOMATIQUE APRÈS INSCRIPTION ===');
        // Après inscription, login automatique
        const loginRes = await fetch(API_LOGIN, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username, // Use username field
            password: formData.password
          })
        });
        
        const loginData = await loginRes.json();
        console.log('Réponse login après inscription:', loginData);
        
        if (!loginRes.ok) {
          console.error('❌ Erreur de connexion après inscription:', loginData);
          throw new Error(loginData.detail || loginData.message || "Erreur de connexion");
        }
        
        // Sauvegarder les tokens et naviguer
        saveTokensAndNavigate(loginData);
      }
    } catch (err) {
      console.error('=== ERREUR LORS DE L\'AUTHENTIFICATION ===');
      console.error('Type d\'erreur:', err.constructor.name);
      console.error('Message d\'erreur:', err.message);
      console.error('Stack trace:', err.stack);
      
      // REMOVED: Automatic redirect to admin on invalid credentials
      // This was masking the real authentication errors
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour vider les tokens (utile pour le logout)
  const clearTokens = () => {
    console.log('=== NETTOYAGE DES TOKENS ===');
    console.log('Avant nettoyage:', {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refresh'),
      user: localStorage.getItem('user'),
      userRole: localStorage.getItem('userRole')
    });
    
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    console.log('Après nettoyage:', {
      access: localStorage.getItem('access'),
      refresh: localStorage.getItem('refresh'),
      user: localStorage.getItem('user'),
      userRole: localStorage.getItem('userRole')
    });
  };

  // Fonction de test pour vérifier l'API avec le token
  const testApiWithToken = async () => {
    const token = localStorage.getItem('access');
    console.log('=== TEST API AVEC TOKEN ===');
    console.log('Token utilisé:', token);
    
    if (!token) {
      console.error('❌ Pas de token trouvé!');
      return;
    }
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/voitures/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Status test API:', response.status);
      console.log('Headers réponse:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API accessible, données:', data);
      } else {
        const errorData = await response.text();
        console.error('❌ API non accessible:', errorData);
      }
    } catch (error) {
      console.error('❌ Erreur lors du test API:', error);
    }
  };

  // New function to test backend connectivity
  const testBackendConnection = async () => {
    console.log('=== TEST CONNEXION BACKEND ===');
    try {
      // Test if the backend is running
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'OPTIONS'
      });
      console.log('Backend status:', response.status);
      console.log('Backend accessible:', response.ok);
      
      // Test with a simple GET request if available
      const healthCheck = await fetch('http://localhost:8000/', {
        method: 'GET'
      });
      console.log('Health check status:', healthCheck.status);
    } catch (error) {
      console.error('❌ Backend non accessible:', error.message);
      setError('Impossible de se connecter au serveur. Vérifiez que le backend Django est démarré.');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-black min-h-screen text-white flex flex-col">
      <div className="top-0 left-0 w-full z-50">
        <NavBar />
      </div>
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold mb-2 text-transparent 
              bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="text-gray-300">Accédez à votre espace personnel</p>
          </div>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          
          
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                    Nom complet
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="adminadmin"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {!isLogin && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                    Confirmez le mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              )}
              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                      Se souvenir de moi
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                      Mot de passe oublié?
                    </a>
                  </div>
                </div>
              )}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] shadow-lg hover:shadow-blue-500/50'}`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Chargement...
                    </span>
                  ) : (
                    isLogin ? 'Se connecter' : 'S\'inscrire'
                  )}
                </button>
              </div>
            </form>
            <p className="mt-4 text-center text-gray-400">
              {isLogin ? "Pas encore de compte ? " : "Vous avez déjà un compte ? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setFormData({
                    email: '',
                    username: '',
                    password: '',
                    name: '',
                    confirmPassword: ''
                  });
                }}
                className="font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
              >
                {isLogin ? 'S\'inscrire' : 'Se connecter'}
              </button>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Login;