import React from 'react';
import {notFound} from "next/navigation";
import prisma from "@/lib/prisma";
import DetailsComponent from "@/components/details.component";

const Page = async ({
                        searchParams,
                    }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {

    const { ie } = await searchParams;
    const idExam = parseInt(ie as string);

    if (!idExam) notFound();

    const exam = await prisma.exam.findUnique({
        where: {
            id: idExam,
        },
        include: {
            RefereeExam: {
                include: {
                    Referee: true,
                },
            }
        }
    });

    if (!exam) notFound();

    const referees = await prisma.referee.findMany();

    return <DetailsComponent exam={exam} referees={referees}/>
};

export default Page;