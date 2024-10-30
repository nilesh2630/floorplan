// src/components/Layout/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';


const Navbar = () => {
    const navigate = useNavigate();
     // Assuming you have a logout function in your Auth context

    const handleLogout = async () => {
        try {
            // Call your logout function (if applicable)
            localStorage.removeItem('token'); // Remove token from localStorage
            navigate('/login'); // Redirect to home page after logout
        } catch (err) {
            console.error("Logout failed", err); // Handle logout error if needed
        }
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between">
                <div className="text-white text-lg font-bold">MyApp</div>
                <div>
                  
                    <Link to="/login" className="text-white px-4">Login</Link>
                    <Link to="/" className="text-white px-4">Signup</Link>
                    <button onClick={handleLogout} className="text-white px-4">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
