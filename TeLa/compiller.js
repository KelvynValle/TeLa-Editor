function compiller(code) {
    code = convertIsGoto(code);
    var lines = code.split("\n");
    var bytecode = "";
    for (var i = 0; i < lines.length; i++) {
        var code = [];
        if (lines[i].includes('(')) {
            code = sliceParenthesis(lines[i]);
        } else if (lines[i].includes('"')) {
            code = slice(lines[i]);
        } else {
            code = lines[i].split(" ");
        }
        switch (code[0]) {
            case "add":
                bytecode += "a ";
                switch (code[1]) {
                    case "template":
                        bytecode += "p ";
                        break;
                    case "container":
                        bytecode += "c ";
                        break;
                    case "image":
                        bytecode += "i ";
                        break;
                    case "button":
                        bytecode += "b ";
                        break;
                    case "form":
                        bytecode += "f ";
                        break;
                    case "text":
                        bytecode += "t ";
                        break;
                    case "select":
                        bytecode += "s ";
                        break;
                    case "option":
                        bytecode += "o ";
                        break;
                    case "label":
                        bytecode += "l ";
                        break;
                    default:
                        if (code[1][0] == "\'") {
                            bytecode += "/" + code[1].substring(1, code[1].length - 1) + " ";
                        }
                        break;
                }
                bytecode += `${code[2]} ${code[4] == 'global' ? 'g' : code[4]} ${code[1] == "template" ? code[6].replace("$", "") : ""};`;
                break;
            case "style":
                bytecode += "c ";
                bytecode += `${btoa(code[1])} `;
                bytecode += `${btoa(code[2])} ${code[4] == 'global' ? 'g' : code[4]};`;
                break;
            case "set":
                bytecode += "s ";
                switch (code[1]) {
                    case "value":
                        bytecode += "v ";
                        break;
                    case "border":
                        bytecode += "e ";
                        break;
                    case "width":
                        bytecode += "w ";
                        break;
                    case "height":
                        bytecode += "h ";
                        break;
                    case "round":
                        bytecode += "r ";
                        break;
                    case "font":
                        bytecode += "f ";
                        break;
                    case "color":
                        bytecode += "c ";
                        break;
                    case "background":
                        bytecode += "b ";
                        break;
                    case "gradient":
                        bytecode += "g ";
                        break;
                    case "shadow":
                        bytecode += "s ";
                        break;
                    case "left":
                        bytecode += "l ";
                        break;
                    case "top":
                        bytecode += "t ";
                        break;
                    case "align":
                        bytecode += "a ";
                        break;
                    case "size":
                        bytecode += "z ";
                        break;
                    case "margin":
                        bytecode += "m ";
                        break;
                    case "rotate":
                        bytecode += "o ";
                        break;
                    case "style":
                        bytecode += "y ";
                    default:
                        if (code.length == 4) {
                            bytecode += "$ ";
                            code.splice(2, 0, code[1]);
                            code[4] = code[4].replace("$", "");
                        }
                        break;
                }
                bytecode += `${btoa(code[2])} ${code[4] == 'global' ? 'g' : code[4]};`;
                break;
            case "delete":
                bytecode += `d ${code[1]};`;
                break;
            case "marker":
                bytecode += `m ${btoa(code[1])};`;
                break;
            case "goto":
                bytecode += `g ${btoa(code[1])} ${btoa(code[3])};`;
                break;
            case "template":


        }
    }
    return bytecode;
}

function compileToVirtual(code) {
    var lines = code.split("\n");
    objects = [];
    id_index_counter = 0;
    code_residue = "";
    for (var i = 0; i < lines.length; i++) {
        var code = [];
        if (lines[i].includes('"')) {
            code = slice(lines[i]);
        } else {
            code = lines[i].split(" ");
        }
        switch (code[0]) {
            case "add":
                var type = code[1];
                var name = code[2];
                var container = code[4];
                if (type != "template") {
                    addObject(type, name, container);
                } else {
                    addObject(type, name, container, code[6]);
                }

                break;
            case "set":
                if (code.length > 4) {
                    var property = code[1];
                    var obj = code[4];
                    var value = (code[2]);
                    changeProperty(obj, property, value);
                } else {
                    var value = code[1];
                    var obj = code[3];
                    changeVariable(obj, value);
                }

                break;
            default:
                code_residue += code_residue[code_residue.length - 1] == "\n" ? lines[i] : ("\n" + lines[i]);
                break;
        }
    }
}

