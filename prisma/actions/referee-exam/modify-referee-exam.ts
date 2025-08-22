"use server"

import prisma from "@/lib/prisma";

type RefereeExamData = {
    startDate?: Date,
    endDate?: Date,
    score?: number,
    answered?: number,
    wellAnswered?: number,
    state?: "welcome" | "started" | "finished",
    emailSent?: boolean
    resultSent?: boolean
    answers?: string,
}

export const modifyRefereeExam = async (id: number, refereeExamData: RefereeExamData) => {
    try {
        const cleanedData = Object.fromEntries(
            Object.entries(refereeExamData).filter(([_, value]) => value !== undefined)
        );

        const refereeExam = await prisma.refereeExam.update({
            where: {
                id
            },
            data: cleanedData,
        });
        return refereeExam;
    } catch (error) {
        throw error;
    }
}