import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { Role, SubjectLevel, ProjectType } from "./enums";

export type Competition = {
    id: string;
    name: string;
    description: string;
    startDate: Timestamp;
    endDate: Timestamp;
    createdById: string;
};
export type Project = {
    id: string;
    name: string;
    description: string;
    submittedAt: Timestamp;
    submittedById: string;
    author: string;
    authorEmail: string;
    competitionId: string;
    projectUrl: string;
};
export type Session = {
    id: string;
    userId: string;
    expiresAt: Timestamp;
};
export type User = {
    id: string;
    googleId: string;
    name: string;
    email: string;
    picture: string;
    role: Role;
};
export type Vote = {
    id: string;
    vote: number;
    userId: string;
    projectId: string;
    competitionId: string;
};
export type DB = {
    Competition: Competition;
    Project: Project;
    Session: Session;
    User: User;
    Vote: Vote;
};
