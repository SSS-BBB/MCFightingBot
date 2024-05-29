const mineflayer = require("mineflayer")

const PORT = 63230

let id = 1
let allBots = []

const controlBot = mineflayer.createBot({
    host: "localhost",
    port: PORT,
    username: "Control_Bot"
})

controlBot.on("chat", (username, message) => {
    if (message.split(" ")[0].toLowerCase() === "create") {
        let amount = parseInt(message.split(" ")[1])
        if (amount) {
            controlBot.chat("Creating " + amount + " bots...")
            createBots(amount)
        }
    }
})

function createBots(amount) {
    for (let i = 0; i < amount; i++) {

        // Create new bot
        const botName = `ID_${id}`
        const bot = mineflayer.createBot({
            host: "localhost",
            port: PORT,
            username: botName
        })
        
        // Add bot to list
        allBots.push(bot)

        // Control bot chat
        controlBot.chat(botName + " Created.")

        id++
    }
}