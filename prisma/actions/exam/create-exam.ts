"use server"

import prisma from "@/lib/prisma";

export const createExam = async (title: string, selectedQuestions: string[], maxScore: number, duration: number) => {
    try {
        const exam = await prisma.exam.create({
            data: {
                title: title,
                questions: selectedQuestions,
                maxScore: maxScore,
                duration: duration
            },
        });
        return exam;
    } catch (error) {
        throw error;
    }
}
