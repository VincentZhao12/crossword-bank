import React, { FC, FormEvent, useEffect, useState } from 'react';
import '../styles/Signup.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SignupProps {}

const Signup: FC<SignupProps> = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
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

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const endpoint = process.env.REACT_APP_API_URL + '/log-in';
        const raw = {
            email,
            password,
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

            setLoggedIn(true);
            localStorage.setItem('token', json.token);
        } catch (e: any) {
            console.warn(e);
        }

        setLoading(false);
        navigate('/');
    };

    return (
        <div className="signup-container">
            <h2>Log In</h2>
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
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <span>
                        Don't have an account?{' '}
                        <Link to="/sign-up">Sign Up</Link>
                    </span>
                </div>
                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                >
                    Log In
                </button>
            </form>
        </div>
    );
};

export default Signup;
