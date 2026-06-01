import { db } from "./database/db.js";
import { projects } from "./database/schema/projects.js";

async function test() {
  await db.insert(projects).values({
    projectTitle: "Kelompok A",
    projectDescription: "Project Ecommerce",
    projectClass: "IAB23",
    projectTeam: [
      {
        name: "Andi",
        role: "Developer"
      },
      {
        name: "Budi",
        role: "Designer"
      },
      {
        name: "Citra",
        role: "Manager"
      }
    ]
  });

  const data = await db.select().from(projects);

  console.log(data);
}

test();