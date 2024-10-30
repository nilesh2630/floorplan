import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import FloorPlanManagement from './components/FloorPlan/FloorPlanManagement';
// import FloorPlanEditor from './components/FloorPlan/FloorPlanEditor';
import Navbar from './components/Layout/Navbar';

const App = () => {


  return (
    <BrowserRouter>
   
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Signup />} />
           
            <Route path="/floor-plan" element={
            
                <FloorPlanManagement />
          
            } />
   
          </Routes>
        </div>
    
    </BrowserRouter>
  );
};

export default App;
