import React, { FC, useEffect, useState } from 'react';
import '../styles/Answer.css';

interface AnswerProps {
    word: string;
}

const Answer: FC<AnswerProps> = ({ word }) => {
    const [flipped, setFlipped] = useState<boolean[]>([]);

    useEffect(() => {
        if (word.length === flipped.length) return;

        setFlipped(new Array(word.length).fill(false));
    }, [word, flipped.length]);

    return (
        <div className="answer-container">
            {flipped.map((val, i) => (
                <div
                    className="answer-box"
                    key={i}
                    onClick={() => {
                        const vals = [...flipped];
                        vals[i] = !vals[i];
                        setFlipped(vals);
                    }}
                >
                    {val ? word.charAt(i) : ''}
                </div>
            ))}
        </div>
    );
};

export default Answer;
