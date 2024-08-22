import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import Answer from '../components/Answer';
import '../styles/Clues.css';
import '../styles/Signup.css';
import { Link, useParams } from 'react-router-dom';
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
    user_name: string;
    bank_name: string;
    user_id: string;
    bank_id: string;
}

const Clues: FC<CluesProps> = ({ filter, id, dummy, isOwner }) => {
    const [data, setData] = useState<Clue[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const paramId = useParams().id;
    const [loading, setLoading] = useState<boolean>(false);
    const [dummy2, setDummy2] = useState<number>(0);
    const [error, setError] = useState<string>();
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = async () => {
        setLoading(true);

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const { signal } = abortControllerRef.current;
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
                signal,
            });

            const json = await res.json();
            console.log(json.data);
            setData(json.data);
        } catch (e: any) {
            if (e.name === 'AbortError') {
                console.log('aborted', searchTerm);
            } else {
                console.log(e);
            }
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
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
                <table className="clue-list">
                    <thead>
                        <tr>
                            {isOwner && <th>Delete</th>}
                            <th>Clue</th>
                            <th>User</th>
                            <th>Bank</th>
                            <th>Answer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((clue, i) => (
                            <tr key={clue.id}>
                                {isOwner && (
                                    <td>
                                        <button
                                            aria-label="delete bank"
                                            className="icon-button"
                                            onClick={() =>
                                                handleDelete(clue.id)
                                            }
                                        >
                                            <FaTrashAlt />
                                        </button>
                                    </td>
                                )}
                                <td>{clue.clue}</td>
                                <td>
                                    <Link
                                        className="red-link"
                                        to={'/clues/user/' + clue.user_id}
                                    >
                                        {clue.user_name}
                                    </Link>
                                </td>
                                <td>
                                    <Link
                                        className="red-link"
                                        to={'/clues/bank/' + clue.bank_id}
                                    >
                                        {clue.bank_name}
                                    </Link>
                                </td>
                                <td className="answer-cell">
                                    <Answer word={clue.answer.toUpperCase()} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Clues;
