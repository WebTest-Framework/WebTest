import * as vscode from 'vscode';
import * as path from 'path';
import * as lib from './lib';
import * as fs from 'fs';

var testFolderName = "";

class TreeItem extends vscode.TreeItem {
    children: TreeItem[]|undefined;
    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        this.children = children;
    }
}

export class TestCreator {
    commentTest(specPath: string, testToKeep: string) : void {
        var specFileContent = fs.readFileSync(specPath).toString();
        var splitFileContent : string[] = specFileContent.split("\n");
        for(let i = 0; i < splitFileContent.length; i ++) {
            if(splitFileContent[i].includes("it(") && 
                splitFileContent[i].includes("=>") &&
                !(splitFileContent[i].includes(testToKeep))) {
                splitFileContent[i] = splitFileContent[i].replace("it(", "xit(");
            }
        }
        var newContent = "";
        for(let i = 0; i < splitFileContent.length; i ++) {
            newContent += splitFileContent[i];
        }
        vscode.window.showInformationMessage(newContent);
        fs.writeFileSync(specPath, newContent, 'utf8');
    }

    uncommentTest(specPath: string) : void {
        var specFileContent = fs.readFileSync(specPath).toString();
        var splitFileContent : string[] = specFileContent.split("\n");
        for(let i = 0; i < splitFileContent.length; i ++) {
            if(splitFileContent[i].includes("xit(") && 
                splitFileContent[i].includes("=>")) {
                splitFileContent[i] = splitFileContent[i].replace("xit(","it(");
            }
        }
        var newContent = "";
        for(let i = 0; i < splitFileContent.length; i ++) {
            newContent += splitFileContent[i];
        }
        vscode.window.showInformationMessage(newContent);
        fs.writeFileSync(specPath, newContent, {encoding: 'utf-8'});
    }

    createSpecFile(itemId: string, specName: string, descName: string, testName: string) {
        var specContent = `describe("` + descName + `", () => {
    it('` + testName + `', async() => {
        // Auto generated spec code.
        // See readme docs to add more codes as auto generated code
    });
});`;
        // if(vscode.workspace.rootPath !== undefined) {
        // if(testFolderName !== itemId) {
            fs.writeFileSync(path.join(itemId, specName + ".js"), specContent, 'utf8');
        // } else {
        //         fs.writeFileSync(path.join(vscode.workspace.rootPath, itemId, specName + ".js"), specContent, 'utf8');
        // }
        // } else {
        //     vscode.window.showErrorMessage("No workspace opened");
        // }
    }
}

export interface TestStruct {
    testType : string[];
    specFiles : Map<string, string[]>;
    tests : Map<string,string[]>;
    specPath : Map<string, string>;
}

