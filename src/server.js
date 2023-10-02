const express = require("express");
const clientPromise = require("./MongoConnect.js");

const server = express();

server.all("/", (req, res) => {
  res.send("Bot is running!");
});

server.post("/servers/:serverid/:clientid", async (req, res) => {
  const serverId = req.params.serverid;
  const clientId = req.params.clientid;
  const client = await clientPromise;
  const db = client.db("EventManager");

  const data = await (
    await fetch(`http://localhost:3000/servers/${serverId}`)
  ).json();

  if (!data) {
    const data = await db.collection("servers").insertOne({
      serverId,
      clientId,
    });

    res.status(200).json(data);
  } else {
    const data = await db.collection("servers").updateOne(
      { serverId },
      {
        $set: {
          clientId,
        },
      },
    );

    res.status(200).json(data);
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

function keepAlive() {
  server.listen(3000, () => {
    console.log("Server is ready.");
  });
}

module.exports = keepAlive;
