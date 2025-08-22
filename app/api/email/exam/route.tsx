import {NextRequest, NextResponse} from "next/server";
import {Body, Head, Html, Link, Preview, Section, Tailwind, Text} from '@react-email/components'
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import texts from "@/public/text.json";

export async function POST(req: NextRequest) {
    try {
        const {EMAIL_FROM, EMAIL_SERVER_PASSWORD, CC_EMAIL} = process.env;

        if (!EMAIL_FROM || !EMAIL_SERVER_PASSWORD || !CC_EMAIL)
            return NextResponse.json({message: "Problem with env variables"}, {status: 500});

        const {email, idExam, idRefereeExam} = await req.json();

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: EMAIL_FROM,
                pass: EMAIL_SERVER_PASSWORD,
            },
        })

        const html = await render(formatEmail(idExam, idRefereeExam), {pretty: true});

        const mailOption = {
            from: EMAIL_FROM,
            to: email,
            subject: "Your rule test is ready !",
            html: html,
        }

        await transporter.sendMail(mailOption);

        return NextResponse.json({message: "Email Sent Successfully"}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: `Error when sending email ${error}`}, {status: 500})
    }
}

function formatEmail(idExam: number, idRefereeExam: number) {
    const baseUrl = `${texts.baseUrl}?ie=${idExam}&ire=${idRefereeExam}&l=`;
    return (
      <Html>
          <Head></Head>
          <Preview>Your test is ready</Preview>
          <Tailwind>
              <Body>
                  <Section>
                      <Text>Your test is ready.</Text>
                      <Text>Click the link below to take the test in ENGLISH.</Text>
                      <Link href={baseUrl+"en"}>{baseUrl+"en"}</Link>
                  </Section>
                  <Section>
                      <Text>Uw test is klaar.</Text>
                      <Text>Klik op de onderstaande link om de test in het NEDERLANDS te doen.</Text>
                      <Link href={baseUrl+"nl"}>{baseUrl+"nl"}</Link>
                  </Section>
                  <Section>
                      <Text>Votre examen est prêt.</Text>
                      <Text>Cliquez sur le lien ci-dessous pour passer le test en FRANCAIS.</Text>
                      <Link href={baseUrl+"fr"}>{baseUrl+"fr"}</Link>
                  </Section>
                  <Section>
                      <Text>Ihr Test ist fertig.</Text>
                      <Text>Klicken Sie hier, um den Test auf DEUTSCH zu bestehen.</Text>
                      <Link href={baseUrl+"de"}>{baseUrl+"de"}</Link>
                  </Section>
              </Body>
          </Tailwind>
      </Html>
    );
}