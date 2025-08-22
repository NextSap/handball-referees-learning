import React from 'react';
import prisma from "@/lib/prisma";
import RefereeComponent from "@/components/referee.component";

export default async function Referee() {

    const referees = await prisma.referee.findMany().then(referees => referees.sort((a, b) => a.lastName.localeCompare(b.lastName)));
    const exams = await prisma.exam.findMany();

    return (
        <RefereeComponent referees={referees} exams={exams}/>
    );
}