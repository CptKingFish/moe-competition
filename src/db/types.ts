import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { Role, SubjectLevel, ProjectType, ApprovalStatus } from "./enums";

export type Competition = {
    id: string;
    name: string;
    description: string;
    startDate: Generated<Timestamp>;
    endDate: Generated<Timestamp>;
    createdById: string;
};
export type Project = {
    id: string;
    name: string;
    description: string | null;
    submittedAt: Generated<Timestamp>;
    submittedById: string;
    linkedSchoolId: string;
    author: string;
    authorEmail: string;
    competitionId: string;
    projectUrl: string;
    subjectLevel: SubjectLevel;
    projectType: ProjectType;
    projectCategoryId: string;
    youtubeUrl: string | null;
    bannerImg: Buffer | null;
    approverId: string | null;
    approvalStatus: Generated<ApprovalStatus>;
};
export type ProjectCategory = {
    id: string;
    name: string;
};
export type ProjectDraft = {
    id: string;
    name: string | null;
    description: string | null;
    draftedAt: Generated<Timestamp>;
    draftedById: string;
    linkedSchoolId: string;
    author: string | null;
    authorEmail: string | null;
    competitionId: string | null;
    projectUrl: string | null;
    subjectLevel: SubjectLevel | null;
    projectType: ProjectType | null;
    projectCategoryId: string | null;
    youtubeUrl: string | null;
    bannerImg: Buffer | null;
};
export type School = {
    id: string;
    name: string;
};
export type Session = {
    id: string;
    userId: string;
    expiresAt: Generated<Timestamp>;
};
export type User = {
    id: string;
    googleId: string | null;
    name: string | null;
    email: string;
    picture: string | null;
    role: Role;
    schoolId: string | null;
};
export type Vote = {
    id: string;
    userId: string;
    projectId: string;
    competitionId: string;
};
export type DB = {
    Competition: Competition;
    Project: Project;
    ProjectCategory: ProjectCategory;
    ProjectDraft: ProjectDraft;
    School: School;
    Session: Session;
    User: User;
    Vote: Vote;
};
