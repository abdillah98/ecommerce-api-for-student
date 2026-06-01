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
        nim: "123232"
      },
      {
        name: "Budi",
        nim: "121323"
      },
      {
        name: "Citra",
        nim: "433221"
      }
    ]
  });

  const data = await db.select().from(projects);

  console.log(data);
}

test();