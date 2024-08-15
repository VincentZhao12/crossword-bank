import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {}

const Navbar: FC<NavbarProps> = () => {
    const { loggedIn, logout } = useAuth();
    return (
        <div className="nav">
            <div className="subnav">
                <Link className="link" to="/">
                    <h1>Jakarta</h1>
                </Link>
                <Link className="link" to="/clues">
                    <h3>All Clues</h3>
                </Link>
                <Link className="link" to="/my-banks">
                    <h3>My Banks</h3>
                </Link>
            </div>
            <div className="subnav">
                {!loggedIn ? (
                    <>
                        <Link className="link" to="/log-in">
                            <h3>Log In</h3>
                        </Link>
                        <Link className="link" to="/sign-up">
                            <h3>Sign Up</h3>
                        </Link>{' '}
                    </>
                ) : (
                    <span onClick={logout} className="clickable">
                        <h3>Log Out</h3>
                    </span>
                )}
            </div>
        </div>
    );
};

export default Navbar;
