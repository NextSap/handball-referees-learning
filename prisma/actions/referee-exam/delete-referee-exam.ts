"use server"

import prisma from "@/lib/prisma";

export const deleteRefereeExam = async (idRefereeExam: number) => {
    try {
        const deletedRefereeExam = await prisma.refereeExam.delete({
            where: {
                id: idRefereeExam,
            },
        });
        return true;
    } catch (error) {
        throw error;
    }
}