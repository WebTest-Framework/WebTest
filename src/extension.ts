import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as lib from './lib';
import {TestSuiteProvider} from './testSuiteprovider';
import {Environment} from './environment';
import {TestData, ReactPanel} from './test_data';

var testFolderName = "";

export function activate(context: vscode.ExtensionContext) {
    if(fs.existsSync(vscode.workspace.rootPath + '/.vscode/webtest-config.json')) {
        const config = require(vscode.workspace.rootPath + '/.vscode/webtest-config.json');
        testFolderName = config.TestFolderName;
        var testSuiteProvider = new TestSuiteProvider(testFolderName);
        vscode.window.registerTreeDataProvider("testSuiteprovider", testSuiteProvider);

        var environmentProvider = new Environment(config);
        vscode.window.registerTreeDataProvider("envManager", environmentProvider);

        var testDataProvider = new TestData(config);
        vscode.window.registerTreeDataProvider("testDataProvider", testDataProvider);
        vscode.commands.registerCommand('api.start', () => {
            if(vscode.workspace.rootPath !== undefined) {
                var terminal = vscode.window.createTerminal();
                terminal.hide();
                var command = path.join(context.extensionPath, "/out/api/api.js -path=" + vscode.workspace.rootPath);
                terminal.sendText("node " + command);
            } else {
                vscode.window.showErrorMessage("No workspace opened");
            }
        });
        vscode.commands.registerCommand('testDataUI.start', () => {
            vscode.commands.executeCommand('api.start');
            ReactPanel.createOrShow(context.extensionPath);
        });
        vscode.commands.registerCommand("testSuiteprovider.runTest", (item: vscode.TreeItem) => {
            let terminal: vscode.Terminal;
            if(vscode.window.terminals.length !== 0) {
                terminal = vscode.window.terminals[0];
            } else {
                terminal = vscode.window.createTerminal();
            }
            terminal.show();
            if(item.id !== undefined && vscode.workspace.rootPath !== undefined) {
                var specFilePath = item.id.split(";")[0];
                var command = "npx wdio wdio.conf.js";
                if(config.RunCommandOptions !== undefined) {
                    for(let i = 0 ; i < config.RunCommandOptions.length; i ++) {
                        command += " " + config.RunCommandOptions[i];
                    }
                }
                command += " --spec=." + lib.stringDiff(specFilePath, vscode.workspace.rootPath);
                terminal.sendText(command);
            }
        });
        vscode.commands.registerCommand("testSuiteprovider.openFile", (item: vscode.TreeItem) => {
            if(item.id !== undefined && vscode.workspace.rootPath !== undefined) {
                var filePath = item.id.split(';')[0];
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
        });
        vscode.commands.registerCommand("testSuiteprovider.refresh", (item: vscode.TreeItem) => {
            testSuiteProvider.refresh();
        });
        vscode.commands.registerCommand("testSuiteprovider.addSpec", (item: vscode.TreeItem) => {
            if(item.id !== undefined) {
                testSuiteProvider.addSpecFile(item.id);
                testSuiteProvider.refresh();
            } else {
                vscode.window.showInformationMessage("Unexpected error happened... Log a defect for this.");
            }
        });
        vscode.commands.registerCommand("testSuiteprovider.removeSpec", (item: vscode.TreeItem) => {
            vscode.window.showInformationMessage("Are you sure you want to remove?", "No", "Yes").then(selection => {
                if(selection === "Yes") {
                    if(item.id !== undefined) {
                        var filePath = item.id.split(';')[0];
                        testSuiteProvider.removeSpecFile(decodeURI(filePath));
                        testSuiteProvider.refresh();
                    } else {
                        vscode.window.showInformationMessage("Unexpected error happened... Log a defect for this.");
                    }
                }
            });
        });
        vscode.commands.registerCommand("environment.envRefresh", (item: vscode.TreeItem) => {
            environmentProvider.refresh();
        });
        vscode.commands.registerCommand("environment.open", (item: vscode.TreeItem) => {
            if(vscode.workspace.rootPath !== undefined && config.Environment !== undefined) {
                // Create and show panel
                const panel = vscode.window.createWebviewPanel(
                    'Available Test Data',
                    'Available Test Data',
                    vscode.ViewColumn.Nine,
                    {enableScripts: true}
                );
                // And set its HTML content
                panel.webview.html = environmentProvider.openEnvironmentView();
            } else {
                vscode.window.showErrorMessage("Unexpected error happened... Log a defect for this.");
            }
        });
        vscode.commands.registerCommand("testData.refresh", (item: vscode.TreeItem) => {
           testDataProvider.refresh(); 
        });
        vscode.commands.registerCommand("testData.addData", (item: vscode.TreeItem) => {
            if(item.id !== undefined) {
                // Calls command: react-webview.start in it
                testDataProvider.addDataFile(item.id);
                testDataProvider.refresh();
            } else {
                vscode.window.showInformationMessage("Unexpected error happened... Log a defect for this.");
            }
        });
        vscode.commands.registerCommand("testData.removeData", (item: vscode.TreeItem) => {
            vscode.window.showInformationMessage("Are you sure you want to remove?", "No", "Yes").then(selection => {
                if(selection === "Yes") {
                    if(item.id !== undefined) {
                        var filePath = item.id.split(';')[0];
                        testSuiteProvider.removeSpecFile(decodeURI(filePath));
                        testDataProvider.refresh();
                    } else {
                        vscode.window.showInformationMessage("Unexpected error happened... Log a defect for this.");
                    }
                }
            });
        });
        vscode.commands.registerCommand("testData.openFile", (item: vscode.TreeItem) => {
            if(item.id !== undefined && vscode.workspace.rootPath !== undefined) {
                var filePath = item.id;
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
        });
        vscode.commands.registerCommand("testData.openDataHub", (item: vscode.TreeItem) => {
            vscode.commands.executeCommand('api.start');
            ReactPanel.createOrShow(context.extensionPath);
        });
        vscode.commands.registerCommand("testSuiteprovider.openTestData", (item: vscode.TreeItem) => {
            if(item.id !== undefined && vscode.workspace.rootPath !== undefined) {
                var itemName = item.id.split(';')[1];
                var filePath = path.join(vscode.workspace.rootPath, config.TestDataPath, config.CurrentSubDataFolder, itemName + ".json");
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
        });
    } else {
        vscode.window.showInformationMessage("Config file not found. Please create config as per the readme provided");
    }
}