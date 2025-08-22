"use server"

import prisma from "@/lib/prisma";
import {Competition, Role} from "@prisma/client";

type RefereeUpdateData = {
    lastName?: string;
    firstName?: string;
    email?: string;
    role?: Role;
    competition?: Competition;
}

export const modifyReferee = async (id: number, refereeUpdateData: RefereeUpdateData) => {
    try {
        const referee = await prisma.referee.update({
            where: {id},
            data: refereeUpdateData,
        });
        return referee;
    } catch (error) {
        throw error;
    }
}
