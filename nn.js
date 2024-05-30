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
        for (let i = 0; i < nextLayerSize; i++) {
            const minWeight = -1
            const maxWeight = 1
            const randWeight = minWeight + Math.floor(Math.random() * (maxWeight - minWeight + 1))
            this.weights.push(randWeight) // some random value
        }
    }

    setNodeValue(x, activation=NeuralActivation.identity) {
        this.value = activation(x + this.bias)

    }

    nodeConnect(i) {
        return this.value * this.weights[i]
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
        for (let i = 0; i < this.layerSize; i++) {
            if (prevLayer === null) {
                this.nodeList.push(new NerualNode(nextLayerSize, 0))
            }
            else {
                const minBias = -1
                const maxBias = 1
                const randBias = minBias + Math.floor(Math.random() * (maxBias - minBias + 1))
                this.nodeList.push(new NerualNode(nextLayerSize, randBias))
            }
        }
    }

    acceptInput() {
        if (this.prevLayer === null) {
            console.log("Cannot accept input in this layer.")
            return
        }

        for (let i = 0; i < this.nodeList.length; i++) {
            let nodeSum = 0
            this.prevLayer.nodeList.forEach(prevNode => {
                nodeSum += prevNode.nodeConnect(i)
            })
            this.nodeList[i].setNodeValue(nodeSum, NeuralActivation.relu)
        }
    }
}

exports.NN = class {
    constructor(layerSizeList) {
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

    feedForward(inputValues) {
        if (inputValues.length !== this.neuralLayerList[0].nodeList.length) {
            console.log("Cannot accept these inputs.")
            return
        }

        for (let i = 0; i < inputValues.length; i++) {
            this.neuralLayerList[0].nodeList[i].setNodeValue(inputValues[i])
        }

        for (let i = 1; i < this.neuralLayerList.length; i++) {
            console.log(`=====Layer${i + 1}=====`)
            console.log("Before forward:")
            console.log(`Prev Layer: ${this.getNodeValuesByLayerIndex(i - 1)}`)
            console.log(`Current Layer: ${this.getNodeValuesByLayerIndex(i)}`)

            this.neuralLayerList[i].acceptInput()

            console.log("After forward:")
            console.log(`Prev Layer: ${this.getNodeValuesByLayerIndex(i - 1)}`)
            console.log(`Current Layer: ${this.getNodeValuesByLayerIndex(i)}`)
        }

        return this.getNodeValuesByLayerIndex(this.neuralLayerList.length - 1)
    }

    static getNodeValues(nodeList) {
        return nodeList.map((n) => n.value)
    }

    getNodeValuesByLayerIndex(i) {
        return NN.getNodeValues(this.neuralLayerList[i].nodeList)
    }
}

// const brain = new NN([3, 4, 3, 2])
// console.log(brain.feedForward([-5, -10, -7]))