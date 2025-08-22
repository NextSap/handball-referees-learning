"use server"

import prisma from "@/lib/prisma";
import {Question} from "@/lib/questions.utils";

export const isResultSent = async (idRefereeExam: number) => {
    try {
        const refereeExam = await prisma.refereeExam.findUnique({
            where: {
                id: idRefereeExam
            }
        });

        if (!refereeExam) {
            throw new Error("Referee exam not found");
        }

        return refereeExam.resultSent;
    } catch (error) {
        throw error;
    }
}

export const sendResult = async (idRefereeExam: number, answers: { [key: string]: string[] }, questions: Question[], score: number) => {
    try {
        const isSent = await isResultSent(idRefereeExam);

        if (isSent) {
            throw new Error("Result already sent");
        }

        const refereeExam = await prisma.refereeExam.update({
            where: {
                id: idRefereeExam
            },
            data: {
                resultSent: true
            }
        });

        const referee = await prisma.referee.findUnique({
            where: {
                id: refereeExam.idReferee
            }
        });

        if (!referee) {
            throw new Error("Current exam not found");
        }

        const exam = await prisma.exam.findUnique({
            where: {
                id: refereeExam.idExam
            }
        });

        if (!exam) {
            throw new Error("Exam not found");
        }

        const result = {
            email: referee.email,
            score: score,
            maxScore: exam.maxScore,
            answers: answers,
            questions: questions,
        }

        return result;
    } catch (error) {
        throw error;
    }
}