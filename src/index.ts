import fs from "fs";
import { cd } from "shelljs";

import { createVite } from "./scripts/createVite";
import { addDependencies } from "./utils/addDependencies";
import { execScript } from "./utils/execScript";
import { errLog, finalLog } from "./utils/logs";
import { makeQuestions } from "./utils/makeQuestions";

const main = async () => {
  const {
    tools,
    projectDetails: { isTypescript, projectName },
  } = await makeQuestions();

  if (fs.existsSync(projectName))
    return errLog("A folder with that name already exists!");

  try {
    const viteDependencies = await createVite({ isTypescript, projectName });

    let dependenciesArr = viteDependencies.dependencies;
    let devDependenciesArr = viteDependencies.devDependencies;

    for (const tool of tools) {
      const { dependencies, devDependencies } = await execScript(
        tool,
        isTypescript,
      );

      dependenciesArr = [...dependenciesArr, ...dependencies];
      devDependenciesArr = [...devDependenciesArr, ...devDependencies];
    }

    await addDependencies({
      dependencies: dependenciesArr,
      devDependencies: devDependenciesArr,
    });

    finalLog(projectName);
  } catch {
    cd("..");
    fs.rmSync(projectName, { recursive: true });
  }
};

main();
