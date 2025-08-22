"use client";

import React from 'react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Referee, RefereeExamWithExam} from "@/prisma/schema";
import {useRouter} from "next/navigation";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {getQuestionById} from "@/lib/questions.utils";
import {Label} from "@radix-ui/react-menu";
import {Checkbox} from "@/components/ui/checkbox";
import {color, format} from "@/lib/jsx.utils";

type HistoryComponentProps = {
    referee: Referee,
    refereeExams: RefereeExamWithExam[]
}

const HistoryComponent = (props: HistoryComponentProps) => {
    const router = useRouter();

    const finishedExams = props.refereeExams.filter(e => e.state === "finished");
    const average =
        finishedExams.length > 0
            ? finishedExams.reduce((sum, e) => sum + (e.score / e.Exam.maxScore) * 100, 0) / finishedExams.length
            : -1;

    const [currentRefereeExam, setCurrentRefereeExam] = React.useState<RefereeExamWithExam | undefined>(undefined);

    return (
        <Dialog>
            <div className="flex flex-col gap-5 p-5">
                <header className="flex items-center justify-between gap-5 p-5 border-b shadow-lg">
                    <h1 className="text-3xl">Dashboard - History
                        of {props.referee.lastName.toUpperCase()} {props.referee.firstName}</h1>
                    <nav>
                        <ul className="flex gap-5">
                            <li>
                                <a className="cursor-pointer" onClick={() => router.push("/dashboard/exam")}>Exams</a>
                            </li>
                            <li>
                                <a className="cursor-pointer"
                                   onClick={() => router.push("/dashboard/referee")}>Referees</a>
                            </li>
                        </ul>
                    </nav>
                </header>
                <h2 className="text-2xl">Average
                    : {average == -1 ? "N/A" : (average / props.refereeExams.length).toPrecision(2) + "%"}</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Exam title</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Answered</TableHead>
                            <TableHead>Well answered</TableHead>
                            <TableHead>Email sent</TableHead>
                            <TableHead>Result sent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {props.refereeExams.sort((a, b) => b.Exam.createdAt.getTime() - a.Exam.createdAt.getTime())
                            .map(refereeExam => {
                                return (
                                    <TableRow key={refereeExam.id}>
                                        <TableCell>{refereeExam.Exam.title}</TableCell>
                                        <TableCell>{refereeExam.Exam.duration}</TableCell>
                                        <TableCell>{refereeExam.state.toUpperCase()}</TableCell>
                                        <TableCell>{refereeExam.score}/{refereeExam.Exam.maxScore} - {color(refereeExam.score, refereeExam.Exam.maxScore)}</TableCell>
                                        <TableCell>{refereeExam.answered}/{refereeExam.Exam.questions.length}</TableCell>
                                        <TableCell>{refereeExam.wellAnswered}</TableCell>
                                        <TableCell>{String(refereeExam.emailSent).toUpperCase()}</TableCell>
                                        <TableCell>{String(refereeExam.resultSent).toUpperCase()}</TableCell>
                                        <TableCell className="flex gap-3">
                                            <DialogTrigger asChild>
                                                <Button onClick={() => {
                                                    setCurrentRefereeExam(refereeExam);
                                                }}>Show answers</Button>
                                            </DialogTrigger>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </div>
            <DialogContent className="max-h-[90%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Answers</DialogTitle>
                </DialogHeader>
                <div>
                    <div className="flex justify-between">
                        <p className="flex justify-center w-full">Question</p>
                        <p className="flex justify-center w-full">Answers</p>
                        <p className="flex justify-center w-full">Corrects</p>
                    </div>
                    <Accordion type={"multiple"}>
                        {currentRefereeExam?.Exam.questions.map(questionId => {
                            const question = getQuestionById(questionId, "en");

                            if (!question) return <div key={questionId + "1"}></div>;

                            const answers = JSON.parse(currentRefereeExam?.answers) as { [key: string]: string[] };

                            return (
                                <AccordionItem key={questionId} value={questionId} className="border-b border-b-gray-200">
                                    <AccordionTrigger className="flex justify-between w-full">
                                        <div className="flex justify-between w-full text-center">
                                            <p className="flex justify-center w-full">{question.id}</p>
                                            <p className="flex justify-center w-full gap-0.5">{format(answers[questionId])}</p>
                                            <p className="flex justify-center w-full gap-0.5">{format(question.correct)}</p>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <p>{question.id} {question.question}</p>
                                        <div className="flex flex-col gap-1">
                                            {Object.keys(question.answers).map((answer, index) => {
                                                const uuid = String(index) + question.id + String(index);
                                                return (
                                                    <div key={uuid} className="">
                                                        <Label
                                                            className="flex gap-3.5 items-center p-3 border"
                                                            style={{"color": question.correct.includes(answer) ? "green" : ""}}>
                                                            <Checkbox id={uuid} name={uuid} value={answer}
                                                                      checked={answers[question.id] != null && answers[question.id].includes(answer)}
                                                                      disabled/>
                                                            {question.answers[answer]}
                                                        </Label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default HistoryComponent;