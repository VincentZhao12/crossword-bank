import React, { FC, useMemo, useState } from 'react';
import Answer from '../components/Answer';
import '../styles/Clues.css';
import '../styles/Signup.css';
import { useParams } from 'react-router-dom';
import Spinner from '../components/Spinner';

interface CluesProps {
    filter?: 'user' | 'bank';
    id?: string | number;
    dummy?: number;
}

interface Clue {
    answer: string;
    clue: string;
    id: number;
}

const Clues: FC<CluesProps> = ({ filter, id, dummy }) => {
    const [data, setData] = useState<Clue[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const paramId = useParams().id;
    const [loading, setLoading] = useState<boolean>(false);

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
    }, [searchTerm, filter, id, paramId, dummy]);

    return (
        <div className="clues-container">
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
