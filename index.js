const mineflayer = require("mineflayer")
const fs = require("fs")
const { MCBot } = require("./mcBot")
const { NN } = require("./nn")

const PORT = 55624
const UNIQUE_PATH = "uniques.json"

let id = 1
let allBots = []
let uniqueList = []

if (fs.existsSync(UNIQUE_PATH)) {
    uniqueList = JSON.parse(fs.readFileSync(UNIQUE_PATH, "utf-8"))
}

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
            // Get Bot
            const botClass = getBotFromID(id)
            if (!botClass) {
                return
            }
            controlBot.chat("Observation of " + id)
            obs = botClass.getObservations()
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

    if (message.toLowerCase() === "start random") {

        const lastGen = 5
        const population = 5
        const maxSteps = 500

        for (let gen = 1; gen <= lastGen; gen++) {
            removeAllBots()
            createBots(population, gen)

            while (countReady() < population) {
                await controlBot.waitForTicks(1)
            }

            for (let step = 0; step < maxSteps; step++) {
                allBots.forEach(async (botClass) => {
                    // Random action
                    // const randAction = Math.floor(Math.random() * 8)
                    // botClass.botAction(randAction)

                    // Brain action
                    botClass.brainAction()
                })
                await controlBot.waitForTicks(1)
            }

            // Only keep the random
            const randKeep = allBots[Math.floor(Math.random() * allBots.length)]
            allBots.forEach((botClass) => {
                if ((botClass.id) !== randKeep.id) {
                    botClass.bot.quit()
                }
            })
            allBots = allBots.filter((botClass) => botClass.id === randKeep.id)
            console.log(allBots[0].name)
        }
        
    }

    if (message.toLowerCase() === "start evo") {
        const lastGen = 10
        const population = 5
        const maxSteps = 500

        const evoTime = new Date().getTime()

        let bestBrain = null
        for (let gen = 1; gen <= lastGen; gen++) {
            removeAllBots()
            if (gen === 1) {
                createMutateBots(population, gen, null, 0)
            }
            else {
                createMutateBots(population, gen, bestBrain, 0.2)
            }

            while (countReady() < population) {
                await controlBot.waitForTicks(1)
            }

            for (let step = 0; step < maxSteps; step++) {
                allBots.forEach(async (botClass) => {
                    // Random action
                    // const randAction = Math.floor(Math.random() * 8)
                    // botClass.botAction(randAction)

                    // Brain action
                    botClass.brainAction()
                })
                await controlBot.waitForTicks(1)
            }

            // Only keep the random
            const randKeep = allBots[Math.floor(Math.random() * allBots.length)]
            allBots.forEach((botClass) => {
                if ((botClass.id) !== randKeep.id) {
                    botClass.bot.quit()
                }
            })

            if (allBots.length > 0) {
                allBots = allBots.filter((botClass) => botClass.id === randKeep.id)
                console.log(allBots[0].name)
                bestBrain = allBots[0].brain

                // Save brain
                try {
                    const brainDir = `./models/${evoTime}/${gen}`
                    if (!fs.existsSync(brainDir)) {
                        fs.mkdirSync(brainDir, { recursive: true })
                    }

                    fs.writeFileSync(`${brainDir}/${allBots[0].name}.json`, JSON.stringify(bestBrain))
                }
                catch(error) {
                    controlBot.chat("Cannot save model.")
                    console.log(error)
                }
            }
            
        }
    }

    if (message.toLowerCase() === "load") {
        controlBot.chat("Loading Bot...")
        // load bot
        const brainDir = "models/1717075366470"
        removeAllBots()
        loadBot(`${brainDir}/1/GEN1ID4_GAEPY.json`, 4, 1)
        loadBot(`${brainDir}/5/GEN5ID3_OHdwW.json`, 3, 5)

        const maxSteps = 500

        while (countReady() < 2) {
            await controlBot.waitForTicks(1)
        }

        for (let step = 0; step < maxSteps; step++) {
            allBots.forEach(async (botClass) => {
                botClass.brainAction()
            })
            await controlBot.waitForTicks(1)
        }
    }

})

