import React from 'react';
import Navbar from './components/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Clues from './pages/Clues';
import { AuthProvider } from './contexts/AuthContext';
import Banks from './pages/Banks';
import Bank from './pages/Bank';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route element={<Home />} path="/" />
                    <Route element={<Signup />} path="/sign-up" />
                    <Route element={<Login />} path="/log-in" />
                    <Route element={<Clues />} path="/clues" />
                    <Route element={<Bank />} path="/clues/bank/:id" />
                    <Route
                        element={<Clues filter="user" />}
                        path="/clues/user/:id"
                    />
                    <Route element={<Banks />} path="/banks/:userId" />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
