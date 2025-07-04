import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const SupprimerUtilisateur = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            setError('Vous devez être connecté pour supprimer un utilisateur. Veuillez vous reconnecter.');
        }
    }, []);

    // Recherche de l'ID utilisateur par email
    const fetchIdUtilisateur = async (emailRecherche) => {
    try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/users/', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
            },
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const users = await response.json();
        
        // Debug: Afficher les utilisateurs reçus dans la console
        console.log('Utilisateurs reçus:', users);
        
        if (!Array.isArray(users)) {
            throw new Error('La réponse de l\'API n\'est pas un tableau');
        }
        
        const userTrouve = users.find(u => 
            u.email && typeof u.email === 'string' && 
            u.email.toLowerCase().trim() === emailRecherche.toLowerCase().trim()
        );
        
        // Debug: Afficher l'utilisateur trouvé (ou non)
        console.log('Utilisateur trouvé:', userTrouve);
        
        setLoading(false);
        return userTrouve ? userTrouve.id : null;
    } catch (error) {
        console.error('Erreur dans fetchIdUtilisateur:', error);
        setLoading(false);
        setError('Erreur lors de la recherche de l\'utilisateur');
        return null;
    }
};

    const handleDelete = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
        setError('Veuillez entrer un email.');
        return;
    }

    if (!window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${email} ?`)) {
        return;
    }

    try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/users/delete-by-email/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });

        setLoading(false);

        if (response.ok) {
            setSuccess(`L'utilisateur ${email} a bien été supprimé.`);
            setEmail('');
        } else {
            const data = await response.json();
            setError(data.error || 'Erreur lors de la suppression de l\'utilisateur.');
        }
    } catch (err) {
        setLoading(false);
        setError('Erreur réseau ou serveur.');
    }
};

    if (!isAuthenticated) {
        return (
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen text-white flex flex-col">
                <NavBar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Accès refusé</h1>
                        <p className="text-gray-400">Vous devez être connecté pour supprimer un utilisateur.</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen text-white flex flex-col">
            <div className="top-0 left-0 w-full z-50">
                <NavBar />
            </div>
            <div className="pt-24 pb-6 text-center">
                <h1 className="text-4xl font-bold text-[#d70000]">
                    Supprimer un Utilisateur par Email
                </h1>
                <p className="text-gray-400 mt-2">Entrez l'email de l'utilisateur à supprimer</p>
            </div>
            <form
                onSubmit={handleDelete}
                className="max-w-xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6 mb-8"
            >
                <div className="flex flex-col">
                    <label className="mb-1 text-sm font-semibold">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="p-3 rounded bg-gray-700 text-white focus:ring-2 focus:ring-pink-500 border border-gray-600"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-[#d70000] hover:bg-p[#d70000] text-white font-semibold py-3 px-6 rounded-lg shadow transition flex items-center justify-center"
                    disabled={loading}
                >
                    {loading ? 'Suppression en cours...' : 'Supprimer l\'utilisateur'}
                </button>
                {error && <p className="mt-2 text-red-500 font-semibold">{error}</p>}
                {success && <p className="mt-2 text-green-500 font-semibold">{success}</p>}
                <div className="mt-6 flex justify-center">
                    <a
                        href="/gestionutilisateurs"
                        className="inline-block bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
                    >
                        Retour
                    </a>
                </div>
            </form>
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default SupprimerUtilisateur;