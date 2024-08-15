import React, { FC } from 'react';
import '../styles/Home.css';
import { useNavigate } from 'react-router-dom';

interface HomeProps {}

const Home: FC<HomeProps> = () => {
    const navigate = useNavigate();

    return (
        <div className="home">
            <h1>Welcome to Jakarta</h1>
            <p className="para">
                Keep your most pesky crossword clues stored here so you'll never
                lose them again! You'll never forget <b>ACME</b> is a high
                point, that the Taj Mahal is in Agra, and who Yoko <b>ONO</b>{' '}
                is. Browse other people's clues to see their most annoying
                clues.
            </p>
            <div className="actions">
                <button onClick={() => navigate('/clues')} className="clues">
                    Browse Clues
                </button>
                <button
                    onClick={() => navigate('/my-banks')}
                    className="primary"
                >
                    View Your Banks
                </button>
            </div>
        </div>
    );
};

export default Home;
