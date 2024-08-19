import React, { FC, useMemo, useState } from 'react';
import Answer from '../components/Answer';
import '../styles/Clues.css';
import '../styles/Signup.css';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { FaTrashAlt } from 'react-icons/fa';

interface CluesProps {
    filter?: 'user' | 'bank';
    id?: string | number;
    dummy?: number;
    isOwner?: boolean;
}

interface Clue {
    answer: string;
    clue: string;
    id: number;
}

const Clues: FC<CluesProps> = ({ filter, id, dummy, isOwner }) => {
    const [data, setData] = useState<Clue[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const paramId = useParams().id;
    const [loading, setLoading] = useState<boolean>(false);
    const [dummy2, setDummy2] = useState<number>(0);
    const [error, setError] = useState<string>();

    useMemo(async () => {
        setLoading(true);
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const raw = JSON.stringify({
            search_term: searchTerm,
            user_id: filter === 'user' ? id ?? paramId : '',
            bank_id: filter === 'bank' ? id ?? paramId : '',
        });
        console.log(raw);
        const endpoint = process.env.REACT_APP_API_URL + '/get-clues';

        console.log('Fetching data');

        try {
            const res = await fetch(endpoint, {
                headers,
                method: 'POST',
                body: raw,
            });

            const json = await res.json();

            setData(json.data);
        } catch (e) {
            console.log(e);
        }
        console.log(dummy);

        setLoading(false);
    }, [searchTerm, filter, id, paramId, dummy, dummy2]);

    const handleDelete = async (clueId: number | string) => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const endpoint = process.env.REACT_APP_API_URL + '/delete-clue';
        const raw = JSON.stringify({
            token: localStorage.getItem('token') ?? '',
            clue_id: clueId,
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
            setDummy2(-1);
            setError('');
        } catch (e) {
            console.log(e);
            setError('Unknown error occurred');
        }
    };

    return (
        <div className="clues-container">
            {error && (
                <span className="error-message">
                    <b>Error: </b> {error}
                </span>
            )}
            <div className="form-group normal-width">
                <label htmlFor="search">Search for a clue</label>
                <input
                    type="text"
                    id="search"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <div className="clue-list">
                    {data?.map((clue, i) => (
                        <div className="clue" key={clue.id}>
                            {isOwner && (
                                <button
                                    aria-label="delete bank"
                                    className="icon-button"
                                    onClick={() => handleDelete(clue.id)}
                                >
                                    <FaTrashAlt />
                                </button>
                            )}
                            <span>{clue.clue}</span>
                            <Answer word={clue.answer.toUpperCase()} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Clues;
