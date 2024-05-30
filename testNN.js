const { NN } = require("./nn")

class NNTest {
    constructor(brain) {
        this.brain = brain
    }

    forward(inputValues) {
        let outputs = NN.feedForward(this.brain, inputValues)
        console.log(outputs)
        console.log(outputs.indexOf(Math.max(...outputs)))
    }
}

let brain = new NN([5, 10, 1, 5])

const values1 = [1, 10, 100, 8, 9]
const values2 = [10, 11, 120, 10, 7]

// Old brain
console.log("=====Old brain=====")
let test1 = new NNTest(brain)
test1.forward(values1)
test1.forward(values2)
console.log()
console.log()

// New brain
console.log("=====New brain=====")
let brain1 = JSON.parse(JSON.stringify(test1.brain))
let newBrain = NN.mutate(brain1, 0)
let test2 = new NNTest(newBrain)
test2.forward(values1)
test2.forward(values2)
console.log()
console.log()

// Old brain
console.log("=====Old brain=====")
test1.forward(values1)
test1.forward(values2)