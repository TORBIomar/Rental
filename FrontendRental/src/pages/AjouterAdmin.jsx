import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const API_REGISTER = 'http://127.0.0.1:8000/api/register/';

const AjouterAdmin = () => {
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'admin'
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (form.password !== form.confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(API_REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    username: form.username,
                    password: form.password,
                    role: form.role
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Erreur lors de la création de l'admin");
            }
            setMessage(data.message || 'Admin créé avec succès');
            setForm({
                email: '',
                username: '',
                password: '',
                confirmPassword: '',
                role: 'Admin'
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
                        <h2 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                            Créer un compte Admin
                        </h2>
                        <p className="text-gray-300">Ajoutez un nouvel administrateur</p>
                    </div>
                    {message && (
                        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-700">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                                    Nom d'utilisateur
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="adminadmin"
                                    value={form.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                    Adresse email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="admin@email.com"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </div>
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
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
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
                                    "Créer Admin"
                                )}
                            </button>
                        </form>
                    </div>
                    <div className="mt-8 flex justify-center">
          <a
            href="/gestionutilisateurs"
            className="bg-gradient-to-br from-gray-600 to-gray-800 text-white font-semibold py-3 px-6 rounded-xl shadow hover:scale-105 transition duration-300"
          >
            Retour
          </a>
        </div>
                </div>
                
            </div>
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default AjouterAdmin;