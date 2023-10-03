import { SlashCommandBuilder, EmbedBuilder, SnowflakeUtil } from "discord.js";

export default [
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
      .setName("invite")
      .setDescription("Give the bot invite link"),

    async execute(interaction, client) {
      const embed = new EmbedBuilder()
        .setDescription(
          "[Invite](https://discord.com/api/oauth2/authorize?client_id=1158315384290684949&permissions=395137068032&scope=bot%20applications.commands)",
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
  {
    data: new SlashCommandBuilder()
      .setName("setsheet")
      .setDescription("Set a sheet to use")
      .addStringOption((options) =>
        options
          .setName("sheet")
          .setDescription("Provide a sheet")
          .setRequired(true),
      ),

    async execute(interaction, client) {
      const sheet = interaction.options.getString("sheet");
      const embed = new EmbedBuilder()
        .setDescription(`Set ${sheet} as the current sheet.`)
        .setColor(client.color)
        .setFooter({
          iconURL: client.user.displayAvatarURL(),
          text: client.user.tag,
        });

      await (
        await fetch(`http://localhost:3000/servers/${interaction.guild.id}`, {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sheet,
          }),
        })
      ).json();

      await interaction.reply({
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
        await fetch(`http://localhost:3000/servers/${interaction.guild.id}`, {
          method: "post",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            channelId: channel.id,
          }),
        })
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
            "Server not setup.\nPls setup server using `/setchannel` & `/setsheet`.",
          )
          .setColor(client.color)
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: client.user.tag,
          });

        await interaction.reply({
          embeds: [embed],
        });
      } else if (!res.sheet) {
        const embed = new EmbedBuilder()
          .setDescription(
            "No sheet set for this server.\nPls set a sheet using `/setsheet`.",
          )
          .setColor(client.color)
          .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: client.user.tag,
          });

        await interaction.reply({
          embeds: [embed],
        });
      } else if (!res.channelId) {
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
        await interaction.deferReply();
        const initial = interaction.options.getNumber("initial");
        const final = interaction.options.getNumber("final");
        const data = await (
          await fetch(
            `http://localhost:3000/sheet?sheet=${res["sheet"]}&initial=${initial}&final=${final}`,
          )
        ).json();

        if (data["err"]) {
          const embed = new EmbedBuilder()
            .setDescription(
              "Invalid sheet name.\nEnter a valid sheet name using `/setsheet`",
            )
            .setColor(client.color)
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: client.user.tag,
            });

          await interaction.editReply({
            embeds: [embed],
          });
        } else {
          const embed = new EmbedBuilder()
            .setDescription(`Created post in <#${res.channelId}>.`)
            .setColor(client.color)
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: client.user.tag,
            });

          const forum = client.channels.cache.get(res["channelId"]);
          const tags = forum.availableTags;
          const newTags = {};
          for (let i = 0; i < tags.length; i++) {
            newTags[tags[i]["name"]] = tags[i]["id"];
          }

          console.log(newTags);

          forum.threads.create({
            name: data["compName"],
            message: {
              content: `# School\n## - ${data["compSchool"]}\n# Date\n${data[
                "compDate"
              ]
                .split(",")
                .map((data) => "## - " + data)
                .join("\n")}\n# Links\n${
                data["brochureLink"]
                  ? "## - [Brochure](<" + data["brochureLink"] + ">)"
                  : ""
              }\n${
                data["discordLink"]
                  ? "## - [Discord](<" + data["discordLink"] + ">)"
                  : ""
              }\n# Events\n${data["eventList"]
                .map((data) => "## - " + data.event + "-" + data.eligibility)
                .join("\n")}`,
            },
            appliedTags: [newTags[data["compMode"]], newTags[data["compType"]]],
          });

          await interaction.editReply({
            embeds: [embed],
          });
        }
      }
    },
  },
];
