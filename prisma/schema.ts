import { z } from "zod";

// ===== Enumerations =====
export const RoleEnum = z.enum(["coach","referee","delegate"]);
export type Role = z.infer<typeof RoleEnum>;

export const CompetitionEnum = z.enum(["elite","national","league","regional"]);
export type Competition = z.infer<typeof CompetitionEnum>;

export const StateEnum = z.enum(["welcome","started", "finished"]);
export type State = z.infer<typeof StateEnum>;

// ===== Exam =====
export const ExamSchema = z.object({
    id: z.int(),
    title: z.string(),
    duration: z.number(),
    maxScore: z.number(),
    createdAt: z.date(),
    questions: z.array(z.string()),
});

export const ExamCreateSchema = ExamSchema.omit({ id: true });
export const ExamUpdateSchema = ExamCreateSchema.partial();
export type Exam = z.infer<typeof ExamSchema>;

// ===== Referee =====
export const RefereeSchema = z.object({
    id: z.int(),
    lastName: z.string(),
    firstName: z.string(),
    email: z.email(),
    role: RoleEnum,
    competition: CompetitionEnum,
});

export const RefereeCreateSchema = RefereeSchema.omit({ id: true });
export const RefereeUpdateSchema = RefereeCreateSchema.partial();
export type Referee = z.infer<typeof RefereeSchema>;
export type RefereeCreate = z.infer<typeof RefereeCreateSchema>;

// ===== RefereeExam =====
export const RefereeExamSchema = z.object({
    id: z.int(),
    idReferee: z.int(),
    idExam: z.int(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
    score: z.number(),
    answered: z.number(),
    wellAnswered: z.number(),
    state: StateEnum,
    resultSent: z.boolean(),
    emailSent: z.boolean(),
    answers: z.string(),
});

export const RefereeExamWithExamSchema = z.object({
    id: z.int(),
    idReferee: z.int(),
    idExam: z.int(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
    score: z.number(),
    answered: z.number(),
    wellAnswered: z.number(),
    state: StateEnum,
    resultSent: z.boolean(),
    emailSent: z.boolean(),
    answers: z.string(),
    Exam: ExamSchema,
});

export const RefereeExamWithRefereeSchema = z.object({
    id: z.int(),
    idReferee: z.int(),
    idExam: z.int(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
    score: z.number(),
    answered: z.number(),
    wellAnswered: z.number(),
    state: StateEnum,
    resultSent: z.boolean(),
    emailSent: z.boolean(),
    answers: z.string(),
    Referee: RefereeSchema,
});

export const RefereeExamWithRefereeAndExamSchema = z.object({
    id: z.int(),
    idReferee: z.int(),
    idExam: z.int(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
    score: z.number(),
    answered: z.number(),
    wellAnswered: z.number(),
    state: StateEnum,
    resultSent: z.boolean(),
    emailSent: z.boolean(),
    answers: z.string(),
    Referee: RefereeSchema,
    Exam: ExamSchema,
});

export const RefereeExamCreateSchema = RefereeExamSchema.omit({ id: true });
export const RefereeExamUpdateSchema = RefereeExamCreateSchema.partial();
export type RefereeExam = z.infer<typeof RefereeExamSchema>;
export type RefereeExamWithExam = z.infer<typeof RefereeExamWithExamSchema>;
export type RefereeExamWithReferee = z.infer<typeof RefereeExamWithRefereeSchema>;
export type RefereeExamWithRefereeAndExam = z.infer<typeof RefereeExamWithRefereeAndExamSchema>;

export const ExamWithRefereeExamSchema = z.object({
    id: z.int(),
    title: z.string(),
    duration: z.number(),
    maxScore: z.number(),
    createdAt: z.date(),
    questions: z.array(z.string()),
    RefereeExam: z.array(RefereeExamWithRefereeSchema)
});

export type ExamWithRefereeExam = z.infer<typeof ExamWithRefereeExamSchema>;