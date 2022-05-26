/*
    includes external scripts: 
*/

var beval = document.createElement('script');
beval.src = 'includes/booleval.js';
document.head.appendChild(beval);

var meval = document.createElement('script');
meval.src = 'includes/mathEval.js';
document.head.appendChild(meval);

/*
    Global variables
*/

var counter_is = 0;

/*
    interpreter
*/

function interpret(container, data, code, clearContainer = true, edition = false) {

    if (!edition) {
        var mobile = /Mobi/.test(navigator.userAgent);
        var size = window.screen;
        data["width"] = size.width + "px";
        data["height"] = size.height + "px";
        data["mobile"] = mobile;
    }

    data = addUrlParamethers(data);
    var templates = [];
    if (clearContainer) {
        container.innerHTML = "";
    }
    var bytecode = code.split(";");
    for (var i = 0; i < bytecode.length; i++) {
        var command = bytecode[i].split(" ");
        switch (command[0]) {
            case "a":
                var current_container = container;
                if (command[3] != "g") {
                    if (!insideTemplate(command[3], templates)) {
                        current_container = document.getElementById(`${command[3]}`);
                    } else {
                        current_container = false;
                    }
                }
                if (current_container != false) {

                    addNewObject(command, true, current_container, data, templates, edition);
                } else {
                    insertTemplate(command[1], command[2], command[3], templates, command[4] != undefined ? command[4] : "");
                }
                break;
            case "c":
                var obj = container;
                if (command[3] != "g") {
                    if (!insideTemplate(command[3], templates)) {
                        obj = document.getElementById(replaceVariable(command[3], data, 0));
                    } else {
                        obj = false;
                    }
                }
                obj.style[atob(command[1])] = replaceVariable(atob(command[2]), data, 0);
                break;
            case "s":
                var obj = container;
                if (command[3] != "g") {
                    if (!insideTemplate(command[3], templates)) {
                        obj = document.getElementById(replaceVariable(command[3], data, 0));
                    } else {
                        obj = false;
                    }
                }
                if (obj != false && command[1] != "$") {
                    switch (command[1]) {
                        case "v":
                            switch (obj.tagName) {
                                case "DIV":
                                case "LABEL":
                                case "OPTION":
                                case "SCRIPT":
                                    obj.innerHTML = replaceVariable(atob(command[2]), data, 0);
                                    break;
                                case "IMG":
                                    obj.src = replaceVariable(atob(command[2]), data, 0);
                                    break;
                                default:
                                    obj.value = replaceVariable(atob(command[2]), data, 0);
                            }
                            break;
                        case "e":
                            obj.style.border = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "w":
                            obj.style.width = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "h":
                            obj.style.height = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "r":
                            obj.style.borderRadius = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "f":
                            obj.style.fontFamily = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "c":
                            obj.style.color = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "b":
                            obj.style.backgroundColor = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "g":
                            obj.style.background = "linear-gradient(" + replaceVariable(atob(command[2]), data, 0); + ")";
                            break;
                        case "s":
                            obj.style.boxShadow = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "l":
                            obj.style.left = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "t":
                            obj.style.top = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "a":
                            obj.style.textAlign = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "z":
                            obj.style.fontSize = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "m":
                            obj.style.margin = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "y":
                            obj.style.cssText = replaceVariable(atob(command[2]), data, 0);
                            break;
                        case "o":
                            obj.style.transform = `rotate(${replaceVariable(atob(command[2]), data, 0)})`;
                            break;
                    }
                } else {
                    if (command[1] != "$") {
                        setTemplate(command[3], `s ${command[1]} ${command[2]}`, templates);
                    } else {
                        data[command[3]] = replaceVariable(atob(command[2]), data, 0);
                        if (isValidExpression(data[command[3]])) {
                            data[command[3]] = mathEval(data[command[3]]);
                        }
                    }
                }
                break;
            case "d":
                var obj = document.getElementById(command[1]);
                obj.remove();
                break;
            case "g":

                if (checkCondition(command[2], data)) {
                    let index = getMarker(bytecode, command[1]);
                    i = index;
                }

                break;
        }
    }
    templating(templates, container, data, "", -1, edition);
}

function checkCondition(expression, data) {
    return boolEval(replaceVariable(atob(expression), data, 0));
}

function getMarker(lines, marker) {
    return lines.indexOf(`m ${marker}`);
}

function addUrlParamethers(data) {
    url_data = window.location.href;
    var url = new URL(url_data);
    for (var key of url.searchParams.keys()) {
        data[key] = url.searchParams.get(key);
    }
    return data;
}

// replaces variable with $ mark to its value
function replaceVariable(value, variables, start) {
    if (value.includes("$")) {
        for (var i = start; i < value.length; i++) {
            if (value[i] == "$") {
                start = i + 1;
                var index = indexOfCS(value, start);
                var variable = value.substring(start, index);
                value = value.replaceAll("$" + variable, variables[variable]);
                break;
            }
        }
        return replaceVariable(value, variables, start);
    } else {
        return value;
    }
}

