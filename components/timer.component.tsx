import React from 'react';
import {useState, useEffect} from 'react';

type TimerProps = {
    started: boolean;
    end: number;
    action: () => void;
}

const Timer = (props: TimerProps) => {
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);

    const getTime = () => {
        const time = new Date(props.end).getTime() - Date.now();

        setMinutes(Math.floor((time / 1000 / 60) % 60));
        setSeconds(Math.floor((time / 1000) % 60));

        if (time <= 0) props.action();
    };


    useEffect(() => {
        if (!props.started) return;
        const interval = setInterval(() => getTime(), 1000);

        return () => clearInterval(interval);
    }, []);

    return (minutes > 0 || seconds > 0) &&
        <p className="fixed right-0 top-0 p-2">Remaining time
            : {minutes < 10 ? "0" : ""}{minutes}:{seconds < 10 ? "0" : ""}{seconds}</p>


};

export default Timer;