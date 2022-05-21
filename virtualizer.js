//add virtual objects in json array
//convert virtual objects in line-code strings
var json_data = { name: "test", age: 0, friends: [{ name: "alice", age: 0 }, { name: "john", age: 0 }] };
var url_data = "http://www.test.com/test.html?user=carlos&age=20";
var objects = [];
var id_index_counter = 0;
var code_residue = "";
addObject("global", "global", "");

function addObject(type, name, container, variable_template = "") {
    var properties = {
        border: "",
        width: "",
        height: "",
        round: "",
        font: "",
        color: "",
        background: "",
        gradient: "",
        shadow: "",
        left: "",
        top: "",
        align: "",
        margin: "",
        for_: variable_template
    };
    objects.push({ name: name, type: type, properties: properties, value: "", container: container }); //, for_: variable_template });
}

function changeVariable(name, value) {
    if (!elementExist(name)) {
        addObject("variable", name, "");
    }
    changeProperty(name, "value", value);
}

function elementExist(name) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].name == name) {
            return true;
        }
    }
    return false;
}

function deleteObject(name) {
    var index = -1;
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].name == name) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        objects.splice(index, 1);
    }
}

function changeProperty(obj_name, obj_property, property_value) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].name == obj_name) {
            objects[i].properties[obj_property] = `"${property_value}"`;
            break;
        }
    }
}

function getProperty(obj_name, obj_property) {
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].name == obj_name) {
            return objects[i].properties[obj_property];
        }
    }
}

function objectsToString() {
    var code = "";
    for (var i = 0; i < objects.length; i++) {
        if (objects[i].type != "template" && objects[i].type != "variable") {
            code += `add ${objects[i].type} ${objects[i].name} to ${objects[i].container}\n`;
        } else {
            if (objects[i].type == "template") {
                code += `add ${objects[i].type} ${objects[i].name} to ${objects[i].container} for ${objects[i].properties.for_}\n`;
            }
        }
        for (var k in objects[i].properties) {
            if (objects[i].properties[k] != "") {
                if (objects[i].type != "variable") {
                    if (k != "for_") {
                        code += `set ${k} ${objects[i].properties[k]} to ${objects[i].name}\n`;
                    }
                } else {
                    if (k == "value") {
                        code += `set ${objects[i].properties[k]} to ${objects[i].name}\n`;
                    }
                }

            }
        }
    }
    return code;
}

function changeDefaultUnit(unit, global) {
    for (var i = 1; i < objects.length; i++) {
        objects[i].properties["width"] = unit == "1" ? (objects[i].properties["width"].includes("px") ? objects[i].properties["width"] : (toFloat(objects[i].properties["width"]) * (global.width / 0.026458) * 0.001) + "px") : (objects[i].properties["width"].includes("%") ? objects[i].properties["width"] : ((toFloat(objects[i].properties["width"]) / ((global.width / 0.026458) * 0.1)) * 100) + "%");
        objects[i].properties["height"] = unit == "1" ? (objects[i].properties["height"].includes("px") ? objects[i].properties["height"] : (toFloat(objects[i].properties["height"]) * (global.height / 0.026458) * 0.001) + "px") : (objects[i].properties["height"].includes("%") ? objects[i].properties["height"] : ((toFloat(objects[i].properties["height"]) / ((global.height / 0.026458) * 0.1)) * 100) + "%");
        objects[i].properties["left"] = unit == "1" ? (objects[i].properties["left"].includes("px") ? objects[i].properties["left"] : (toFloat(objects[i].properties["left"]) * (global.width / 0.026458) * 0.001) + "px") : (objects[i].properties["left"].includes("%") ? objects[i].properties["left"] : ((toFloat(objects[i].properties["left"]) / ((global.width / 0.026458) * 0.1)) * 100) + "%");
        objects[i].properties["top"] = unit == "1" ? (objects[i].properties["top"].includes("px") ? objects[i].properties["top"] : (toFloat(objects[i].properties["top"]) * (global.height / 0.026458) * 0.001) + "px") : (objects[i].properties["top"].includes("%") ? objects[i].properties["top"] : ((toFloat(objects[i].properties["top"]) / ((global.height / 0.026458) * 0.1)) * 100) + "%");
    }
}

function toFloat(value) {
    return parseFloat(value.replace("px", "").replace("%", "").replaceAll('"', ''));
}