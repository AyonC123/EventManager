const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName("ping")
      .setDescription("Returns ping"),

    async execute(interaction, client) {
      const message = await interaction.deferReply({
        fetchReply: true,
      });

      const embed = new EmbedBuilder()
        .setDescription(
          `Api latency: ${client.ws.ping}\nClient ping: ${message.createdTimestamp - interaction.createdTimestamp
          }`,
        )
        .setColor(client.color)
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: client.user.tag,
        });

      await interaction.editReply({
        embeds: [embed],
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("setchannel")
      .setDescription("Set a post channel using id")
      .addChannelOption((options) =>
        options
          .setName("channel")
          .setDescription("Provide a channel")
          .setRequired(true),
      ),

    async execute(interaction, client) {
      const embed = new EmbedBuilder()
        .setDescription(
          `Set ${interaction.options.getChannel("channel")} as post channel`,
        )
        .setColor(client.color)
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: client.user.tag,
        });

      await interaction.reply({
        embeds: [embed],
      });
    },
  },
];