function slice(str) {
    var arr = [];
    var quote = false;
    arr.push("");
    for (var i = 0; i < str.length; i++) {
        if (str[i] == " " && !quote) {
            arr.push("");
        } else {
            if (str[i] == '"') {
                quote = !quote;
            } else {
                arr[arr.length - 1] += str[i];
            }
        }
    }
    return arr;
}

function sliceParenthesis(str) {
    let arr = [];
    let parenthesis_count = 0;
    var quote = false;
    arr.push("");
    for (let i = 0; i < str.length; i++) {
        if (parenthesis_count == 0 && str[i] == " " && !quote) {
            arr.push("");
        } else {

            if (str[i] == "(") {
                arr[arr.length - 1] += str[i];
                parenthesis_count++;
            } else if (str[i] == ")") {
                arr[arr.length - 1] += str[i];
                parenthesis_count--;
            } else if (str[i] == '"') {
                quote = !quote;
            } else {
                arr[arr.length - 1] += str[i];
            }
        }
    }
    return arr;
}

//goto and is/if (condition)

function convertIsGoto(code, parent_block = "") {
    var splited = code.split("\n");
    for (var i = 0; i < splited.length; i++) {
        while (splited[i][0] == " ") {
            splited[i] = splited[i].slice(1, splited[i].length);
        }
    }
    var current_block = 0;
    var converted = "";
    for (var i = 0; i < splited.length; i++) {
        var line = [];
        if (splited[i].includes('(')) {
            line = sliceParenthesis(splited[i]);
        } else if (splited[i].includes('"')) {
            line = slice(splited[i]);
        } else {
            line = splited[i].split(" ");
        }
        if (line[0] == "is") {
            current_block++;
            var end_is = findEndIs(splited, i);
            var current_so = 1;
            while (i != end_is) {
                if (hasNextSo(splited, i)) {
                    converted += `goto "so${parent_block}.${current_block}.${current_so}" if !${getLogical(splited[i])}\n`;
                    var index_next_so = indexNextSo(splited, i);
                    converted += convertIsGoto(flatArray(splited, i + 1, index_next_so - 1), parent_block + "." + current_block + "." + current_so);
                    converted += `goto "ok${parent_block}.${current_block}" if (1 == 1)\n`;
                    converted += `marker "so${parent_block}.${current_block}.${current_so}"\n`;
                    current_so++;
                    i = index_next_so;
                } else {
                    converted += `goto "not${parent_block}.${current_block}" if !${getLogical(splited[i])}\n`;
                    var index_next_so = indexNextSo(splited, i);
                    converted += convertIsGoto(flatArray(splited, i + 1, index_next_so - 1), parent_block + "." + current_block + "." + current_so);
                    converted += `marker "ok${parent_block}.${current_block}"\n`;
                    current_block++;
                    i = index_next_so;
                }
            }
        } else {
            converted += splited[i] + "\n";
        }
    }
    return converted;
}

function flatArray(lines, start, end) {
    end++;
    var content = "";
    for (var i = start; i < end; i++) {
        content += lines[i] + "\n";
    }
    return content;
}

function getLogical(code) {
    var values = [];
    if (code.includes('(')) {
        values = sliceParenthesis(code);
    } else if (code.includes('"')) {
        values = slice(code);
    } else {
        values = code.split(" ");
    }
    switch (values[0]) {
        case "is":
            return values[1];
        default:
            return values[2];
    }
}

function findEndIs(code, index) {
    let so_count = 0;
    for (var i = index; i < code.length; i++) {
        var line = code[i].split(" ");
        if (line[0] == "is") {
            so_count++;
        } else if (line[0] == "ok") {
            so_count--;
        }
        if (so_count == 0) {
            return i;
        }
    }
    return -1;
}

function hasNextSo(code, index) {
    let so_count = 1;
    index++;
    for (var i = index; i < code.length; i++) {
        var line = code[i].split(" ");
        if (line[0] == "is") {
            so_count++;
        } else if (line[0] == "ok") {
            so_count--;
        }
        if ((line[0] == "so" || line[0] == "not") && so_count == 1) {
            return true;
        }
    }
    return false;
}

function indexNextSo(code, index) {
    let so_count = 1;
    index++;
    for (var i = index; i < code.length; i++) {
        var line = code[i].split(" ");
        if (line[0] == "is") {
            so_count++;
        } else if (line[0] == "ok") {
            so_count--;
        }
        if ((line[0] == "so" || line[0] == "not") && so_count == 1) {
            return i;
        } else if (line[0] == "ok" && so_count == 0) {
            return i;
        }
    }
    return -1;
}