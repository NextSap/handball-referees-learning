import React from 'react';
import ExamComponent from "@/components/exam.component";
import prisma from "@/lib/prisma";

const Exam = async () => {
    const exams = await prisma.exam.findMany();

    return (
        <ExamComponent exams={exams}/>
    );
};

export default Exam;