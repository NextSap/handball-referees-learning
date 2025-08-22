import {NextRequest, NextResponse} from "next/server";
import {Body, Head, Html, Preview, Section, Tailwind, Text} from '@react-email/components'
import nodemailer from 'nodemailer';
import {render} from '@react-email/render';
import {Question} from "@/lib/questions.utils";

export async function POST(req: NextRequest) {
    try {
        const {EMAIL_FROM, EMAIL_SERVER_PASSWORD, CC_EMAIL} = process.env;

        if (!EMAIL_FROM || !EMAIL_SERVER_PASSWORD || !CC_EMAIL)
            return NextResponse.json({message: "Problem with env variables"}, {status: 500});

        const {email, score, maxScore, answers, questions} = await req.json(); // GET THE LANGUAGE

        if (!email || typeof score == "undefined" || !maxScore || !questions)
            return NextResponse.json({message: `Invalid request`}, {status: 400});

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: EMAIL_FROM,
                pass: EMAIL_SERVER_PASSWORD,
            },
        })

        const html = await render(formatEmail(score, maxScore, answers as {
            [key: string]: string[]
        }, questions as Question[]), {pretty: true});

        const mailOption = {
            from: EMAIL_FROM,
            to: email,
            subject: "Result of your test !",
            html: html,
            attachments: [

            ]
        }

        await transporter.sendMail(mailOption);

        return NextResponse.json({message: "Email Sent Successfully"}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: `Error when sending email ${error}`}, {status: 500})
    }
}

function formatEmail(score: number, maxScore: number, answers: { [key: string]: string[] }, questions: Question[]) {
    return (
        <Html>
            <Head></Head>
            <Preview>Your answers and correction</Preview>
            <Tailwind>
                <Body>
                    <Text>Hereafter your answers and correction :</Text>
                    <Section>
                        <table style={{border: "black 1px solid", borderCollapse: "collapse"}}>
                            <tr style={{border: "black 1px solid", borderCollapse: "collapse"}}>
                                <th style={{
                                    border: "black 1px solid",
                                    borderCollapse: "collapse",
                                    padding: "5px"
                                }}>Questions
                                </th>
                                <th style={{border: "black 1px solid", borderCollapse: "collapse", padding: "5px"}}>Your
                                    answers
                                </th>
                                <th style={{
                                    border: "black 1px solid",
                                    borderCollapse: "collapse",
                                    padding: "5px"
                                }}>Correct answers
                                </th>
                            </tr>
                            {questions.map((question, index) => {
                                if(!answers[question.id]) {
                                    return (
                                        <tr style={{border: "black 1px solid", borderCollapse: "collapse"}} key={index}>
                                            <td style={{
                                                border: "black 1px solid",
                                                borderCollapse: "collapse"
                                            }}>{question.id} {question.question}</td>
                                            <td style={{
                                                border: "black 1px solid",
                                                borderCollapse: "collapse"
                                            }}></td>
                                            <td style={{
                                                border: "black 1px solid",
                                                borderCollapse: "collapse"
                                            }}>{format(question.correct)}</td>
                                        </tr>
                                    )
                                }
                                return (
                                    <tr style={{border: "black 1px solid", borderCollapse: "collapse"}} key={index}>
                                        <td style={{
                                            border: "black 1px solid",
                                            borderCollapse: "collapse"
                                        }}>{question.id} {question.question}</td>
                                        <td style={{
                                            border: "black 1px solid",
                                            borderCollapse: "collapse"
                                        }}>{format(answers[question.id])}</td>
                                        <td style={{
                                            border: "black 1px solid",
                                            borderCollapse: "collapse"
                                        }}>{format(question.correct)}</td>
                                    </tr>
                                )
                            })}
                        </table>
                    </Section>
                    <Text>Your score is {score}/{maxScore}</Text>
                </Body>
            </Tailwind>
        </Html>
    );
}

function format(array: any[]) {
    return array.map((value, index) => {
        return (
            <span key={index}>{value} </span>
        )
    })
}