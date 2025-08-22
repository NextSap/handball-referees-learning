import React from 'react';
import {notFound} from "next/navigation";
import prisma from "@/lib/prisma";
import HistoryComponent from "@/components/history.component";

const Page = async ({
                        searchParams,
                    }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
    const {ir} = await searchParams;

    const idReferee = parseInt(ir as string);

    if (!idReferee) notFound();

    const referee = await prisma.referee.findUnique({
        where: {
            id: idReferee
        },
    })

    if (!referee) notFound();

    const refereeExams = await prisma.refereeExam.findMany({
        where: {
            idReferee: idReferee,
        },
        include: {
            Exam: true,
        },
    });

    return <HistoryComponent referee={referee} refereeExams={refereeExams} />;
};

export default Page;