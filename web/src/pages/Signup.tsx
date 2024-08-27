import React, { FC, FormEvent, useEffect, useState } from 'react';
import '../styles/Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

interface SignupProps {}

const Signup: FC<SignupProps> = () => {
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const navigate = useNavigate();

    const { loggedIn, setLoggedIn } = useAuth();

    useEffect(() => {
        if (loggedIn) navigate('/');
    }, [loggedIn, navigate]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setLoading(false);
            setError('Passwords must match');
            return;
        }

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const endpoint = process.env.REACT_APP_API_URL + '/sign-up';
        const raw = {
            email,
            password,
            name: username,
        };

        try {
            const res = await fetch(endpoint, {
                headers,
                method: 'POST',
                body: JSON.stringify(raw),
            });
            const json = await res.json();

            if (!res.ok) {
                setLoading(false);
                setError(json.message);
                return;
            }

            localStorage.setItem('token', json.token);
            setLoggedIn(true);
        } catch (e: any) {
            setError('Unknown Error');
            console.warn(e);
        }

        setLoading(false);
        navigate('/');
    };
    if (loading)
        return (
            <div className="signup-container">
                <Spinner />
            </div>
        );

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="inputs">
                    {error && (
                        <span className="error-message">
                            <b>Error: </b> {error}
                        </span>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            autoComplete="off"
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            autoComplete="off"
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            autoComplete="off"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm Password:
                        </label>
                        <input
                            autoComplete="off"
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <span>
                        Already have an account?{' '}
                        <Link to="/log-in">Log In</Link>
                    </span>
                </div>
                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Signup;
