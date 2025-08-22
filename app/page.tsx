import React from 'react';
import prisma from "@/lib/prisma";
import {notFound} from "next/navigation";
import Home from "@/components/default.component";

const Page = async ({
                        searchParams,
                    }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {

    const { ie, l, ire } = await searchParams;
    const idExam = ie as string;
    const lang = l as "en" | "fr" | "nl" | "de";
    const idRefereeExam = parseInt(ire as string);

    if (!idExam || !lang || !idRefereeExam) notFound();

    if(lang !== "en" && lang !== "fr" && lang !== "nl" && lang !== "de") notFound();

    const refereeExam = await prisma.refereeExam.findUnique({
        where: {
            id: idRefereeExam,
        },
    });

    if(!refereeExam) notFound();

    const referee = await prisma.referee.findUnique({
        where: {
            id: refereeExam.idReferee
        },
    })
    const exam = await prisma.exam.findUnique({
        where: {
            id: refereeExam.idExam,
        },
    });

    if(!referee || !exam) notFound();

    return <Home exam={exam} referee={referee} refereeExam={refereeExam} lang={lang}/>
};

export default Page;