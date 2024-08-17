import React, { FC, useEffect, useState } from 'react';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';
import { parseJwt, useAuth } from '../contexts/AuthContext';

interface HomeProps {}

const Home: FC<HomeProps> = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string>('');
    const { loggedIn } = useAuth();

    useEffect(() => {
        if (loggedIn) {
            const data = parseJwt(localStorage.getItem('token') ?? '');
            if (data) {
                setUserId(data.user_id);
            }
        }
    }, [loggedIn]);

    return (
        <div className="home">
            <h1>Welcome to Jakarta</h1>
            <p className="para">
                Keep your most pesky crossword clues stored here so you'll never
                lose them again! You'll never forget <b>ACME</b> is a high
                point, that the Taj Mahal is in <b>Agra</b>, and who Yoko{' '}
                <b>ONO</b> is. Browse other people's clues to see their most
                annoying clues.
            </p>
            <div className="actions">
                <button onClick={() => navigate('/clues')} className="clues">
                    Browse Clues
                </button>
                <button
                    onClick={() =>
                        navigate(loggedIn ? '/banks/' + userId : '/sign-up')
                    }
                    className="primary"
                >
                    {loggedIn ? 'View Your Banks' : 'Sign Up'}
                </button>
            </div>
        </div>
    );
};

export default Home;
