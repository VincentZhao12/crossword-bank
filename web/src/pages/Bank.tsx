import React, { FC, useEffect, useState } from 'react';
import Clues from './Clues';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import '../styles/Bank.css';

interface BankProps {}

const Bank: FC<BankProps> = () => {
    const [canEdit, setCanEdit] = useState<boolean>(false);
    const { loggedIn } = useAuth();
    const { id } = useParams();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            return;
        }
    }, [loggedIn]);

    return (
        <div className="big-container">
            <div className="clue-input-area">
                <div>
                    <label htmlFor="clue">Clue</label>
                    <input type="text" id="clue" />
                </div>
                <div>
                    <label htmlFor="answer">Answer</label>
                    <input type="text" id="answer" />
                </div>
                <button className="create-button">Add Clue</button>
            </div>
            <Clues filter="bank" id={id} />
        </div>
    );
};

export default Bank;
