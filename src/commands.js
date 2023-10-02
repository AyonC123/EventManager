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
          `Api latency: ${client.ws.ping}\nClient ping: ${
            message.createdTimestamp - interaction.createdTimestamp
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
      const channel = interaction.options.getChannel("channel");
      const embed = new EmbedBuilder()
        .setDescription(`Set ${channel} as post channel.`)
        .setColor(client.color)
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: client.user.tag,
        });

      await (
        await fetch(
          `http://localhost:3000/servers/${interaction.guild.id}/${channel.id}`,
          {
            method: "post",
          },
        )
      ).json();

      await interaction.reply({
        embeds: [embed],
      });
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName("post")
      .setDescription("Create a post in the post channel")
      .addNumberOption((options) =>
        options
          .setName("initial")
          .setDescription("Row from which the event block start")
          .setRequired(true),
      )
      .addNumberOption((options) =>
        options
          .setName("final")
          .setDescription("Row at which the event block ends")
          .setRequired(true),
      ),

    async execute(interaction, client) {
      const res = await (
        await fetch(`http://localhost:3000/servers/${interaction.guild.id}`)
      ).json();

      if (!res) {
        const embed = new EmbedBuilder()
          .setDescription(
            "No post channel set for this server.\nPls set a post channel using `/setchannel`.",
          )
          .setColor(client.color)
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: client.user.tag,
          });

        await interaction.reply({
          embeds: [embed],
        });
      } else {
        const embed = new EmbedBuilder()
          .setDescription(`Created post in <#${res["clientId"]}>.`)
          .setColor(client.color)
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: client.user.tag,
          });

        await interaction.reply({
          embeds: [embed],
        });
      }
    },
  },
];
