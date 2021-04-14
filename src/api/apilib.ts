import * as fs from 'fs';
import { exists } from 'node:fs';
import * as path from 'path';

var rootPath: any = process.argv[2].split('=')[1];
var config: any = require(path.join(rootPath, ".vscode", "webtest-config.json"));
var dataPath: string = path.join(rootPath, config["TestDataPath"], config["CurrentSubDataFolder"]);
var baseDataPath: string = path.join(rootPath, config["TestDataPath"]);

export class DataArray {
    dataKey: string = "";
    dataValue: string[] = [];

    constructor(dataKey: string, dataValue: string) {
        this.dataKey = dataKey;
        this.dataValue.push(dataValue);
    }
}

export function storeInHub(dataElements: DataArray[]|DataArray) {
    fs.writeFileSync(path.join(rootPath, ".vscode", "HubData.json"), JSON.stringify(dataElements, null, 4));
}

export function getTestData() {
    var dataArray: DataArray[] = [];
    var dirContents = fs.readdirSync(dataPath);
    var dataArrayKeys: string[] = [];
    if(fs.existsSync(path.join(rootPath, ".vscode", "HubData.json"))) {
        dataArray = JSON.parse(fs.readFileSync(path.join(rootPath, ".vscode", "HubData.json")).toString());
    } else {
        for(let eachDirContent of dirContents) {
            var fullDataPath = path.join(dataPath, eachDirContent);
            if(fs.lstatSync(fullDataPath).isFile() && eachDirContent.split('.')[1].toLocaleLowerCase() === "json") {
                var dataInFile = require(fullDataPath);
                if(Array.isArray(dataInFile)) {
                    for(let eachArrData of dataInFile) {
                        var keyFound = false;
                        var valueFound = false;
                        var dataInFileKeys = Object.keys(eachArrData);
                        if(dataArray.length === 0) {
                            for(let eachFileDataKeys of dataInFileKeys) {
                                dataArrayKeys.push(eachFileDataKeys);
                                dataArray.push(new DataArray(eachFileDataKeys, eachArrData[eachFileDataKeys]));
                            }
                        }
                        for(let eachFileDataKeys of dataInFileKeys) {
                            if(dataArrayKeys.includes(eachFileDataKeys)) {
                                keyFound = true;
                            }
                            if(keyFound) {
                                for(let i = 0; i < dataArray.length; i ++) {
                                    if(eachFileDataKeys === dataArray[i].dataKey) {
                                        var existingData = dataArray[i].dataValue;
                                        var valueInFileKey = eachArrData[eachFileDataKeys];
                                        if(Array.isArray(valueInFileKey)) {
                                            for(let eachValueInFileKey of valueInFileKey) {
                                                if(existingData.includes(eachValueInFileKey)) {
                                                } else {
                                                    existingData.push(eachValueInFileKey);
                                                }
                                            }
                                            dataArray[i].dataValue = existingData;
                                        } else {
                                            if(existingData.includes(valueInFileKey)) {
                                            } else {
                                                existingData.push(valueInFileKey);
                                            }
                                        }
                                    }
                                }
                            } else {
                                dataArrayKeys.push(eachFileDataKeys);
                                dataArray.push(new DataArray(eachFileDataKeys, eachArrData[eachFileDataKeys]));
                            }
                        }
                    }
                } else {
                    console.log("Not an array");
                }
            } else {
                console.log("Directory detected : " + eachDirContent);
            }
        }
        storeInHub(dataArray);
    }
    return dataArray;
}

export function searchTestData(searchEntity: string) {
    var availableTestData: DataArray[] = getTestData();
    var searchedTestData: DataArray[] = [];
    for(let i = 0; i < availableTestData.length; i ++) {
        if(availableTestData[i].dataKey.toLocaleLowerCase().includes(searchEntity.toLocaleLowerCase())) {
            searchedTestData.push(availableTestData[i]);
        }
    }
    return searchedTestData;
}

export function isSubTypePresent() {
    var dirContent = fs.readdirSync(baseDataPath);
    for(let i = 0; i < dirContent.length; i ++) {
        if(fs.lstatSync(path.join(baseDataPath, dirContent[i])).isDirectory()) {
            return true;
        }
    }
    return false;
}

export function getSubTypes() {
    var response = {
        subType: [""],
        isSubPresent: false
    };
    response.subType.pop();
    var dirContent = fs.readdirSync(baseDataPath);
    for(let i = 0; i < dirContent.length; i ++) {
        if(fs.lstatSync(path.join(baseDataPath, dirContent[i])).isDirectory()) {
            response.isSubPresent = true;
            break;
        }
    }
    if(isSubTypePresent()) {
        var dirContent = fs.readdirSync(baseDataPath);
        for(let i = 0; i < dirContent.length; i ++) {
            if(fs.lstatSync(path.join(baseDataPath, dirContent[i])).isDirectory()) {
                response.subType.push(dirContent[i]);
            }
        }
    }
    return response;
}

