import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => {
    return (
        <div className="nav">
            <div className="subnav">
                <Link to="/">
                    <h1>Jakarta</h1>
                </Link>
                <Link to="/clues">
                    <h3>All Clues</h3>
                </Link>
                <Link to="/my-banks">
                    <h3>My Banks</h3>
                </Link>
            </div>
            <div className="subnav">
                <Link to="/clues">
                    <h3>Login</h3>
                </Link>
                <Link to="/my-banks">
                    <h3>Signup</h3>
                </Link>
            </div>
        </div>
    );
};

export default Navbar;
