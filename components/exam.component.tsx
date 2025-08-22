"use client";

import React from 'react';
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {Exam} from "@/prisma/schema";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

type ExamComponentProps = {
    exams: Exam[]
}

const ExamComponent = (props: ExamComponentProps) => {
    const router = useRouter();

    return (
        <div className="flex flex-col gap-5 p-5">
            <header className="flex items-center justify-between w-full p-5 border-b shadow-lg">
                <h1 className="text-3xl">Dashboard - Exam</h1>
                <nav>
                    <ul className="flex gap-5">
                        <li>
                            <a className="underline cursor-pointer">Exams</a>
                        </li>
                        <li>
                            <a className="cursor-pointer"
                               onClick={() => router.push("/dashboard/referee")}>Referees</a>
                        </li>
                    </ul>
                </nav>
            </header>
            <Button onClick={() => router.push("/dashboard/exam/create")}>Create an exam</Button>
            <div className="flex flex-wrap gap-5">
                {props.exams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                    .map((exam, index) => {
                        return (
                            <Card key={index}
                                  className="w-56 hover:shadow-lg transition-shadow duration-200 ease-in-out"
                                  onClick={() => {
                                      router.push(`/dashboard/exam/details?ie=${exam.id}`)
                                  }}>
                                <CardHeader>
                                    <CardTitle>{exam.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Duration : {exam.duration}m</p>
                                    <p>Questions : {exam.questions.length}</p>
                                    <p>Max score : {exam.maxScore}</p>
                                    <p>Created on {exam.createdAt.toLocaleDateString()}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
            </div>
        </div>
    );
};

export default ExamComponent;