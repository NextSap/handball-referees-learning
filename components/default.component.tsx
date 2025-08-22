"use client"

import Image from "next/image";
import {Button} from "@/components/ui/button";
import {useEffect, useRef, useState} from "react";
import {getQuestionsById, Question} from "@/lib/questions.utils";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {sendResult} from "@/prisma/actions/referee-exam/send-result";
import {Exam, Referee, RefereeExam, State} from "@/prisma/schema";
import TimerComponent from "@/components/timer.component";
import {modifyRefereeExam} from "@/prisma/actions/referee-exam/modify-referee-exam";
import texts from "@/public/text.json";
import {toast} from "@/hooks/use-toast";

type Props = {
    referee: Referee;
    exam: Exam;
    refereeExam: RefereeExam;
    lang: "en" | "fr" | "nl" | "de";
}

export default function Home({referee, exam, refereeExam, lang}: Props) {
    const questionsRef = useRef<Question[]>([]);
    const answersRef = useRef<{ [key: string]: string[] }>({});

    const [name, setName] = useState<string>(`${referee.lastName.toUpperCase()} ${referee.firstName.substring(0, 1).toUpperCase()}.`);

    const [examState, setExamState] = useState<State>(refereeExam.state);

    const [questions, setQuestions] = useState<Question[]>(getQuestionsById(exam.questions, lang));
    const [answers, setAnswers] = useState<{ [key: string]: string[] }>({});

    const [endTime, setEndTime] = useState<number>(refereeExam.endDate?.getTime() || 0);

    const welcome = texts.welcome[lang];

    useEffect(() => {
        questionsRef.current = questions;
    }, [questions]);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        setAnswers(JSON.parse(localStorage.getItem("answers") || "{}") as { [key: string]: string[] });
    }, []);

    const handleCheckboxChange = (questionId: string, answerId: string) => {
        const updatedAnswers = {
            ...answers,
            [questionId]: answers[questionId]
                ? answers[questionId].includes(answerId)
                    ? answers[questionId].filter(id => id !== answerId)
                    : [...answers[questionId], answerId]
                : [answerId]
        };

        setAnswers(updatedAnswers);
        saveResult(refereeExam.id, updatedAnswers, questions, examState);
    }

    switch (examState) {
        case "welcome":
            return (
                <div
                    className="flex flex-col gap-10 w-[90%] m-auto mt-5 transition-opacity duration-300 ease-in-out">
                    <div className="flex flex-col justify-center items-center w-full">
                        <Image src="/IHF Logo.png" width={100} height={100} alt="IHF Logo"/>
                        <p>{texts.version}</p>
                        <h1 className="text-3xl font-bold mt-5">{welcome.title}</h1>
                    </div>
                    <div>
                        <p className="my-5 text-2xl font-semibold">{name}</p>
                        <p className="mt-5">{welcome.intro}</p>
                        <p className="mt-1.5">{welcome.ready}</p>

                        <Button className="my-5" onClick={() => {
                            const start = new Date();
                            const end = new Date();
                            end.setTime(start.getTime() + exam.duration * 60000);

                            setExamState("started");

                            modifyRefereeExam(refereeExam.id, {
                                startDate: start,
                                endDate: end,
                                state: "started"
                            });

                            localStorage.removeItem("answers");
                            setAnswers({});

                            setEndTime(end.getTime());
                        }}>Start</Button>
                    </div>
                </div>
            );
        case "started":
            return (
                <div
                    className="flex flex-col relative gap-3 pt-10 m-auto w-[90%]">
                    {endTime > 0 && (
                        <TimerComponent
                            started={examState === "started"}
                            end={endTime}
                            action={() => {
                                setExamState("finished");
                                setTimeout(() =>
                                    finishExam(refereeExam.id, answersRef.current, questionsRef.current)
                                );
                            }}
                        />
                    )}
                    {questions.map((question, index) => {
                        return (
                            <Card key={question.id} id={question.id}>
                                <CardHeader className="flex flex-row justify-between items-start gap-5">
                                    {index + 1}. {question.question}
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-1">
                                        {Object.keys(question.answers).map((answer, index) => {
                                            const uuid = String(index) + question.id + String(index);
                                            return (
                                                <div key={uuid} className="">
                                                    <Label className="flex gap-3.5 items-center p-3 border"
                                                           htmlFor={uuid}>
                                                        <Checkbox id={uuid} name={uuid} value={answer}
                                                                  checked={answers[question.id] != null && answers[question.id].includes(answer)}
                                                                  onCheckedChange={() => handleCheckboxChange(question.id, answer)}/>
                                                        {question.answers[answer]}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                    <Button className="sticky bottom-3 w-32" onClick={() => {
                        setExamState("finished");
                        finishExam(refereeExam.id, answersRef.current, questionsRef.current);
                    }}>Send exam</Button>
                </div>
            );
        case "finished":
            return (
                <div
                    className="flex flex-col gap-10 w-[90%] m-auto mt-5 transition-opacity duration-300 ease-in-out">
                    <div className="flex flex-col justify-center items-center w-full">
                        <Image src="/IHF Logo.png" width={100} height={100} alt="IHF Logo"/>
                        <p>May 2024 version</p>
                        <h1 className="text-3xl font-bold mt-5">Rules test</h1>
                    </div>
                    <div>
                        <p>You finished the test.</p>
                    </div>
                </div>
            );
    }
}

const finishExam = (idRefereeExam: number, answers?: {
    [key: string]: string[]
}, questions?: Question[]) => {

    if (idRefereeExam == null)
        return;

    // Save state
    modifyRefereeExam(idRefereeExam, {
        state: "finished",
    });

    // Send result
    const [score] = getScore(questions || [], answers || {});

    sendResult(idRefereeExam, answers || {}, questions || [], score)
        .then(result => {
            fetch("/api/email/result", {
                method: "POST",
                body: JSON.stringify(result),
                headers: {
                    "Content-Type": "application/json"
                },
            }).then(() => {
                toast({
                    title: "Result sent",
                    description: "Your result has been sent successfully.",
                })
            });
        });
}

const saveResult = (idRefereeExam: number, answers: {
    [key: string]: string[]
}, questions: Question[], state: State) => {
    const [score, wellAnswered, answered] = getScore(questions, answers);
    const answersJson = JSON.stringify(answers);

    localStorage.setItem("answers", answersJson);
    modifyRefereeExam(idRefereeExam, {
        score: score,
        answered: answered,
        wellAnswered: wellAnswered,
        state: state,
        answers: answersJson
    });
}

const getScore = (questions: Question[], userAnswers: { [key: string]: string[] }): number[] => {
    let score = 0;
    let wellAnswered = 0;
    let answered = 0;

    questions.forEach(question => {
        let internalScore = 0;
        const selectedAnswers = userAnswers[question.id] || [];
        const correctAnswers = Object.keys(question.answers).filter(answer => question.correct.includes(answer));

        selectedAnswers.forEach(answer => {
            if (correctAnswers.includes(answer))
                internalScore++;
            else
                internalScore--;
        });

        if (internalScore > 0)
            score += internalScore;

        if (selectedAnswers.length === correctAnswers.length && selectedAnswers.every(answer => correctAnswers.includes(answer)))
            wellAnswered++;

        if (selectedAnswers.length > 0)
            answered++;
    });

    return [score, wellAnswered, answered];
}