//find first occurrence of separator char in string
function indexOfCS(value, start) {
    var chars = [" ", "\n", ":", "-", "(", ")", "[", "]", "!", "@", "#", "$", , "%", "&", "*", "+", "-", "=", "<", ">", ","];
    var indexes = chars.map(current => value.indexOf(current, start));
    indexes = indexes.map(index => index == -1 ? Number.MAX_SAFE_INTEGER : index);

    function order(a, b) {
        return a < b ? -1 : (a > b ? 1 : 0);
    }
    var index = indexes.sort(order)[0];
    return index == Math.max ? -1 : index;
}

//check if object is inside a template
function insideTemplate(value, templates) {
    for (var i = 0; i < templates.length; i++) {
        if (value == templates[i].name) {
            return true;
        }
        if (insideTemplate(value, templates[i].objects)) {
            return true;
        }
    }
    return false;
}

//insert a new object inside the list of template objects
function insertTemplate(type, name, container, templates, for_variable = "") {
    for (var i = 0; i < templates.length; i++) {
        if (container == templates[i].name) {
            templates[i].objects.push({ name: name, type: type, container: container, objects: [], set: [], template_array: templates[i].template_array, for: for_variable });
            break;
        }
        insertTemplate(type, name, container, templates[i].objects, for_variable);
    }
}

//holds the sets inside of the template objects
function setTemplate(name, set, templates) {
    for (var i = 0; i < templates.length; i++) {
        if (name == templates[i].name) {
            templates[i].set.push(set + " " + name);
            break;
        }
        setTemplate(name, set, templates[i].objects);
    }
}

//interpretation of the template objects
function templating(templates, container, current_data = {}, internal_container = "", iterator = -1, edition = false) {
    var actions = "";
    for (var i = 0; i < templates.length; i++) {
        if (templates[i].type == "p") {
            var dataset = iterator == -1 ? templates[i].template_array : templates[i].template_array[iterator];
            dataset = templates[i].for != undefined && templates[i].for != "" ? dataset[templates[i].for] : dataset;

            for (var j = 0; j < dataset.length; j++) {
                var data = dataset[j];
                var keys = Object.keys(current_data);
                for (var k = 0; k < keys.length; k++) {
                    data[keys[k]] = current_data[keys[k]];
                }
                var current_container = container;
                if (templates[i].container != "g") {
                    current_container = document.getElementById(`${internal_container == "" ? replaceVariable(templates[i].container, dataset[j], 0) : internal_container}`);
                }
                for (var k = 0; k < templates[i].objects.length; k++) {
                    var command = ["", templates[i].objects[k].type, templates[i].objects[k].name];
                    addNewObject(command, true, current_container, data, templates[i].objects, edition);
                    for (var n = 0; n < templates[i].objects[k].set.length; n++) {
                        interpret(document.getElementById(templates[i].container), data, replaceVariable(templates[i].objects[k].set[n], data, 0), false);
                    }
                    var current = replaceVariable(templates[i].objects[k].name, data, 0);
                    templating(templates[i].objects[k].objects, current_container, templates[i].template_array[j], current, j, edition);
                }
            }
        } else {
            var current_container = container;
            if (templates[i].container != "g") {
                current_container = document.getElementById(`${replaceVariable(templates[i].container, current_data, 0)}`);
            }
            var command = ["", templates[i].type, templates[i].name];
            addNewObject(command, false, current_container, current_data, [], edition);
            for (var j = 0; j < templates[i].set.length; j++) {
                interpret(document.getElementById(replaceVariable(templates[i].container, current_data, 0)), current_data, replaceVariable(templates[i].set[j], current_data, 0), false);
            }
        }
    }
}

//add a new html element to a container element
function addNewObject(command, pushTemplate, current_container, current_data, templates = [], edition = false) {
    switch (command[1]) {
        case "c":
            current_container.innerHTML += `<div id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}" style="float:left;position:relative;"></div>`;
            break;
        case "i":
            current_container.innerHTML += `<img id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"/>`;
            break;
        case "b":
            current_container.innerHTML += `<input type="submit" id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"/>`;
            break;
        case "f":
            current_container.innerHTML += `<form id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"></form>`;
            break;
        case "t":
            current_container.innerHTML += `<input type="text" id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"/>`;
            break;
        case "s":
            current_container.innerHTML += `<select id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"></select>`;
            break;
        case "o":
            current_container.innerHTML += `<option id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"></option>`;
            break;
        case "l":
            current_container.innerHTML += `<label id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"></label>`;
            break;
        case "p":
            if (pushTemplate) {
                templates.push({ name: replaceVariable(command[2], current_data, 0), type: "p", container: command[3], objects: [], template_array: current_data[command[4]] });
            }
            break;
        default:
            if (command[1][0] == "/") {
                let element = command[1].substring(1, command[1].length);
                current_container.innerHTML += `<${element} id="${replaceVariable(command[2], current_data, 0)}" class="${edition == true ? 'edition' : ''}"  style="float:left;position:relative;"></${element}>`;
            }
            break;
    }
}

/*
checks if is a valid expression
*/
function isValidExpression(expression) {
    return (/^[0-9.,\-\+\*\^\\" "]+$/.test(expression));
}