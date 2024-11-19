export const Role = {
    STUDENT: "STUDENT",
    TEACHER: "TEACHER",
    ADMIN: "ADMIN"
} as const;
export type Role = (typeof Role)[keyof typeof Role];
export const SubjectLevel = {
    G1: "G1",
    G2: "G2",
    G3: "G3"
} as const;
export type SubjectLevel = (typeof SubjectLevel)[keyof typeof SubjectLevel];
export const ProjectType = {
    SCRATCH: "SCRATCH",
    MICROBIT: "MICROBIT",
    OTHERS: "OTHERS"
} as const;
export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];
export const ApprovalStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED"
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];
