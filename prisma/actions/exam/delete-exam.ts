"use server"

import prisma from "@/lib/prisma";

export const deleteExam = async (id: number) => {
    try {
        const exam = await prisma.exam.delete({
            where: {
                id,
            },
        });
        return exam;
    } catch (error) {
        throw error;
    }
}
