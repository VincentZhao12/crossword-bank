import React, { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Banks.css';
import { parseJwt, useAuth } from '../contexts/AuthContext';

interface BanksProps {}
interface Bank {
    title: string;
    bank_id: number;
    user_id: number;
}

const Banks: FC<BanksProps> = () => {
    const { userId } = useParams();
    const [banks, setBanks] = useState<Bank[]>([]);
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { loggedIn, logout } = useAuth();
    const [isOwner, setIsOwner] = useState<boolean>(false);

    useEffect(() => {
        if (!loggedIn) return;

        const token = localStorage.getItem('token');
        if (!token) {
            logout();
            return;
        }

        const currUser = parseJwt(token)?.user_id;

        console.log(currUser);

        setIsOwner(currUser == userId);
    }, [loggedIn]);

    const handleSubmit = async () => {
        if (!title) {
            setError('Please enter a title');
            return;
        }

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const endpoint = process.env.REACT_APP_API_URL + '/create-bank';
        const raw = JSON.stringify({
            token: localStorage.getItem('token') ?? '',
            title,
        });

        try {
            const res = await fetch(endpoint, {
                headers,
                body: raw,
                method: 'POST',
            });
            const json = await res.json();

            if (!res.ok) {
                setError(json.message);
                return;
            }
            navigate('/clues/bank/' + json.bank_id);
        } catch (e) {
            console.log(e);
            setError('Unknown error occurred');
        }
    };

    useMemo(async () => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const raw = JSON.stringify({
            user_id: userId,
        });
        const endpoint = process.env.REACT_APP_API_URL + '/get-banks';

        console.log('Fetching data');

        try {
            const res = await fetch(endpoint, {
                headers,
                body: raw,
                method: 'POST',
            });
            const json = await res.json();
            console.log(json);
            setBanks(json.data);
        } catch (e) {
            return [];
        }
    }, [userId]);

    return (
        <>
            <div className="card-container">
                {isOwner && (
                    <div
                        className="bank-card create-card"
                        onClick={() => setShowModal(true)}
                    >
                        <h1>+</h1>
                        <h3>Create New Bank</h3>
                    </div>
                )}
                <div
                    className="bank-card"
                    onClick={() => navigate('/clues/user/' + userId)}
                >
                    <h3>View All User Clues</h3>
                </div>
                {banks?.map((bank: Bank) => (
                    <div
                        className="bank-card"
                        key={bank.bank_id}
                        onClick={() => navigate('/clues/bank/' + bank.bank_id)}
                    >
                        <h3>{bank.title}</h3>
                    </div>
                ))}
            </div>
            {showModal && (
                <div className="modal-container">
                    <div className="modal-card">
                        <h2>Create New Clue Bank</h2>
                        {error && (
                            <span className="error-message">
                                <b>Error: </b> {error}
                            </span>
                        )}
                        <div className="form-group enter-title">
                            <label htmlFor="title-input">
                                Enter the name of your bank here
                            </label>
                            <input
                                type="text"
                                id="title-input"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="button-group">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setTitle('');
                                    setError('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="create-button"
                                onClick={handleSubmit}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}{' '}
        </>
    );
};

export default Banks;
