import React, { FC, useMemo, useState } from 'react';
import Clues from './Clues';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import '../styles/Bank.css';

interface BankProps {}

const Bank: FC<BankProps> = () => {
    const { loggedIn } = useAuth();
    const { id } = useParams();
    const [clue, setClue] = useState<string>('');
    const [answer, setAnswer] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [dummy, setDummy] = useState(0);

    const [isOwner, setIsOwner] = useState<boolean>(false);

    useMemo(() => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const raw = JSON.stringify({
            token: localStorage.getItem('token'),
            bank_id: id,
        });

        console.log(raw);

        const endpoint = process.env.REACT_APP_API_URL + '/check-owner';

        fetch(endpoint, {
            method: 'POST',
            headers,
            body: raw,
        })
            .then((response) => response.json())
            .then((result) => {
                console.log(result);
                setIsOwner(result.data);
            })
            .catch((error) => console.error(error));
    }, [loggedIn, id]);

    const onAddClue = async () => {
        if (!answer || !clue) {
            setError('Please enter both a clue and answer');
            return;
        }

        if (answer.match(/[^a-zA-Z]/)) {
            setError('answer must only contain letters');
            return;
        }
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');

        const endpoint = process.env.REACT_APP_API_URL + '/add-clue';
        const raw = JSON.stringify({
            token: localStorage.getItem('token') ?? '',
            bank_id: id,
            clue,
            answer,
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
        } catch (e) {
            console.log(e);
            setError('Unknown error occurred');
        }

        setError('');
        setClue('');
        setAnswer('');
        setDummy(-dummy);
    };
    return (
        <div className="big-container">
            {isOwner && (
                <>
                    {error && (
                        <span className="error-message">
                            <b>Error: </b> {error}
                        </span>
                    )}
                    <div className="clue-input-area">
                        <div>
                            <label htmlFor="clue">Clue</label>
                            <input
                                autoComplete="off"
                                type="text"
                                id="clue"
                                value={clue}
                                onChange={(e) => setClue(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="answer">Answer</label>
                            <input
                                autoComplete="off"
                                type="text"
                                id="answer"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        </div>
                        <button className="create-button" onClick={onAddClue}>
                            Add Clue
                        </button>
                    </div>
                </>
            )}
            <Clues filter="bank" id={id} dummy={dummy} isOwner={isOwner} />
        </div>
    );
};

export default Bank;
