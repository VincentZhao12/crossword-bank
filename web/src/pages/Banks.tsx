import React, { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/Banks.css';
import { parseJwt, useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { FaTrashAlt } from 'react-icons/fa';

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
    const [showModalCreate, setShowModalCreate] = useState<boolean>(false);
    const [showModalDelete, setShowModalDelete] = useState<boolean>(false);
    const [title, setTitle] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { loggedIn, logout } = useAuth();
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedBank, setSelectedBank] = useState<number | string>();
    const [dummy, setDummy] = useState<number>(0);

    useEffect(() => {
        if (!loggedIn && isOwner) {
            setIsOwner(false);
            return;
        }
        if (!loggedIn) return;

        const token = localStorage.getItem('token');
        if (!token) {
            logout();
            return;
        }

        const currUser = parseJwt(token)?.user_id;

        console.log(currUser);

        setIsOwner(currUser.toString() === userId);
    }, [loggedIn, logout, userId, isOwner]);

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
        setLoading(true);
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
        setLoading(false);
        console.log(dummy);
    }, [userId, dummy]);

    const handleDelete = async () => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const endpoint = process.env.REACT_APP_API_URL + '/delete-bank';
        const raw = JSON.stringify({
            token: localStorage.getItem('token') ?? '',
            bank_id: selectedBank,
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
            setShowModalDelete(false);
            setDummy(dummy * -1);
        } catch (e) {
            console.log(e);
            setError('Unknown error occurred');
        }
    };

    return loading ? (
        <div className="centered">
            <Spinner />
        </div>
    ) : (
        <>
            <div className="card-container">
                {isOwner && (
                    <div
                        className="bank-card create-card"
                        onClick={() => setShowModalCreate(true)}
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
                        <div className="inner-flex">
                            {isOwner && (
                                <button
                                    aria-label="delete bank"
                                    className="icon-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBank(bank.bank_id);
                                        setShowModalDelete(true);
                                    }}
                                >
                                    <FaTrashAlt />
                                </button>
                            )}
                            <h3 className="bank-title">{bank.title}</h3>
                        </div>
                    </div>
                ))}
            </div>
            <Modal
                open={showModalCreate}
                title="Create New Clue Bank"
                onCancel={() => {
                    setShowModalCreate(false);
                    setTitle('');
                    setError('');
                }}
                onConfirm={handleSubmit}
            >
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
                        autoComplete="off"
                        type="text"
                        id="title-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </Modal>
            <Modal
                open={showModalDelete}
                title="Delete Clue Bank"
                onCancel={() => {
                    setShowModalDelete(false);
                    setSelectedBank('');
                    setTitle('');
                    setError('');
                }}
                onConfirm={handleDelete}
            >
                {error && (
                    <span className="error-message">
                        <b>Error: </b> {error}
                    </span>
                )}
                <div className="form-group enter-title">
                    <label htmlFor="title-input">
                        Are you sure you would like to delete this bank?
                    </label>
                </div>
            </Modal>
        </>
    );
};

export default Banks;
