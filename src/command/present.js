import { watch } from "fs";
import readline from "readline";
import process from "process";
import Interpreter from "../core/Interpreter";
import Server from "../core/Server";

const { log, error } = console;

const flow = (talk, options = {}, init = false) => {
  Interpreter.convert(`./${talk}/main.sdf`, options)
    .then(async (html) => {
      if (options.save) {
        Object.entries(html).forEach(([key, value]) => {
          // eslint-disable-next-line no-undef
          Bun.write(`./${talk}/${key}.html`, value.html);
        });
      } else if (init) {
        Server.create(html, options, `${process.cwd()}/${talk}`);
      } else {
        Server.setHTML(html);
      }
    })
    .catch((err) => error(err));
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const getAction = () => {
  rl.question("", (answer) => {
    const i = answer.trim().toLowerCase();
    readline.moveCursor(process.stdout, 0, -1);
    readline.clearScreenDown(process.stdout);
    if (i === "q") process.exit();
    else if (i === "p") Server.send("previous");
    else Server.send("next");
    getAction();
  });
};

const present = (talk, options) => {
  log(
    "\n\n\x1b[4mTake the control of your presentation direct from here.\x1b[24m",
    "\n",
    `\nPress \x1b[1mEnter\x1b[0m to go to the next slide.`,
    `\nPress \x1b[1mP + Enter\x1b[0m to go to the previous slide.`,
    `\nPress \x1b[1mQ\x1b[0m to quit the program.`,
    "\n",
  );
  flow(talk, options, true);
  if (!options.save) {
    watch(talk, { recursive: true }, (eventType, filename) => {
      if (!filename.startsWith(".git")) {
        log(
          `♻️  ${chalk.underline(filename)} has "${chalk.italic(
            eventType,
          )}" action`,
        );
        flow(talk, options);
      }
    });
  }
  getAction();
};

export default present;
