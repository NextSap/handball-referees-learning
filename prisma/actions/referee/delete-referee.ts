"use server"

import prisma from "@/lib/prisma";

export const deleteReferee = async (id: number) => {
    try {
        const referee = await prisma.referee.delete({
            where: {
                id
            },
        });
        return referee;
    } catch (error) {
        throw error;
    }
}
