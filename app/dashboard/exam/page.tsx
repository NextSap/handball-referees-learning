import React from 'react';
import ExamComponent from "@/components/exam.component";
import prisma from "@/lib/prisma";

const Exam = async () => {
    const exams = await prisma.exam.findMany();
    const referees = await prisma.referee.findMany();
    const refereeExams = await prisma.refereeExam.findMany();

    return (
        <ExamComponent exams={exams} referees={referees} refereeExams={refereeExams}/>
    );
};

export default Exam;