export function getTestDataFiles(subDir: string) {
    var testDirPath: string = path.join(baseDataPath, subDir);
    var dirContent = fs.readdirSync(testDirPath);
    var fileList: string[] = [];
    for(let i = 0; i < dirContent.length; i ++) {
        if(fs.lstatSync(path.join(testDirPath, dirContent[i]))) {
            fileList.push(dirContent[i]);
        }
    }
    return fileList;
}

class SaveDataPayLoad {
    subDataType: string = "";
    testDataFileName: string = "";
    dataJson: string = "";
}

class AddNewKeyPayload {
    data: any;
}

export function saveTestData(payload: SaveDataPayLoad) {
    var requestBody = {
        subDataType: payload.subDataType,
        testDataFileName: payload.testDataFileName,
        dataJson: payload.dataJson
    };
    var response = {
        success: false,
        code: 0,
        error: {
            message: ""
        },
        data: [],
        existingKeys: [""],
        message: "",
    };
    try {
        var pathToFile: string = path.join(baseDataPath, requestBody.subDataType, requestBody.testDataFileName);
        var dataInFile = JSON.parse(fs.readFileSync(pathToFile).toString());
        var incomingKeys = Object.keys(JSON.parse(requestBody.dataJson));
        response.existingKeys = [];
        var flag: boolean = false;
        if(!Array.isArray(dataInFile)) {
            for(let eachIncKeys of incomingKeys) {
                if(Object.keys(dataInFile).includes(eachIncKeys)) {
                response.existingKeys.push(eachIncKeys);
                } else {
                    dataInFile.push(JSON.parse(requestBody.dataJson));
                }
            }
        } else {
            for(let eachIncKeys of incomingKeys) {
                var curKey = "";
                for(let i = 0; i < dataInFile.length; i ++) {
                    curKey = eachIncKeys;
                    if(Object.keys(dataInFile[i]).includes(eachIncKeys)) {
                        flag = true;
                        break;
                    } 
                }
                if(flag) {
                    response.existingKeys.push(curKey);
                } else {
                    dataInFile.push(JSON.parse("{\"" + curKey + "\": \"" + JSON.parse(requestBody.dataJson)[curKey] + "\"}"));
                }
            }
        }
        fs.writeFileSync(pathToFile, "");
        fs.writeFileSync(pathToFile, JSON.stringify(dataInFile, null, 4));
        response.success = true;
        if(response.existingKeys.length === 0) {
            response.message = "Successfully updated";
        } else {
            response.message = "One or more keys already exists in the file. Rest is updated";
        }
        response.code = 200;
    } catch(error) {
        response.success = false;
        response.error.message = error.message;
        response.code = 500;
    }
    return response;
}

export function addNewKey(payload: AddNewKeyPayload) {
    var requestBody = JSON.parse(payload.data);
    
    var pathToFile = path.join(rootPath, ".vscode", "HubData.json");
    var response = {
        success: false,
        code: 0,
        error: {
            message: ""
        },
        data: [],
        existingKeys: [""],
        message: "",
    };
    response.existingKeys = [];
    var existingData = JSON.parse(fs.readFileSync(pathToFile).toString());
    if(Array.isArray(existingData)) {
        var incomingKeys = Object.keys(requestBody);
        for(let i = 0; i < incomingKeys.length; i ++) {
            var flag: boolean = false;
            var curKey = incomingKeys[i];
            for(let eachExisting of existingData) {
                if(eachExisting.dataKey === incomingKeys[i]) {
                    flag = true;
                    break;
                }
            }
            if(flag) {
                response.existingKeys.push(curKey);
            } else {
                var format = {
                    dataKey: curKey,
                    dataValue: [requestBody[curKey]]
                };
                existingData.push(format);
            }
        }
    } else {
        var incomingKeys = Object.keys(requestBody);
        for(let i = 0; i < incomingKeys.length; i ++) {
            var flag: boolean = false;
            var curKey = incomingKeys[i];
            if(Object.keys(existingData).includes(incomingKeys[i])) {
                response.existingKeys.push(curKey);
            } else {
                var format = {
                    dataKey: curKey,
                    dataValue: [requestBody[curKey]]
                };
                existingData.push(format);
            }
        }
    }
    fs.writeFileSync(pathToFile, "");
    fs.writeFileSync(pathToFile, JSON.stringify(existingData, null, 4));
    response.success = true;
    if(response.existingKeys.length === 0) {
        response.code = 201;
        response.message = "Successfully updated";
    } else {
        response.message = "One or more keys already exists in the file. Rest is updated";
        response.code = 200;
    }
    existingData = null;
    return response;
}