export class TestSuiteProvider implements vscode.TreeDataProvider<vscode.TreeItem>, TestStruct {
    data : TreeItem[] = [];
    testType : string[] = [];
    specFiles : Map<string, string[]> = new Map();
    tests : Map<string,string[]> = new Map();
    parTree: TreeItem[] = [];
    specPath : Map<string,string> = new Map();

    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(testFolderKey: string) {
        testFolderName = testFolderKey;
        this.onDidChangeTreeData(() => {
            this.data = this.getTestTree();
        });
        this.data = this.getTestTree();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: TreeItem): vscode.TreeItem|Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem|undefined): vscode.ProviderResult<TreeItem[]> {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
    
    getTestType() {
        if(vscode.workspace.rootPath !== undefined) {
            var testPath = path.join(vscode.workspace.rootPath, "/", testFolderName);
            if(fs.existsSync(testPath)) {
                var testFolder = fs.readdirSync(testPath);
                this.testType = testFolder;
            } else {
                vscode.window.showInformationMessage("No " + testFolderName + " directory found :(");
            }
        } else {
            vscode.window.showErrorMessage("No workspace opened");
        }
    }
    
    getSpecFiles() {
        if(vscode.workspace.rootPath !== undefined) {
            for(let i = 0; i < this.testType.length; i ++) {
                var specInTestDir = fs.readdirSync(vscode.workspace.rootPath + "/" + testFolderName + "/" + this.testType[i]);
                this.specFiles.set(this.testType[i], specInTestDir);
                for(let j = 0; j < specInTestDir.length; j ++) {
                    this.specPath.set(specInTestDir[j], vscode.workspace.rootPath + "/" + testFolderName + "/" + this.testType[i] + "/" + specInTestDir[j]);
                }
            }
        } else {
            vscode.window.showErrorMessage("No workspace opened");
        }
    }
    
    getTests() {
        for(let eachSpecFiles of this.specPath.values()) {
            this.tests.set(eachSpecFiles, this.getTestNames(eachSpecFiles));
        }
    }

    createId(specPath: string, tests: string) {
        var id = "";
        id = specPath + ";" + tests;
        return id;
    }

    getTestNames(specFilePath: string): string[] {
        var fileContent = fs.readFileSync(specFilePath).toString();
        var testName : string[] = [];
        for(let i = 0; i < fileContent.split('\n').length; i ++) {
          if(fileContent.split('\n')[i].trim().includes('it("')) {
            testName.push(fileContent.split('\n')[i].split("\"")[1]);
          } else if(fileContent.split('\n')[i].trim().includes('it(\'')) {
            testName.push(fileContent.split('\n')[i].split("\'")[1]);
          }
        }
        return testName;
    }

    getSpecName(specFilePath: string): string {
        var fileContent = fs.readFileSync(specFilePath).toString();
        var descName = "";
        var flag: boolean = false;
        for(let i = 0; i < fileContent.split('\n').length; i ++) {
          if(fileContent.split('\n')[i].trim().includes('describe')) {
            flag = true;
            descName = fileContent.split('\n')[i].split("\"")[1];
            break;
          }
        }
        return descName;
    }

    openFile(filePath: string) {
        if(vscode.workspace.rootPath !== undefined) {
            filePath = filePath.replace(/\\/g, "/");
            var setting: vscode.Uri = vscode.Uri.parse("file:" + filePath);
            vscode.workspace.openTextDocument(setting).then((a: vscode.TextDocument) => {
                vscode.window.showTextDocument(a, 1, false).then(e => {});
            }, (error: any) => {
                console.error(error);
                debugger;
            });
        } else {
            vscode.window.showErrorMessage("Unexpected error happened... Log a defect for this.");
        }
    }

    addSpecFile(itemId: string): any {
        let specOpt : vscode.InputBoxOptions = {
            prompt: "Enter spec name",
            placeHolder: "Spec name"
        };
        let descOpt : vscode.InputBoxOptions = {
            prompt: "This will appear in describe()",
            placeHolder: "Description name"
        };
        let testOpt : vscode.InputBoxOptions = {
            prompt: "This will appear in it()",
            placeHolder: "Test name"
        };
        vscode.window.showInputBox(specOpt).then(specName => {
            if(specName !== undefined && specName !== "") {
                vscode.window.showInputBox(descOpt).then(descName => {
                    if(descName !== undefined && descName !== "") {
                        vscode.window.showInputBox(testOpt).then(testName => {
                            if(testName !== undefined && testName !== "") {
                                var testCreator: TestCreator = new TestCreator();
                                testCreator.createSpecFile(itemId, specName, descName, testName);
                                if(vscode.workspace.rootPath !== undefined) {
                                    if(testFolderName === itemId) {
                                        var filePath = itemId + "\\" + specName + ".js";
                                        vscode.window.showInformationMessage("Added successfully");
                                        this.openFile(filePath);
                                    } else {
                                        var filePath = itemId + "\\" + specName + ".js";
                                        this.openFile(filePath);
                                    }
                                    return true;
                                } else {
                                    vscode.window.showInformationMessage("No workspace opened");
                                    return false;
                                }
                            } else {
                                vscode.window.showErrorMessage("No test name provided. Cannot create test");
                                return false;
                            }
                        });
                    } else {
                        vscode.window.showErrorMessage("No describe name provided. Cannot create test");
                        return false;
                    }
                });
            } else {
                vscode.window.showErrorMessage("No spec name provided. Cannot create test");
                return false;
            }
        });
    }

    removeSpecFile(filePath: string) {
        if(fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            vscode.window.showInformationMessage("Removed successfully");
        } else {
            vscode.window.showErrorMessage("File not found");
        }
    }
    
    getTestTree() {
        if(vscode.workspace.rootPath !== undefined) {
            var testTree: TreeItem[] = [];
            var rootFolderPath: string = path.join(vscode.workspace.rootPath, testFolderName);
            var testRootContent = fs.readdirSync(rootFolderPath);
            for(let i = 0; i < testRootContent.length; i ++) {
                var eachTestRootPath = path.join(rootFolderPath, testRootContent[i]);
                var testDir1: TreeItem[] = [];
                if(lib.isDirectory(eachTestRootPath)) {
                    var testDirContent1 = fs.readdirSync(eachTestRootPath);
                    for(let j = 0; j < testDirContent1.length; j ++) {
                        var eachTestPath1 = path.join(eachTestRootPath, testDirContent1[j]);
                        if(lib.isDirectory(eachTestPath1)) {
                            var testDir2: TreeItem[] = [];
                            var testDirContent2 = fs.readdirSync(eachTestPath1);
                            for(let k = 0; k < testDirContent2.length; k ++) {
                                var eachTestPath2 = path.join(eachTestPath1, testDirContent2[k]);
                                if(lib.isDirectory(eachTestPath2)) {
                                    //Not yet implemented
                                } else {
                                    var testNames = this.getTestNames(eachTestPath2);
                                    var testNamesTree: TreeItem[] = [];
                                    for(let a = 0; a < testNames.length; a ++) {
                                        var eachTestName = new TreeItem(testNames[a]);
                                        eachTestName.contextValue = "tests";
                                        eachTestName.id = this.createId(eachTestPath2, testNames[a]);
                                        eachTestName.iconPath = {
                                            light: path.join(__dirname, "/../icons/tests.png"),
                                            dark: path.join(__dirname, "/../icons/tests.png")
                                        };
                                        testNamesTree.push(eachTestName);
                                    }
                                    var testDirTests2: TreeItem = new TreeItem(testDirContent2[k], testNamesTree);
                                    testDirTests2.id = this.createId(eachTestPath2, testDirContent2[k]);
                                    testDirTests2.contextValue = "testSpec";
                                    testDir2.push(testDirTests2);
                                }
                            }
                            var dir1Tree: TreeItem = new TreeItem(testDirContent1[j], testDir2);
                            dir1Tree.id = eachTestPath1;
                            dir1Tree.contextValue = "testType";
                            testDir1.push(dir1Tree);
                        } else {
                            var testNames = this.getTestNames(eachTestPath1);
                            var testNamesTree: TreeItem[] = [];
                            for(let a = 0; a < testNames.length; a ++) {
                                var eachTestName = new TreeItem(testNames[a]);
                                eachTestName.contextValue = "tests";
                                eachTestName.id = this.createId(eachTestPath1, testNames[a]);
                                eachTestName.iconPath = {
                                    light: path.join(__dirname, "/../icons/tests.png"),
                                    dark: path.join(__dirname, "/../icons/tests.png")
                                };
                                testNamesTree.push(eachTestName);
                            }
                            var rootTests = new TreeItem(testDirContent1[j], testNamesTree);
                            rootTests.id = this.createId(eachTestPath1, testDirContent1[j]);
                            rootTests.contextValue = "testSpec";
                            testDir1.push(rootTests);
                        }
                    }
                    var testDir1Tree = new TreeItem(testRootContent[i], testDir1);
                    testDir1Tree.id = eachTestRootPath;
                    testDir1Tree.contextValue = "testType";
                    testTree = testTree.concat(testDir1Tree);
                } else {
                    var testNames = this.getTestNames(eachTestRootPath);
                    var testNamesTree: TreeItem[] = [];
                    for(let a = 0; a < testNames.length; a ++) {
                        var eachTestName = new TreeItem(testNames[a]);
                        eachTestName.contextValue = "tests";
                        eachTestName.id = this.createId(eachTestRootPath, testNames[a]);
                        eachTestName.iconPath = {
                            light: path.join(__dirname, "/../icons/tests.png"),
                            dark: path.join(__dirname, "/../icons/tests.png")
                        };
                        testNamesTree.push(eachTestName);
                    }
                    var rootTests = new TreeItem(testRootContent[i], testNamesTree);
                    rootTests.contextValue = "testSpec";
                    rootTests.id = this.createId(eachTestRootPath,testRootContent[i]);
                    testTree = testTree.concat(rootTests);
                }
            }
            return testTree;
        } else {
            return [];
        }
    }
}