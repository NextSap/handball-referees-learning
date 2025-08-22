export interface Question {
    id: string;
    question: string;
    answers: { [key: string]: string };
    correct: string[];
}

export interface Questions {
    [key: string]: Question[];
}

interface JsonData {
    questions: Questions;
}

export function loadJsonData(language: "en" | "fr" | "nl" | "de"): JsonData {
    return JSON.parse(JSON.stringify(require(`@/public/questions_${language}.json`)));
}

const en = loadJsonData("en");
const fr = loadJsonData("fr");
const nl = loadJsonData("nl");
const de = loadJsonData("de");

const rules = [
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "SAR"
]

export function getAllQuestions(language: "en" | "fr" | "nl" | "de"): Question[] {
    let questions: Question[] = [];

    rules.forEach(rule => {
        questions = questions.concat(getQuestions(rule, language));
    });

    return questions;
}

export function getQuestions(rule: string, language: "en" | "fr" | "nl" | "de"): Question[] {
    switch (language) {
        case "en":
            return en.questions[rule];
        case "fr":
            return fr.questions[rule];
        case "nl":
            return nl.questions[rule];
        case "de":
            return de.questions[rule];
    }
}

export function getRandomQuestions(rules: string[], amount: number, language: "en" | "fr" | "nl" | "de"): Question[] {
    let questions: Question[] = [];

    rules.forEach(rule => {
        questions = questions.concat(getQuestions(rule, language));
    });

    return questions.sort(() => Math.random() - Math.random()).slice(0, amount);
}

export function getQuestionsById(questionIdList: string[], language: "en" | "fr" | "nl" | "de", shuffle?: boolean): Question[] {
    let questions: Question[] = [];

    getAllQuestions(language).forEach(question => {
        if (questionIdList.includes(question.id)) {
            questions.push(question);
        }
    });

    return shuffle ? questions.sort(() => Math.random() - Math.random()) : questions;
}

export function getQuestionById(questionId: string, language: "en" | "fr" | "nl" | "de"): Question | undefined {
    return getAllQuestions(language).find(question => question.id === questionId);
}

export const rulesArray = [
    "1. Playing court",
    "2. Playing Time, Final Signal and Time-Outs",
    "3. The Ball",
    "4. The Team, Substitution Area and Team Officials",
    "5. The Goalkeeper",
    "6. The Goal Area",
    "7. Playing the Ball, Passive Play",
    "8. Fouls and Unsportsmanlike Conduct",
    "9. Scoring",
    "10. The Throw-Off",
    "11. The Throw-In",
    "12. The Goalkeeper Throw",
    "13. The Free Throw",
    "14. The 7-Metre Throw",
    "15. General Instructions for the Execution of the Throws",
    "16. The Punishments",
    "17. The Referees",
    "18. The Timekeeper and the Scorekeeper",
    "SAR"
]