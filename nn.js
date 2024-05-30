const { lerp } = require("./utils")

class NeuralActivation {
    static relu = function(x) {
        return Math.max(0, x)
    }

    static identity = function(x) {
        return x
    }
}

class NerualNode {
    constructor(nextLayerSize, bias) {
        this.value = 0
        this.nextLayerSize = nextLayerSize

        this.bias = bias

        this.weights = []
        this.minWeight = -1
        this.maxWeight = 1
        for (let i = 0; i < nextLayerSize; i++) {
            const randWeight = Math.random()*2-1
            this.weights.push(randWeight) // some random value
        }
    }

    static setNodeValue(neuralNode, x, activation=NeuralActivation.identity) {
        neuralNode.value = activation(x + neuralNode.bias)

    }

    static nodeConnect(neuralNode, i) {
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
                const randBias = Math.random()*2-1
                this.nodeList.push(new NerualNode(nextLayerSize, randBias))
            }
        }
    }

    static acceptInput(layerList) {
        if (layerList.prevLayer === null) {
            console.log("Cannot accept input in this layer.")
            return
        }

        for (let i = 0; i < layerList.nodeList.length; i++) {
            let nodeSum = 0
            layerList.prevLayer.nodeList.forEach(prevNode => {
                nodeSum += NerualNode.nodeConnect(prevNode, i)
            })
            // layerList.nodeList[i].setNodeValue(nodeSum, NeuralActivation.relu)
            NerualNode.setNodeValue(layerList.nodeList[i], nodeSum, NeuralActivation.relu)
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
            // console.log(`Prev Layer: ${this.getNodeValuesByLayerIndex(i - 1)}`)
            // console.log(`Current Layer: ${this.getNodeValuesByLayerIndex(i)}`)

            // brain.neuralLayerList[i].acceptInput()
            NerualLayer.acceptInput(brain.neuralLayerList[i])

            // console.log("After forward:")
            // console.log(`Prev Layer: ${this.getNodeValuesByLayerIndex(i - 1)}`)
            // console.log(`Current Layer: ${this.getNodeValuesByLayerIndex(i)}`)
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
        const newBrain = JSON.parse(JSON.stringify(brain))

        for (let i = 0; i < newBrain.neuralLayerList.length; i++) {
            // newBrain.neuralLayerList[i].layerMutate(mutationRate)
            NerualLayer.layerMutate(newBrain.neuralLayerList[i], mutationRate)
        }

        return newBrain
    }
}