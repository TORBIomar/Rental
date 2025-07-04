import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Routes } from 'react-router-dom'
import { Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import BuyCar from './pages/BuyCar'
import RentCar from './pages/RentCar'
import Payment from './pages/Payment'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Buy from './pages/Buy'
import Rent from './pages/Rent'
import { Voitures as voitures } from '../src/assets/assets';
import PaymentSuccess from './pages/PaymentSuccess'
import Admin from './pages/Admin'
import Client from './pages/Client'
import GestionUtilisateurs from './pages/GestionUtilisateurs'
import GestionVoitures from './pages/GestionVoitures'
import GestionLocation from './pages/GestionLocation'
import GestionVentes from './pages/GestionVentes'
import AjouterVoiture from './pages/AjouterVoiture'
import ModifierVoiture from './pages/ModifierVoiture'
import SupprimerVoiture from './pages/SupprimerVoiture'
import GetIdVoiture from './pages/GetIdVoiture'
import AjouterAdmin from './pages/AjouterAdmin'
import SupprimerAdmin from './pages/SupprimerAdmin'
import PaymentCancel from './pages/PaymentCancel'
import Reservation from './pages/Reservation'



const App = () => {
  return (
    <BrowserRouter>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/buycar/:id" element={<BuyCar voitures={voitures} />} />
          <Route path="/rentcar/:id" element={<RentCar voitures={voitures} />} />
          <Route path="/payment/:id" element={<Payment />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path='/buy' element={<Buy />} />
          <Route path='/rent' element={<Rent />} />
          <Route path="/paiement-reussi" element={<PaymentSuccess />} /> 
          <Route path='/admin' element={<Admin />} />
          <Route path='/client' element={<Client />} />
          <Route path='/gestionutilisateurs' element={<GestionUtilisateurs />} />
          <Route path='/gestionvoitures' element={<GestionVoitures />} />
          <Route path='/gestionlocations' element={<GestionLocation />} />
          <Route path='/gestionventes' element={<GestionVentes />} />
          <Route path='/ajoutervoiture' element={<AjouterVoiture />} />
          <Route path='/modifiervoiture' element={<ModifierVoiture />} />
          <Route path='/supprimervoiture' element={<SupprimerVoiture />} />
          <Route path='/modifiervoiture/:id/' element={<ModifierVoiture />} />
          <Route path='/getidvoiture' element={<GetIdVoiture />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/ajouteradmin" element={<AjouterAdmin />} />
          <Route path="/supprimeradmin" element={<SupprimerAdmin />} />
          <Route path="/paymentcancel" element={<PaymentCancel />} />
          <Route path="/reservation" element={<Reservation />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App