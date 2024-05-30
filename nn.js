const { lerp } = require("./utils")

const minRand = -1
const maxRand = 1

class NeuralActivation {
    static relu = function(x) {
        return Math.max(0, x)
    }

    static parametricRelu = function(x) {
        if (x >= 0) {
            return x
        }

        return 0.01 * x
    }

    static sigmoid = function(x) {
        return 1 / (1 + Math.pow(Math.E, -x))
    }

    static identity = function(x) {
        return x
    }

    static gaussian = function(x) {
        return Math.pow(Math.E, -Math.pow(x, 2))
    }
}

class NerualNode {
    constructor(nextLayerSize, bias) {
        this.value = 0
        this.nextLayerSize = nextLayerSize

        this.bias = bias

        this.weights = []
        for (let i = 0; i < nextLayerSize; i++) {
            const randWeight = Math.random()*(maxRand - minRand) + minRand
            this.weights.push(randWeight) // some random value
        }
    }

    static setNodeValue(neuralNode, x, activation=NeuralActivation.identity) {
        neuralNode.value = activation(x + neuralNode.bias)

    }

    static nodeConnect(neuralNode, i) {
        // console.log(neuralNode.value)
        return neuralNode.value * neuralNode.weights[i]
    }

    static weightMutate(neuralNode, mutationRate) {
        for (let i = 0; i < neuralNode.weights.length; i++) {
            const randWeight = Math.random()*2-1
            neuralNode.weights[i] = lerp(neuralNode.weights[i], randWeight, mutationRate)
        }
    }
}

class NerualLayer {
    constructor(prevLayer, nextLayerSize, inputLayerSize=0) {
        if (prevLayer === null) {
            // Input layer
            this.layerSize = inputLayerSize
            this.prevLayer = prevLayer
            this.nextLayerSize = nextLayerSize
        }

        else {
            this.prevLayer = prevLayer
            this.layerSize = prevLayer.nextLayerSize
            this.nextLayerSize = nextLayerSize
        }

        this.nodeList = []
        this.minBias = -1
        this.maxBias = 1
        for (let i = 0; i < this.layerSize; i++) {
            if (prevLayer === null) {
                this.nodeList.push(new NerualNode(nextLayerSize, 0))
            }
            else {
                const randBias = Math.random()*(maxRand - minRand) + minRand
                this.nodeList.push(new NerualNode(nextLayerSize, randBias))
            }
        }
    }

    static acceptInput(layerList, prevLayer) {
        if (prevLayer === null) {
            console.log("Cannot accept input in this layer.")
            return
        }

        for (let i = 0; i < layerList.nodeList.length; i++) {
            let nodeSum = 0
            prevLayer.nodeList.forEach(prevNode => {
                nodeSum += NerualNode.nodeConnect(prevNode, i)
            })
            // layerList.nodeList[i].setNodeValue(nodeSum, NeuralActivation.relu)
            NerualNode.setNodeValue(layerList.nodeList[i], nodeSum, NeuralActivation.identity)
            // console.log(layerList.nodeList[i])
        }
    }

    static layerMutate(layerList, mutationRate) {
        for (let i = 0; i < layerList.nodeList.length; i++) {
            if (layerList.prevLayer !== null) {
                const randBias = Math.random()*2-1
                layerList.nodeList[i].bias = lerp(layerList.nodeList[i].bias, randBias, mutationRate)
            }

            // layerList.nodeList[i].weightMutate(mutationRate)
            NerualNode.weightMutate(layerList.nodeList[i], mutationRate)
        }
    }
}

exports.NN = class {
    constructor(layerSizeList) {
        this.classname = this.constructor.name
        this.layerSizeList = layerSizeList
        this.neuralLayerList = []
        for (let i = 0; i < layerSizeList.length; i++) {
            if (i === 0) {
                // Input Layer
                this.neuralLayerList.push(new NerualLayer(null, layerSizeList[i + 1], layerSizeList[i]))
            }
            else if (i === layerSizeList - 1) {
                // Output Layer
                this.neuralLayerList.push(new NerualLayer(this.neuralLayerList[i - 1], 0))
            }
            else {
                // Hidden Layer
                this.neuralLayerList.push(new NerualLayer(this.neuralLayerList[i - 1], layerSizeList[i + 1]))
            }
        }
    }

    static feedForward(brain, inputValues) {
        if (inputValues.length !== brain.neuralLayerList[0].nodeList.length) {
            console.log("Cannot accept these inputs.")
            return
        }

        for (let i = 0; i < inputValues.length; i++) {
            // brain.neuralLayerList[0].nodeList[i].setNodeValue(inputValues[i])
            NerualNode.setNodeValue(brain.neuralLayerList[0].nodeList[i], inputValues[i])
        }

        for (let i = 1; i < brain.neuralLayerList.length; i++) {
            // console.log(`=====Layer${i + 1}=====`)
            // console.log("Before forward:")
            // console.log(`Prev Layer: ${brain.neuralLayerList[i - 1].nodeList.map((n) => n.value)}`)
            // console.log(`Current Layer: ${brain.neuralLayerList[i].nodeList.map((n) => n.value)}`)

            // brain.neuralLayerList[i].acceptInput()
            NerualLayer.acceptInput(brain.neuralLayerList[i], brain.neuralLayerList[i - 1])

            // console.log(brain.neuralLayerList[i].prevLayer)

            // console.log("After forward:")
            // console.log(`Prev Layer: ${brain.neuralLayerList[i - 1].nodeList.map((n) => n.value)}`)
            // console.log(`Current Layer: ${brain.neuralLayerList[i].nodeList.map((n) => n.value)}`)
        }

        // return getNodeValuesByLayerIndex(brain, brain.neuralLayerList.length - 1)
        return brain.neuralLayerList[brain.neuralLayerList.length - 1].nodeList.map((n) => n.value)
    }

    static getNodeValues(nodeList) {
        return nodeList.map((n) => n.value)
    }

    static getNodeValuesByLayerIndex(brain, i) {
        return brain.getNodeValues(brain.neuralLayerList[i].nodeList)
    }

    static mutate(brain, mutationRate) {
        // copy value of the old brain
        // const newBrain = Object.assign(Object.create(Object.getPrototypeOf(brain)), brain)
        // const newBrain = Object.assign(Object.create(Object.getPrototypeOf(brain)), brain)
        // console.log(brain.neuralLayerList[1].prevLayer)
        let newBrain = JSON.parse(JSON.stringify(brain))
        // console.log(newBrain.neuralLayerList[1].prevLayer)

        for (let i = 0; i < newBrain.neuralLayerList.length; i++) {
            // newBrain.neuralLayerList[i].layerMutate(mutationRate)
            NerualLayer.layerMutate(newBrain.neuralLayerList[i], mutationRate)
        }

        return newBrain
    }
}