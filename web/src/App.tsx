import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Clues from './pages/Clues';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route element={<Home />} path="/" />
                <Route element={<Signup />} path="/sign-up" />
                <Route element={<Login />} path="/log-in" />
                <Route element={<Clues />} path="/clues" />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
