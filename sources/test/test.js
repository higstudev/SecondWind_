let code1 = math.compile("1/a_0_0 * cbrt((a_0_1 * a_0_2) / (a_0_3 * a_0_4))");
let scope1 = { };
let data = [ [1, 2, 32, 3, 9] ];
for (let i = 0; i < data.length; i++){
    for (let j = 0; j < data[i].length; j++){
        scope1["a_" + i.toString() + "_" + j.toString()] = data[i][j];
    }
}
console.log(code1.evaluate(scope1));