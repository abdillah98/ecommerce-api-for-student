import { mysqlTable, serial, varchar, timestamp, json } from 'drizzle-orm/mysql-core';

export interface TeamMember {
  name: string;
  role: string;
}

export const projects = mysqlTable("projects", {
  id: serial("id").primaryKey(),
  projectTitle: varchar("project_title", { length: 255 }).notNull(),
  projectDescription: varchar("project_description", { length: 255 }),
  projectClass: varchar("project_class", { length: 100 }).notNull(),
  projectTeam: json('project_team').$type<TeamMember[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow()
});