function createBots(amount, gen) {
    id = 1
    
    let unique = generateUnique(5)
    // console.log(uniqueList)
    while (uniqueList.includes(unique)) {
        unique = generateUnique(5)
    }
    uniqueList.push(unique)

    try {
        fs.writeFileSync(UNIQUE_PATH, JSON.stringify(uniqueList))
    } catch (error) {
        console.log(error)
    }

    const layerSizeList = [7, 5, 3, 2, 8]
    for (let i = 0; i < amount; i++) {

        // Create new bot
        const botClass = new MCBot(id, gen, unique, PORT, new NN(layerSizeList), 0.2)
        
        // Add bot to list
        allBots.push(botClass)

        // Remove when bot is dead
        botClass.bot.once("respawn", () => {
            removeBotByID(botClass.id)
        })

        // Control bot chat
        controlBot.chat(botClass.name + " Created.")

        id++
    }
}

function loadBot(brainPath, id, gen) {
    let unique = generateUnique(5)
    // console.log(uniqueList)
    while (uniqueList.includes(unique)) {
        unique = generateUnique(5)
    }
    uniqueList.push(unique)

    try {
        fs.writeFileSync(UNIQUE_PATH, JSON.stringify(uniqueList))
    } catch (error) {
        console.log(error)
    }

    let brain
    try {
        if (fs.existsSync(brainPath)) {
            brain = JSON.parse(fs.readFileSync(brainPath, "utf-8"))
        }
    }
    catch (error) {
        console.log(error)
    }

    if (brain) {
        const botClass = new MCBot(id, gen, unique, PORT, brain, 0)
        allBots.push(botClass)

        // Remove when bot is dead
        botClass.bot.once("respawn", () => {
            removeBotByID(botClass.id)
        })
    }
    else {
        controlBot.chat(`Cannot load brain from ${brainPath}.`)
    }
}

function createMutateBots(amount, gen, brain, mutationRate) {
    id = 1
    
    let unique = generateUnique(5)
    // console.log(uniqueList)
    while (uniqueList.includes(unique)) {
        unique = generateUnique(5)
    }
    uniqueList.push(unique)

    try {
        fs.writeFileSync(UNIQUE_PATH, JSON.stringify(uniqueList))
    } catch (error) {
        
    }

    const layerSizeList = [7, 5, 3, 2, 8]
    for (let i = 0; i < amount; i++) {

        // Create new bot
        let newBrain
        if (brain !== null) {
            if (i !== 0) {
                newBrain = NN.mutate(brain, mutationRate)
            }
            else {
                newBrain = NN.mutate(brain, 0)
            }
            
        }
        else {
            newBrain = new NN(layerSizeList)
        }
        
        const botClass = new MCBot(id, gen, unique, PORT, newBrain, 0.2)
        
        // Add bot to list
        allBots.push(botClass)

        // Remove when bot is dead
        botClass.bot.once("respawn", () => {
            removeBotByID(botClass.id)
        })

        // Control bot chat
        controlBot.chat(botClass.name + " Created.")

        id++
    }
}

function getBotFromID(id) {
    // Get Bot
    const botClass = allBots.find( (b) => b.id === id )

    if (!botClass) {
        controlBot.chat(`${id} not found.`)
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
    console.log(`Before remove: ${allBots}`)

    const botClass = getBotFromID(id)
    if (botClass) {
        botClass.bot.quit()
        allBots = allBots.filter( (b) => b.id !== id )
        controlBot.chat(`${botClass.name} has been removed.`)
    }

    console.log(`After remove: ${allBots}`)
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

function setBotToArenaById(id) {
    const botClass = getBotFromID(id)
    if (!botClass) {
        return
    }

    const randX = -210 + Math.floor(Math.random() * (-203 + 210 + 1))
    const randZ = 176 + Math.floor(Math.random() * (183 - 176 + 1))
    controlBot.chat(`/tp ${botClass.name} ${randX} -60 ${randZ}`)
}

function setBotToArenaByClass(botClass) {
    const randX = -210 + Math.floor(Math.random() * (-203 + 210 + 1))
    const randZ = 176 + Math.floor(Math.random() * (183 - 176 + 1))
    controlBot.chat(`/tp ${botClass.name} ${randX} -60 ${randZ}`)
}

function countReady() {
    return allBots.filter((botClass) => botClass.botReady).length
}

function generateUnique(uniqueLen) {
    const value = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"
    let uniqueValue = ""
    for (let i = 0; i < uniqueLen; i++) {
        uniqueValue += value[Math.floor(Math.random() * value.length)]
    }
    return uniqueValue
}