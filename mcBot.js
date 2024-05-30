const mineflayer = require("mineflayer")
const { NN } = require("./nn")

exports.MCBot = class {
    constructor(id, gen, unique, port, brain, explorationRate) {
        this.id = id
        this.gen = gen
        this.unique = unique
        this.name = `GEN${gen}ID${id}_${unique}`
        this.brain = brain
        this.explorationRate = explorationRate

        this.bot = mineflayer.createBot({
            host: "localhost",
            port: port,
            username: this.name
        })

        this.port = port
        this.survivalTime = 0
        this.bot.health = 20
        this.botReady = false

        this.bot.once("spawn", this.setBotToArena.bind(this))
    }

    setBotToArena() {
        const minX = -209
        const maxX = -204
        const minZ = 177
        const maxZ = 182

        const randX = minX + Math.floor(Math.random() * (maxX - minX + 1))
        const randZ = minZ + Math.floor(Math.random() * (maxZ - minZ + 1))
        // console.log(this.bot)
        this.bot.chat(`/tp ${this.name} ${randX} -60 ${randZ}`)

        this.botReady = true

        // Count survival time
        setInterval(() => {
            this.survivalTime++
        }, 1000);
    }

    getObservations() {
        if (!this.bot || !this.bot.entity) {
            return false
        }

        // Find nearest bot or player
        const nearestEntity = this.bot.nearestEntity( (e) => e.name.includes("ID") || 
        e.type === "player" || 
        e.type === "hostile" )

        // [ myPos, otherPos, myHealth ]
        if (nearestEntity === null) {
            return [
                this.bot.entity.position.x,
                this.bot.entity.position.y,
                this.bot.entity.position.z,

                0,
                0,
                0,

                this.bot.health
            ]
        }

        return [ 
            this.bot.entity.position.x,
            this.bot.entity.position.y,
            this.bot.entity.position.z,

            nearestEntity.position.x,
            nearestEntity.position.y,
            nearestEntity.position.z,

            this.bot.health
        ]
    }

    async brainAction() {

        if (Math.random() <= this.explorationRate) {
            // Explore
            const randAction = Math.floor(Math.random() * 8)
            await this.botAction(randAction)
        }
        else {
            // Exploit
            // this.bot.chat("Exploit!")
            const outputs = NN.feedForward(this.brain, this.getObservations())
            console.log(outputs)
            const actionId = outputs.indexOf(Math.max(...outputs))
            await this.botAction(actionId)
        }

        
    }

    async botAction(actionId) {
        if (!this.bot) {
            return false
        }

        // 0 -> forward, 1 -> back, 2 -> left, 3 -> right, 4 -> jump, 5 -> sprint, 6 -> sneak, 7 -> hit
        const actionSize = 8
        if (actionId + 1 > actionSize) {
            this.bot.chat(`No ${actionId} action.`)
            return false
        }
    
        // Reset control state
        const controlStateList = ["forward", "back", "left", "right", "jump", "sprint", "sneak"]
        controlStateList.forEach( (action) => {
            this.bot.setControlState(action, false)
        } )
    
        // Action
        if (actionId < 7) {
            this.bot.setControlState(controlStateList[actionId], true)
            // this.bot.chat(controlStateList[actionId] + "!")
        }
        else {
            // Hit
            // Find nearest bot or player
            const nearestEntity = this.bot.nearestEntity( (e) => e.name.includes("ID") || 
            e.type === "player" || 
            e.type === "hostile" )
            
            if (nearestEntity && nearestEntity !== null) {
                await this.bot.lookAt(nearestEntity.position.offset(0, nearestEntity.height, 0))
                this.bot.attack(nearestEntity)
            }
            // this.bot.chat("Hit!")
        }
    }
}