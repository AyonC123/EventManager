const { SlashCommandBuilder } = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("returns my ping"),

    async execute(interaction, client) {
      const message = await interaction.deferReply({
        fetchReply: true,
      });

      const msg = `Api latency: ${client.ws.ping}\nClient ping: ${message.createdTimestamp - interaction.createdTimestamp
        }`;

      await interaction.editReply({
        content: msg,
      });
    },
  },
];
