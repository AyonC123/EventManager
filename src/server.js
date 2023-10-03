import {} from "dotenv/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import bodyParser from "body-parser";
import express from "express";
import clientPromise from "./MongoConnect.js";

const server = express();

server.use(bodyParser.json());

server.all("/", (req, res) => {
  res.send("Bot is running!");
});

server.post("/servers/:serverid", async (req, res) => {
  const serverId = req.params.serverid;
  const channelId = req.body.channelId;
  const sheet = req.body.sheet;
  const client = await clientPromise;
  const db = client.db("EventManager");

  const data = await (
    await fetch(`http://localhost:3000/servers/${serverId}`)
  ).json();

  if (channelId && !sheet) {
    if (!data) {
      const data = await db.collection("servers").insertOne({
        serverId,
        channelId,
      });

      res.status(200).json(data);
    } else {
      const data = await db.collection("servers").updateOne(
        { serverId },
        {
          $set: {
            channelId,
          },
        },
      );

      res.status(200).json(data);
    }
  } else if (sheet && !channelId) {
    if (!data) {
      const data = await db.collection("servers").insertOne({
        serverId,
        sheet,
      });

      res.status(200).json(data);
    } else {
      const data = await db.collection("servers").updateOne(
        { serverId },
        {
          $set: {
            sheet,
          },
        },
      );

      res.status(200).json(data);
    }
  }
});

server.get("/servers/:serverid", async (req, res) => {
  const serverId = req.params.serverid;
  const client = await clientPromise;
  const db = client.db("EventManager");

  const data = await db.collection("servers").findOne({
    serverId,
  });

  res.status(200).json(data);
});

server.get("/sheet", async (req, res) => {
  const sheet = req.query.sheet;
  const initial = req.query.initial;
  const final = req.query.final;

  const jwt = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.split(String.raw`\n`).join("\n"),
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });

  const doc = new GoogleSpreadsheet(process.env.SHEET_ID, jwt);

  await doc.loadInfo();
  const docSheet = await doc.sheetsByTitle[sheet];

  if (!docSheet) {
    res.status(200).json({
      err: "err",
    });
  } else {
    const compName = (await docSheet.getCellsInRange(`A${initial}`))[0][0];
    const compMode = (
      await docSheet.getCellsInRange(`A${parseInt(initial) + 1}`)
    )[0][0];
    const compType = (
      await docSheet.getCellsInRange(`A${parseInt(initial) + 2}`)
    )[0][0];
    const compSchool = (
      await docSheet.getCellsInRange(`A${parseInt(initial) + 4}`)
    )[0][0];
    const compDate = (
      await docSheet.getCellsInRange(`A${parseInt(initial) + 5}`)
    )[0][0];

    const compEvents = await docSheet.getCellsInRange(
      `B${parseInt(initial)}:B${final}`,
    );

    const compEligibility = await docSheet.getCellsInRange(
      `C${parseInt(initial)}:C${final}`,
    );

    const compLinks = await docSheet.getCellsInRange(
      `A${parseInt(initial) + 7}:A${final}`,
    );

    let discordLink = "";
    let brochureLink = "";
    let brochureIdx = "";
    let discordIdx = "";
    let eventList = [];

    for (let i = 0; i < compLinks.length; i++) {
      if (compLinks[i][0]) {
        if (compLinks[i][0].toLowerCase() == "brochure") {
          brochureIdx = i;
        }
        if (compLinks[i][0].toLowerCase() == "discord") {
          discordIdx = i;
        }
      }
    }

    for (let i = 0; i < compEvents.length; i++) {
      if (compEvents[i][0] && compEligibility[i][0]) {
        eventList.push({
          event: compEvents[i][0],
          eligibility: compEligibility[i][0],
        });
      }
    }

    if (typeof brochureIdx == "number") {
      brochureIdx = parseInt(initial) + 7 + brochureIdx;
      await docSheet.loadCells(`A${brochureIdx}`);
      brochureLink = docSheet.getCell(brochureIdx - 1, 0).hyperlink;
    }
    if (typeof discordIdx == "number") {
      discordIdx = parseInt(initial) + 7 + discordIdx;
      await docSheet.loadCells(`A${discordIdx}`);
      discordLink = docSheet.getCell(discordIdx - 1, 0).hyperlink;
    }

    res.status(200).json({
      compName,
      compMode: compMode.toLowerCase(),
      compType: compType == "TO BE CONQUERED" ? "tbc" : "tbcaac",
      compSchool,
      compDate,
      brochureLink,
      discordLink,
      eventList,
    });
  }
});

export default () => {
  server.listen(3000, () => {
    console.log("Server is ready.");
  });
};
