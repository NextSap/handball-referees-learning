"use server"

import prisma from "@/lib/prisma";
import {Role, Competition} from "@prisma/client";

export const createReferee = async (lastName: string, firstName: string, email: string, role: Role, competition: Competition) => {
    try {
        const referee = await prisma.referee.create({
            data: {
                lastName,
                firstName,
                email,
                role,
                competition,
            },
        });
        return referee;
    } catch (error) {
        throw error;
    }
}
