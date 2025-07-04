import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer className='max-w-5xl mx-auto  py-6 px-6 bg-white rounded-lg shadow-md '>
            <div className='flex flex-col md:flex-row items-center justify-between text-gray-700 text-sm'>
                <p>&copy; {new Date().getFullYear()} Rental. All rights reserved.</p>

                <div className='flex gap-4 mt-4 md:mt-0'>
                    <p>Suivez-nous</p>
                    <a href='https://facebook.com' target='_blank' rel='noopener noreferrer' className='hover:text-black transition duration-300'><Facebook /></a>
                    <a href='https://instagram.com' target='_blank' rel='noopener noreferrer' className='hover:text-black transition duration-300'><Instagram /></a>
                    <a href='https://twitter.com' target='_blank' rel='noopener noreferrer' className='hover:text-black transition duration-300'><Twitter /></a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
