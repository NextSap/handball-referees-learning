"use server"

import prisma from "@/lib/prisma";

export const createRefereeExam = async (idReferee: number, idExam: number) => {
    try {
        const refereeExam = await prisma.refereeExam.create({
           data: {
               Referee: {
                   connect: {id: idReferee}
               },
               Exam: {
                   connect: {id: idExam}
               }
           }
        });
        return refereeExam;
    } catch (error) {
        throw error;
    }
}

export const createManyRefereeExam = async (idReferee: number[], idExam: number) => {
    try {
        const results = await Promise.all(
            idReferee.map(idRef =>
                prisma.refereeExam.create({
                    data: {
                        Referee: { connect: { id: idRef } },
                        Exam: { connect: { id: idExam } }
                    }
                })
            )
        );

        return results;
    } catch (error) {
        throw error;
    }
}