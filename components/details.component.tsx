"use client"

import React, {useState} from 'react';
import {ExamWithRefereeExam, Referee, RefereeExamWithReferee} from "@/prisma/schema";
import {useRouter} from "next/navigation";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
    Dialog,
    DialogClose,
    DialogContent, DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {getQuestionById, getQuestionsById, Question} from "@/lib/questions.utils";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import {toast} from "@/hooks/use-toast";
import {ToastAction} from "@/components/ui/toast";
import {modifyRefereeExam} from "@/prisma/actions/referee-exam/modify-referee-exam";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {color, format} from "@/lib/jsx.utils";
import {formatTime} from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {deleteExam} from "@/prisma/actions/exam/delete-exam";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {createRefereeExam} from "@/prisma/actions/referee-exam/create-referee-exam";
import {sendResult} from "@/prisma/actions/referee-exam/send-result";
import {deleteRefereeExam} from "@/prisma/actions/referee-exam/delete-referee-exam";
import texts from "@/public/text.json";

type DetailsComponentProps = {
    exam: ExamWithRefereeExam
    referees: Referee[]
}

const DetailsComponent = (props: DetailsComponentProps) => {
    const router = useRouter();

    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [currentRefereeExam, setCurrentRefereeExam] = React.useState<RefereeExamWithReferee | undefined>(undefined);

    const [dialog, setDialog] = React.useState<"preview" | "answers" | "register">("preview");
    const [alertDialog, setAlertDialog] = React.useState<"sendEmail" | "deleteExam">("sendEmail");

    const [selectedReferees, setSelectedReferees] = useState<number[]>([]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialog>
                <div className="flex flex-col gap-5 p-5">
                    <header className="flex items-center justify-between gap-5 p-5 border-b shadow-lg">
                        <h1 className="text-3xl">Dashboard - Details of {props.exam.title}</h1>
                        <nav>
                            <ul className="flex gap-5">
                                <li>
                                    <a className="cursor-pointer"
                                       onClick={() => router.push("/dashboard/exam")}>Exams</a>
                                </li>
                                <li>
                                    <a className="cursor-pointer"
                                       onClick={() => router.push("/dashboard/referee")}>Referees</a>
                                </li>
                            </ul>
                        </nav>
                    </header>
                    <div className="flex gap-2 w-full">
                        <Button onClick={() => {
                            setDialog("register");
                            setSelectedReferees(props.exam.RefereeExam.map(refereeExam => refereeExam.idReferee));
                            setDialogOpen(true);
                        }}>Register referees to the test</Button>
                        <AlertDialogTrigger asChild>
                            <Button onClick={() => {
                                setAlertDialog("sendEmail");
                            }}>Send the exam to all referees</Button>
                        </AlertDialogTrigger>
                        <Button onClick={() => {
                            setDialog("preview");
                            setDialogOpen(true);
                        }}>Preview exam</Button>
                        <AlertDialogTrigger asChild>
                            <Button onClick={() => {
                                setAlertDialog("deleteExam");
                            }}>Delete exam</Button>
                        </AlertDialogTrigger>
                    </div>
                    <Table>
                        <TableCaption>
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Exam state</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Answered</TableHead>
                                <TableHead>Well answered</TableHead>
                                <TableHead>Ends in</TableHead>
                                <TableHead>Email sent</TableHead>
                                <TableHead>Result sent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.exam.RefereeExam.map(refereeExam => {
                                return (
                                    <DropdownMenu key={refereeExam.id} modal={false}>
                                        <TableRow className={"w-56"}>
                                            <TableCell>{refereeExam.Referee.lastName.toUpperCase() + " " + refereeExam.Referee.firstName}</TableCell>
                                            <TableCell>{refereeExam.state.toUpperCase()}</TableCell>
                                            <TableCell>{refereeExam.score}/{props.exam.maxScore} - {color(refereeExam.score, props.exam.maxScore)}</TableCell>
                                            <TableCell>{refereeExam.answered}/{props.exam.questions.length}</TableCell>
                                            <TableCell>{refereeExam.wellAnswered}</TableCell>
                                            <TableCell>{formatTime(refereeExam.startDate, refereeExam.endDate)}</TableCell>
                                            <TableCell>{refereeExam.emailSent ? "TRUE" : "FALSE"}</TableCell>
                                            <TableCell>{refereeExam.resultSent ? "TRUE" : "FALSE"}</TableCell>
                                            <TableCell>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant={"ghost"}>...</Button>
                                                </DropdownMenuTrigger>
                                            </TableCell>
                                        </TableRow>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onClick={() => {
                                                setCurrentRefereeExam(refereeExam);
                                                setDialog("answers");
                                                setDialogOpen(true);
                                            }}>
                                                Show answers
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => {
                                                const baseUrl = `${texts.baseUrl}?ie=${props.exam.id}&ire=${refereeExam.id}&l=en`;
                                                navigator.clipboard.writeText(baseUrl).then(() => {
                                                    toast({
                                                        title: "Link copied to clipboard",
                                                    })
                                                });
                                            }}>
                                                Copy exam link
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                sendExamEmail(refereeExam.Referee.email, props.exam.id, refereeExam.id);
                                            }}>
                                                Send exam
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                sendResultEmail(refereeExam.id, JSON.parse(refereeExam.answers || "{}"), getQuestionsById(props.exam.questions, "en"), refereeExam.score);
                                                router.refresh();
                                            }}>
                                                Send result
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem onClick={() => {
                                                router.push(`/dashboard/history?ir=${refereeExam.idReferee}`); // Navigate to referee details page
                                            }}>
                                                Show exam history
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => {
                                                deleteRefereeExam(refereeExam.id)
                                                    .then(() => {
                                                        toast({
                                                            variant: "default",
                                                            title: "Referee exam deleted",
                                                            description: `The referee exam of ${refereeExam.Referee.firstName} ${refereeExam.Referee.lastName} has been successfully deleted.`
                                                        });
                                                        router.refresh();
                                                    })
                                                    .catch((error) => {
                                                        toast({
                                                            variant: "destructive",
                                                            title: "Error deleting referee exam",
                                                            description: error.message
                                                        });
                                                    });
                                            }}>
                                                Delete referee exam
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                );
                            })}

                        </TableBody>
                    </Table>
                </div>
                {dialog == "answers" && (
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
                                {props.exam.questions.map(questionId => {
                                    const question = getQuestionById(questionId, "en");

                                    if (!question) return <div key={questionId + "1"}></div>;

                                    const answers = JSON.parse(currentRefereeExam?.answers ?? "{}") as {
                                        [key: string]: string[]
                                    };

                                    return (
                                        <AccordionItem key={questionId} value={questionId}
                                                       className="border-b border-b-gray-200">
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
                )}
                {dialog == "preview" && (
                    <DialogContent className="h-[90%] overflow-auto">
                        <DialogHeader>
                            <DialogTitle>Exam preview - {props.exam.title}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col relative gap-3 pt-5 m-auto w-[90%]">
                            {getQuestionsById(props.exam.questions, "en").map((question, index) => {
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
                                                                          disabled/>
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
                )}
                {dialog == "register" && (
                    <DialogContent className="max-h-[90%] overflow-auto">
                        <DialogHeader>
                            <DialogTitle>Register referees - {props.exam.title}</DialogTitle>
                            <DialogDescription>Select the referees you want to register for this
                                exam.</DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col relative gap-3 m-auto w-full">
                            <div className="flex flex-col gap-0 w-full">
                                {props.referees
                                    .sort((a, b) => a.lastName.localeCompare(b.lastName))
                                    .map((referee) => {
                                        return (
                                            <div key={referee.id}
                                                 className="flex items-center justify-between p-1.5 border h-10">
                                                <p className="text-sm font-semibold">
                                                    {referee.lastName.toUpperCase()} {referee.firstName}
                                                </p>
                                                {selectedReferees.includes(referee.id) ?
                                                    <p className="flex justify-center items-center h-7 w-20">✅</p> :
                                                    <Button className="h-7 w-20" onClick={() => {
                                                        setSelectedReferees([...selectedReferees, referee.id]);
                                                        createRefereeExam(referee.id, props.exam.id)
                                                            .then(() => {
                                                                toast({
                                                                    variant: "default",
                                                                    title: "Referee registered",
                                                                    description: `${referee.firstName} ${referee.lastName} has been successfully registered for the exam.`
                                                                });
                                                            })
                                                            .catch((error) => {
                                                                toast({
                                                                    variant: "destructive",
                                                                    title: "Error registering referee",
                                                                    description: error.message
                                                                });
                                                            });
                                                    }}>Register</Button>
                                                }
                                            </div>

                                        );
                                    })}
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button>Back</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                )}
                {alertDialog == "sendEmail" && (
                    <AlertDialogContent>
                        <AlertDialogTitle>Are you sure you want to send the exam email to each referee
                            ?</AlertDialogTitle>
                        <AlertDialogAction onClick={() => {
                            props.exam.RefereeExam.forEach((refereeExam) => {
                                sendExamEmail(refereeExam.Referee.email, props.exam.id, refereeExam.id);
                            });
                        }}>Yes</AlertDialogAction>
                        <AlertDialogCancel>No</AlertDialogCancel>
                    </AlertDialogContent>
                )}
                {alertDialog == "deleteExam" && (
                    <AlertDialogContent>
                        <AlertDialogTitle>Are you sure you want to delete this exam ?</AlertDialogTitle>
                        <AlertDialogDescription>This is going to delete every referee exam linked to this test as
                            well.</AlertDialogDescription>
                        <AlertDialogAction onClick={() => {
                            deleteExam(props.exam.id).then(() => {
                                toast({
                                    variant: "default",
                                    title: "Exam deleted",
                                    description: "The exam has been successfully deleted."
                                })
                            });
                            router.push("/dashboard/exam");
                        }}>Yes</AlertDialogAction>
                        <AlertDialogCancel>No</AlertDialogCancel>
                    </AlertDialogContent>
                )}
            </AlertDialog>
        </Dialog>
    );
};

function sendExamEmail(email: string, idExam: number, idRefereeExam: number) {
    fetch("/api/email/exam", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            idExam: idExam,
            idRefereeExam: idRefereeExam
        })
    }).then(response => response.json()).then(data => {
        modifyRefereeExam(idRefereeExam, {
            emailSent: true
        });
        toast({
            description: `${email} - Email sent successfully`
        });
        console.info(`===\n${email} - Email sent successfully\n${texts.baseUrl}?ie=${idExam}&ire=${idRefereeExam}&l=en\n===`)
    }).catch(error => {
        toast({
            variant: "destructive",
            title: `${email} - Error when sending email`,
            description: error.toString(),
            action: <ToastAction onClick={() => {
                navigator.clipboard.writeText(texts.baseUrl+'?ie=' + idExam + '&ire=' + idRefereeExam + '&l=en');
            }} altText="Copy link">Copy link</ToastAction>
        });

        console.error(`===\n${email} - Error when sending email\n${texts.baseUrl}?ie=${idExam}&ire=${idRefereeExam}&l=en\n===`)
    });
}

function sendResultEmail(idRefereeExam: number, answers: {
    [key: string]: string[]
}, questions: Question[], score: number) {
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
                })
            });
        });
}

export default DetailsComponent;