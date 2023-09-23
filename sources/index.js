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
let currentSubject = "";
let currentWeek = 1;

function openIntro(){
	document.querySelector("#intro_menu").style.display = "block";
	document.querySelector("#first").style.display = "none";
	document.querySelector("#second").style.display = "none";
}

function changeSubject(subject){
	document.querySelectorAll(".weeks").forEach((e) => {
		e.style.display = "none";
    });
	document.querySelectorAll("#"+subject).forEach((e) => {
		e.style.display = "block";
    });
}

function openFile(subject, week){
    currentSubject = subject;
    currentWeek = week;
	
	//change the visibility of the week menu
	document.querySelector("#intro_menu").style.display = "none";
	document.querySelector("#first").style.display = "block";
	document.querySelector("#second").style.display = "block";
	
	//change the color of selected items
	document.querySelectorAll("ul li").forEach((e) => {
		e.style.backgroundColor = "white";
    });
	document.querySelector("#"+subject).childNodes[week * 2 - 1].style.backgroundColor = "#ced4da";
    
	
	
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

// p1 만들기
function make_paragraph(subject, week){
    let p1header = document.createElement("h1");
    p1header.innerHTML = "1. 개요";
    let p1body = document.createElement("div");
    p1body.className = "paragraph_body";
    let data = json_paragraph[subject][week];
    for (let i = 0; i < data.length; i++){
        if (data[i][0] == "\\" && data[i][1] == "[") {
            let parag = document.createElement("p");
            p1body.appendChild(parag);
            parag.innerHTML = data[i];
            let parent = document.createElement("span");
            parent.width = "100%";
            parent.style.display = "flex";
            parent.style.justifyContent = "center";
            parent.style.alignItems = "center";
            let img = document.createElement("img");
            img.src = "./source/copy.png";
            img.style.height = "1.15em";
            img.style.float = "right";
			img.style.marginLeft = "20px";
			img.style.cursor = "pointer";
            img.addEventListener("click", e => {
                navigator.clipboard.writeText(data[i]);
                alert("LaTeX Copied!\n");
            })
            parent.appendChild(parag);
            parent.appendChild(img);
            p1body.appendChild(parent);
            createMathJaxObj(parag, data[i]);
        }
        else{
            let parag = document.createElement("pre");
            p1body.appendChild(parag);
            parag.innerHTML = data[i];
        }
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
                    input.id = "input_" + i + "_" + j;
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
}

/*

/////////
// URL

let URL_LOCATION = "https://secondwind--mijkl.run.goorm.site/";

let FileParam = new URLSearchParams(window.location.search).get('file');
let DataParam = new URLSearchParams(window.location.search).get('data');
if (FileParam != null && json_table[FileParam] != null){
    openFile(FileParam.split("_")[0], FileParam.split("_")[1]);
    document.querySelectorAll("input[type=number]").forEach(e => {
        let dict = JSON.parse(DataParam);
        e.value = dict[e.id];
    });
    ApplyResultValues();
}
function shareWithURL(){
    let resultDict = {};
    document.querySelectorAll("input[type=number]").forEach(e => {
        resultDict[e.id] = e.value;
    });
    console.log(URL_LOCATION + "?file=" +  currentSubject + "_" + currentWeek + "&data=" + JSON.stringify(resultDict));
}

*/          

// p3 만들기

function make_third(subject, week){
    let p3header = document.createElement("h1");
    p3header.innerHTML = "1. 개요";
    let p3body = document.createElement("div");
    p3body.className = "paragraph_body";
    p3.appendChild(p3header);
    p3.appendChild(p3body);
}