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

let brain = new NN([5, 4, 3, 5])

const values1 = [1, 10, 100, 8, 9]
const values2 = [1, 2, 3, 6, 9]

// Old brain
console.log("=====Old brain=====")
let test1 = new NNTest(brain)
test1.forward(values1)
test1.forward(values2)

// New brain
console.log("=====New brain=====")
let brain1 = test1.brain
let newBrain = NN.mutate(brain1, 0.5)
let test2 = new NNTest(newBrain)
test2.forward(values1)
test2.forward(values2)

// Old brain
console.log("=====Old brain=====")
test1.forward(values1)
test1.forward(values2)

// New brain
console.log("=====New brain=====")
test2.forward(values1)
test2.forward(values2)