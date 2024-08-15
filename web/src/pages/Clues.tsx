import React, { FC, useEffect, useMemo, useState } from 'react';

interface CluesProps {}

interface Clue {
    answer: string;
    clue: string;
    id: number;
}

const Clues: FC<CluesProps> = () => {
    const [data, setData] = useState<Clue[]>([]);
    const [count, setCount] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');

    useMemo(async () => {
        setCount(count + 1);
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const raw = JSON.stringify({
            search_term: searchTerm,
        });
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
    }, [searchTerm]);

    return (
        <>
            {count}
            <label htmlFor="search">input</label>
            <input
                type="text"
                id="search"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul>
                {data?.map((clue, i) => (
                    <li key={i}>
                        {clue.clue}: {clue.answer}
                    </li>
                ))}
            </ul>
        </>
    );
};

export default Clues;
