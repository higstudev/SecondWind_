// get json file and parse into array
let json_table;
let json_paragraph;

fetch("./data_paragraph.json")
.then((res) => res.text())
.then((text) => {
    json_paragraph = JSON.parse(text);
})
.catch((e) => console.error(e));

fetch("./data_table.json")
.then((res) => res.text())
.then((text) => {
    json_table = JSON.parse(text);
})
.catch((e) => console.error(e));

// let par_tables = document.getElementById("par_tables");
// let tables = [];

// for (let i = 0; i < json.length; i++){
//     let table = document.createElement("table"); // 
//     par_tables.appendChild(table);
//     tables.push(table);
// }

let scope = [];
let code = [];
let resultCells = [];

function changeSubject(subject){
	document.querySelectorAll(".weeks").forEach((e) => {
		e.style.display = "none";
    });
	document.querySelectorAll("#"+subject).forEach((e) => {
		e.style.display = "block";
    });
}

function openFile(subject, week){
    week = "w" + week;
    
    p1.innerHTML = "";
    p2.innerHTML = "";
    //p3.innerHTML = "";
    
    let p2header = document.createElement("h1");
    p2header.innerHTML = "2. 데이터 테이블";
    p2.appendChild(p2header);

    scope = [];
    code = [];
    resultCells = [];
    
    make_paragraph(subject, week);
    for (let i = 0; i < json_table[subject][week].length; i++){
        make_table(subject, week, i);
    }
}

//////////

let p1 = document.getElementById("first"); // 개요
let p2 = document.getElementById("second"); // 테이블
let p3 = document.getElementById("third"); // 실험과정
let p4 = document.getElementById("fourth"); // 기타


// p1 만들기
function make_paragraph(subject, week){
    let p1header = document.createElement("h1");
    p1header.innerHTML = "1. 개요";
    let p1body = document.createElement("div");
    p1body.className = "paragraph_body";
    let data = json_paragraph[subject][week];
    for (let i = 0; i < data.length; i++){
        let parag = document.createElement("p");
        p1body.appendChild(parag);
        parag.innerHTML = data[i];
        if (data[i][0] == "\\") createMathJaxObj(parag, data[i]);
        //parag.innerHTML = "\\[R= \\frac{1}{\\mu} \\sqrt[3]{\\frac{NM}{dN_A}} \\]";
    }
    
    p1.appendChild(p1header);
    p1.appendChild(p1body);
}

// p2 만들기
let value_applied_event = new Event("value_applied");

// 2차원 배열이 주어졌다고 가정
function make_table(subject, week, index){
    scope[index] = { };
    code[index] = [];
    let data = json_table[subject][week][index];
    let table = document.createElement("table");
    for (let i = 0; i < data.length; i++){
        code[index][i] = [];
        let tr = document.createElement("tr");
        for (let j = 0; j < data[i].length; j++){
            let td = document.createElement("td");
            switch(data[i][j]["type"]){
                case "const":
                    td.innerHTML = data[i][j]["value"];
                    td.className = "constcell";
                    
                    if (data[i][j]["value"][0] == "\\") createMathJaxObj(td);
                    ApplyValue2Scope(index, i, j, data[i][j]["value"]);
                    break;
                    
                case "input":
                    let input = document.createElement("input");
                    input.type = "number";
                    input.value = 1;
                    ApplyValue2Scope(index, i, j, 1);
                    input.addEventListener("change", (e) => {
                        ApplyValue2Scope(index, i, j, e.target.value);
                        ApplyResultValues();
                    });
                    td.appendChild(input);
                    td.className = "inputcell";
                    break;
                    
                case "result":
                    td.innerHTML = "%result";
                    td.className = "resultcell";
                    ApplyValue2Scope(index, i, j, 1);
                    code[index][i][j] = math.compile(data[i][j]["value"].replaceAll("_i", "_" + i).replaceAll("_j", "_" + j));
                    resultCells.push(td);
                    td.addEventListener("value_applied", (e) => {
                        td.innerHTML = (code[index][i][j].evaluate(scope[index])).toPrecision(4);
                        ApplyValue2Scope(index, i, j, td.innerHTML);
                    });
                    break;
            }
            td.style.height = "3em";
            td.style.textAlign = "center";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    p2.appendChild(table);
    
    ApplyResultValues();
}

function ApplyValue2Scope(index, i, j, value){
    scope[index]["a_" + i + "_" + j] = parseFloat(value);
}

function ApplyResultValues(){
    for (let i = 0; i < resultCells.length; i++){
        resultCells[i].dispatchEvent(value_applied_event);
    }
}

function createMathJaxObj(e, text = ""){
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, e]);
    if (text != ""){ 
        e.addEventListener("click", (e) => {
            navigator.clipboard.writeText(text).then(e => {
                //console.log("copied! (" + text + ")");
                alert("copied! (" + text + ")");
            })
        })
    }
}

/////////
// URL
let urlParam = new URLSearchParams(window.location.search).get('data');
console.log(JSON.parse(urlParam));

function shareWithURL(){
    let resultURL = "";
    let resultDict = {};
        
     document.querySelectorAll("input[type=number]").forEach(e => {
         resultDict[e.id] = e.value;
     });
    
    console.log(JSON.stringify(resultDict));
}