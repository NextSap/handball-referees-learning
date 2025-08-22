"use client";

import React, {useState} from 'react';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import {getQuestions, getQuestionsById, rulesArray} from "@/lib/questions.utils";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {createExam} from "@/prisma/actions/exam/create-exam";
import {toast} from "@/hooks/use-toast";

// TODO:    Be able to create an exam with for example :
// TODO:    10 random questions from rule 8
// TODO:    5 random questions from rule 2
// TODO:    etc...

const CreateExam = () => {
    const rules = rulesArray;
    const router = useRouter();

    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [selectedRule, setSelectedRule] = useState<string>(rules[0]);
    const [duration, setDuration] = useState<number>(1);
    const [shuffle, setShuffle] = useState<boolean>(false);
    const questions = getQuestions(selectedRule === "SAR" ? "SAR" : selectedRule.split(".")[0], "en");

    const [title, setTitle] = useState<string>("");
    const [maxScore, setMaxScore] = useState<number>(0);

    const handleCheckboxChange = (questionId: string) => {
        if (selectedQuestions.includes(questionId)) {
            setSelectedQuestions(selectedQuestions.filter(question => question !== questionId));
        } else {
            setSelectedQuestions([...selectedQuestions, questionId]);
        }
    }

    const shuffleQuestions = (questions: string[]) => {
        const shuffled = [...questions];
        let currentIndex = shuffled.length, randomIndex;

        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
        }
        return shuffled;
    }

    return (
        <Dialog>
            <AlertDialog>
                <div className="flex flex-col gap-5 p-5">
                    <header className="flex items-center justify-between gap-5 p-5 border-b shadow-lg">
                        <h1 className="text-3xl">Dashboard - Exam</h1>
                        <nav>
                            <ul className="flex gap-5">
                                <li>
                                    <a className="underline cursor-pointer"
                                       onClick={() => router.push("/dashboard/exam")}>Exams</a>
                                </li>
                                <li>
                                    <a className="cursor-pointer"
                                       onClick={() => router.push("/dashboard/referee")}>Referees</a>
                                </li>
                            </ul>
                        </nav>
                    </header>
                    <Select value={selectedRule} onValueChange={setSelectedRule}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a rule"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Rules</SelectLabel>
                                {rules.map(rule => (
                                    <SelectItem key={rule} value={rule}>{rule}</SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-5 w-full">
                        <Accordion type="multiple" className="flex flex-col gap-5 w-full">
                            {questions.map((question) => (
                                <Label className="flex items-center border gap-3.5 p-3"
                                       htmlFor={question.id} key={question.id}>
                                    <Checkbox id={question.id} name={question.id}
                                              checked={selectedQuestions.includes(question.id)}
                                              onCheckedChange={() => handleCheckboxChange(question.id)}/>
                                    <AccordionItem value={question.id} className="w-full h-full">
                                        <AccordionTrigger>{question.id}</AccordionTrigger>
                                        <AccordionContent>
                                            {question.question}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Label>
                            ))}
                        </Accordion>
                        <div
                            className="border w-[25%] flex flex-col justify-between items-center max-h-[80vh] overflow-auto">
                            <div className="w-full pb-5">
                                <p className="font-semibold text-center p-2 border-b w-full">Selected questions
                                    [{selectedQuestions.length}]</p>
                                {selectedQuestions.map((question, index) => (
                                    <div key={index}
                                         className="flex justify-between w-full gap-5 border-b p-1 text-left">
                                        <p className="ml-5">{index + 1}. {question}</p>
                                        <button className="mr-5"
                                                onClick={() => setSelectedQuestions(selectedQuestions.filter(q => q !== question))}>❌
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="relative bottom-3 w-[90%] flex flex-col gap-1">
                                <DialogTrigger asChild>
                                    <Button className="w-full"
                                            disabled={selectedQuestions.length === 0}>Preview</Button>
                                </DialogTrigger>
                                <AlertDialogTrigger disabled={selectedQuestions.length === 0} onClick={() => {
                                    let maxScore = 0;
                                    getQuestionsById(selectedQuestions, "en").forEach(question => {
                                        maxScore += question.correct.length;
                                    });
                                    setMaxScore(maxScore);
                                }}>Create exam
                                </AlertDialogTrigger>
                            </div>
                        </div>
                    </div>
                </div>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Rules exam</AlertDialogTitle>
                        <AlertDialogDescription>
                        <span className="text-[15px]">You will create an exam with {selectedQuestions.length} questions and a maximum score
                        of {maxScore}.</span>
                            <Label className="flex items-center mt-3 gap-2" htmlFor="title">
                                Please enter the exam title :
                                <Input id="title" value={title} className={"w-36 h-7"}
                                       onChange={(e) => setTitle(e.target.value)}/>
                            </Label>
                            <Label className="flex items-center mt-3 gap-2" htmlFor="duration">
                                Please enter the duration of the exam in minutes :
                                <Input id="duration" type="number" min={1} value={isNaN(duration) ? 1 : duration}
                                       className={"w-20 h-7"}
                                       onChange={(e) => setDuration(parseInt(e.target.value))}/>
                            </Label>
                            <Label className="flex items-center mt-3 gap-2" htmlFor={"shuffle"}>
                                Do you want each question to be shuffled during the exam ?
                                <Checkbox id="shuffle" name="shuffle" checked={shuffle}
                                          onCheckedChange={() => {
                                              setShuffle(!shuffle);
                                          }}/>
                            </Label>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction disabled={!title} onClick={() => {
                            createExam(title, shuffle ? shuffleQuestions(selectedQuestions) : selectedQuestions, maxScore, duration)
                                .then(() => {
                                    toast({
                                        title: "Exam created successfully!",
                                        description: "You can now view your exam in the dashboard.",
                                    })
                                    router.push("/dashboard/exam");
                                });
                        }}>Create Exam</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DialogContent className="h-[90%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Exam preview</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col relative gap-3 pt-5 m-auto w-[90%]">
                    {getQuestionsById(selectedQuestions, "en").map((question, index) => {
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
                                                        <Checkbox id={uuid} name={uuid} value={answer} disabled/>
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
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>Back</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateExam;