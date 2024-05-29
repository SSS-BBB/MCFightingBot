const mineflayer = require("mineflayer")
const { MCBot } = require("./mcBot")

const PORT = 61126

let id = 1
let allBots = []

const controlBot = mineflayer.createBot({
    host: "localhost",
    port: PORT,
    username: "Control_Bot"
})

controlBot.on("chat", async (username, message) => {
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

    if (message.split(" ")[0].toLowerCase() === "observe") {
        let id = parseInt(message.split(" ")[1])
        if (id) {
            controlBot.chat("Observation of " + id)
            obs = getObservations(id)
            if (obs) {
                obs.forEach(e => {
                    controlBot.chat(String(e))
                })
            }
        }
    }

    if (message.split(" ")[0].toLowerCase() === "randomact") {
        let id = parseInt(message.split(" ")[1])
        if (id) {
            await randomAction(id)
        }
    }

    if (message.split(" ")[0].toLowerCase() === "hit") {
        let id = parseInt(message.split(" ")[1])

        // Get Bot
        const botClass = getBotFromID(id)
        if (!botClass) {
            return
        }

        botClass.botAction(7)
    }

    if (message.split(" ")[0].toLowerCase() === "tp") {
        let id = parseInt(message.split(" ")[1])

        // Get Bot
        const botClass = getBotFromID(id)
        if (botClass) {
            controlBot.chat(`/tp ${botClass.name} -207 -60 180`)
        }
    }
})

function createBots(amount) {
    for (let i = 0; i < amount; i++) {

        // Create new bot
        const botName = `ID_${id}`
        const botClass = new MCBot(botName, PORT)
        
        // Add bot to list
        allBots.push(botClass)

        // Control bot chat
        controlBot.chat(botName + " Created.")

        id++
    }
}

function getBotFromID(id) {
    // Get Bot
    const botName = `ID_${id}`
    const botClass = allBots.find( (b) => b.name === botName )

    if (!botClass) {
        controlBot.chat(`${botName} not found.`)
        return false
    }

    return botClass
}

function removeAllBots() {
    // console.log(`Before remove: ${allBots}`)

    let amount = allBots.length
    for (let i = 0; i < amount; i++) {
        allBots[i].bot.quit()
        controlBot.chat(`${allBots[i].name} is removed.`)
        allBots[i] = ""
    }
    allBots = allBots.filter( (b) => b !== "" )

    controlBot.chat(`${amount} bots has been removed.`)

    // console.log(`After remove: ${allBots}`)
}

function removeBotByID(id) {
    // console.log(`Before remove: ${allBots}`)

    const botName = `ID_${id}`
    const botClass = getBotFromID(id)
    if (botClass) {
        botClass.bot.quit()
        allBots = allBots.filter( (b) => b.name !== botName )
        controlBot.chat(`${botName} has been removed.`)
    }

    // console.log(`After remove: ${allBots}`)
}

async function randomAction(id) {
    // Get Bot
    const botClass = getBotFromID(id)
    if (!botClass) {
        return
    }

    // Random action
    const randAction = Math.floor(Math.random() * 8)
    await botClass.botAction(randAction)
}

function setBotToArena(id) {
    const botClass = getBotFromID(id)
    if (botClass) {
        const randX = -210 + Math.floor(Math.random() * (-203 + 210 + 1))
        const randZ = -210 + Math.floor(Math.random() * (-203 + 210 + 1))
        controlBot.chat(`/tp ${botClass.name} -207 -60 180`)
    }
}