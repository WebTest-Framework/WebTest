import * as fs from 'fs';
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
//modify path for vscode
export function getTestData() {
    var dataArr: DataArray[] = [];
    var dataFileArr = fs.readdirSync(dataPath);
    // to iterate amonf the files found
    for(let i = 0; i < dataFileArr.length; i ++) {
        var dataFullPath = dataPath + "\\" + dataFileArr[i];
        if(fs.lstatSync(dataFullPath).isFile()) {
            var data = require(dataFullPath);
            if(Array.isArray(data)) {
                // To iterate among array if the data in file is array type
                for(let j = 0; j < data.length; j ++) {
                    var dataKeys = Object.keys(data[j]);
                    var isFound = false;
                    // To iterate among the data keys found in the file
                    for(let k = 0; k < dataKeys.length; k ++) {
                        // To iterate among the stored hub data
                        for(let l = 0; l < dataArr.length; l ++) {
                            if(dataArr[l].dataKey === dataKeys[k]) {
                                var isDataFound = false;
                                // If stored data is array type
                                if(Array.isArray(dataArr[l].dataValue)) {
                                    // To iterate among the values of data if stored in array
                                    for(let m = 0; m < dataArr[l].dataValue.length; m ++) {
                                        // If already stored, go for neext iteration
                                        if(dataArr[l].dataValue[m] === data[j][dataKeys[k]]) {
                                            isDataFound = true;
                                            break;
                                        }
                                    }
                                    // If the data is not present, store it
                                    if(!isDataFound) {
                                        dataArr[l].dataValue.push(data[j][dataKeys[k]]);
                                        isFound = true;
                                        break;
                                    }
                                }
                            }
                        }
                        if(!isFound) {
                            dataArr.push(new DataArray(dataKeys[k], data[j][dataKeys[k]]));
                        }
                    }
                }
            }
        }
    }
    return dataArr;
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
            response.subType.push(dirContent[i]);
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
        message: "",
    };
    try {
        var pathToFile: string = path.join(baseDataPath, requestBody.subDataType, requestBody.testDataFileName);
        var dataInFile = JSON.parse(fs.readFileSync(pathToFile).toString());
        dataInFile.push(JSON.parse(requestBody.dataJson));
        fs.writeFileSync(pathToFile, "");
        fs.writeFileSync(pathToFile, JSON.stringify(dataInFile, null, 4));
        response.success = true;
        response.message = "Successfully updated";
        response.code = 200;
    } catch(error) {
        response.success = false;
        response.error.message = error.message;
        response.code = 500;
    }
    return response;
}

export function getTD() {
    var dataArr: any[] = [];
    var filesInBaseDataPath = fs.readdirSync(baseDataPath);
    for(let i = 0; i < filesInBaseDataPath.length; i ++) {
        var eachFilesBaseDataPath = path.join(baseDataPath, filesInBaseDataPath[i]);
        if(fs.lstatSync(eachFilesBaseDataPath).isFile()) {
            var dataInEachFiles = require(eachFilesBaseDataPath);
            dataArr.push(dataInEachFiles);
        } else {
            var subTDFiles = fs.readdirSync(eachFilesBaseDataPath);
            for(let j = 0; j < subTDFiles.length; j ++) {
                var eachSubTDFile = path.join(eachFilesBaseDataPath, subTDFiles[j]);
                if(fs.lstatSync(eachSubTDFile).isFile()) {
                    var eachDataInSub = require(eachSubTDFile);
                    dataArr.push(eachDataInSub);
                }
            }
        }
    }
    return dataArr;
}

console.log(getTD());
