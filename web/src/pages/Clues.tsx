import React, { FC, useMemo, useState } from 'react';
import Answer from '../components/Answer';
import '../styles/Clues.css';
import '../styles/Signup.css';
import { useParams } from 'react-router-dom';

interface CluesProps {
    filter?: 'user' | 'bank';
    id?: string | number;
}

interface Clue {
    answer: string;
    clue: string;
    id: number;
}

const Clues: FC<CluesProps> = ({ filter, id }) => {
    const [data, setData] = useState<Clue[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const paramId = useParams().id;

    useMemo(async () => {
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
    }, [searchTerm, filter, id, paramId]);

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

            <div className="clue-list">
                {data?.map((clue, i) => (
                    <div className="clue" key={i}>
                        <span>{clue.clue}</span>
                        <Answer word={clue.answer.toUpperCase()} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Clues;
