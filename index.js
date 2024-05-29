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

    if(message.toLowerCase() === "remove all") {
        let amount = allBots.length
        controlBot.chat("Removing " + amount + " bots...")
        removeAllBots()
    }

    else if (message.split(" ")[0].toLowerCase() === "remove") {
        let id = parseInt(message.split(" ")[1])
        if (id) {
            controlBot.chat("Removing " + id)
            removeBotByID(id)
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

function removeAllBots() {
    // console.log(`Before remove: ${allBots}`)

    let amount = allBots.length
    for (let i = 0; i < amount; i++) {
        allBots[i].quit()
        controlBot.chat(`${allBots[i].username} is removed.`)
        allBots[i] = ""
    }
    allBots = allBots.filter( (b) => b !== "" )

    controlBot.chat(`${amount} bots has been removed.`)

    // console.log(`After remove: ${allBots}`)
}

function removeBotByID(id) {
    // console.log(`Before remove: ${allBots}`)

    const botName = `ID_${id}`
    const bot = allBots.find( (b) => b.username === botName )
    if (bot) {
        bot.quit()
        allBots = allBots.filter( (b) => b.username !== botName )
        controlBot.chat(`${botName} has been removed.`)
    }
    else {
        controlBot.chat(`${botName} not found.`)
    }

    // console.log(`After remove: ${allBots}`)
}