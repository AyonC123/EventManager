require("dotenv").config();
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const token = process.env.TOKEN;
const commands = require("./commands.js");
const keepalive = require("./server.js");

const client = new Client({ intents: GatewayIntentBits.Guilds });
client.commands = new Collection();
client.commandsArray = [];
client.color = 0x2977f5;

client.once("ready", (client) => {
  console.log(`Logged in as ${client.user.tag}`);
});

commands.forEach((command) => {
  client.commands.set(command.data.name, command);
  client.commandsArray.push(command.data.toJSON());
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commands } = client;

    const { commandName } = interaction;
    const command = commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: `Something went wrong while executing this command...`,
        ephemeral: true,
      });
    }
  }
});

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

try {
  rest.put(Routes.applicationCommands(process.env.CLIENTID), {
    body: client.commandsArray,
  });

  // rest
  //   .delete(
  //     Routes.applicationCommand(process.env.CLIENTID, "1158341017687310357"),
  //   )
  //   .then(() => console.log("Successfully deleted application command"))
  //   .catch(console.error);
} catch (err) {
  console.error(err);
}

client.login(token);
keepalive();
