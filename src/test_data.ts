import * as vscode from 'vscode';
import * as path from 'path';
import * as lib from './lib';
import * as fs from 'fs';

class TreeItem extends vscode.TreeItem {
    children: TreeItem[]|undefined;
    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        this.children = children;
    }
}

export class DataArray {
    dataKey: string = "";
    dataValue: string = "";

    constructor(dataKey: string, dataValue: string) {
        this.dataKey = dataKey;
        this.dataValue = dataValue;
    }
}

export class TestData implements vscode.TreeDataProvider<vscode.TreeItem> {
    data : TreeItem[] = [];
    parTree: TreeItem[] = [];
    dataFileArr: string[] = [];
    config: any = "";
    dataType: string = "";

    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(config: any) {
        this.config = config;
        if(config.TestDataPath !== undefined) {
            this.onDidChangeTreeData(() => {
                this.parTree = [];
                this.data = this.getTestTree();
            });
            this.data = this.getTestTree();
        } else {
            vscode.window.showErrorMessage("Test data path not found. Refer readme file for more information");
        }
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

    getTestTree() {
        if(vscode.workspace.rootPath !== undefined) {
            var testTree: TreeItem[] = [];
            var rootFolderPath: string = path.join(vscode.workspace.rootPath, this.config.TestDataPath);
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
                                    var testDirTests2: TreeItem = new TreeItem(testDirContent2[k]);
                                    testDirTests2.contextValue = "testDataSpec";
                                    testDirTests2.id = eachTestPath2;
                                    testDir2.push(testDirTests2);
                                }
                            }
                            var dir1Tree: TreeItem = new TreeItem(testDirContent1[j], testDir2);
                            dir1Tree.id = eachTestPath1;
                            dir1Tree.contextValue = "dataType";
                            testDir1.push(dir1Tree);
                        } else {
                            var rootTests = new TreeItem(testDirContent1[j]);
                            rootTests.id = eachTestPath1;
                            rootTests.contextValue = "testDataSpec";
                            testDir1.push(rootTests);
                        }
                    }
                    var testDir1Tree = new TreeItem(testRootContent[i], testDir1);
                    testDir1Tree.id = eachTestRootPath;
                    testDir1Tree.contextValue = "dataType";
                    testTree = testTree.concat(testDir1Tree);
                } else {
                    var rootTests = new TreeItem(testRootContent[i]);
                    rootTests.contextValue = "testDataSpec";
                    rootTests.id = eachTestRootPath;
                    testTree = testTree.concat(rootTests);
                }
            }
            return testTree;
        } else {
            return [];
        }
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

    createSpecFile(itemId: string, dataFileName: string) {
        var specContent = `[
    {
    }
]`;
        if(vscode.workspace.rootPath !== undefined) {
            fs.writeFileSync(path.join(itemId, dataFileName), specContent, 'utf8');
        } else {
            vscode.window.showErrorMessage("No workspace opened");
        }
    }

    addDataFile(itemId: string): any {
        let dataFileNameOpt : vscode.InputBoxOptions = {
            prompt: "Data file name with extension",
            placeHolder: "File Name.json"
        };
        vscode.window.showInputBox(dataFileNameOpt).then(dataFileName => {
            if(dataFileName !== undefined && dataFileName !== "") {
                if(vscode.workspace.rootPath) {
                    var filePath = itemId + "\\" + dataFileName;
                    this.createSpecFile(itemId, dataFileName);
                    this.openFile(filePath);
                    vscode.window.showInformationMessage("Do you want to open test data hub?", "No", "Yes").then(selection => {
                        if(selection === "Yes") {
                            if(itemId !== undefined) {
                                vscode.commands.executeCommand("react-webview.start");
                            } else {
                                vscode.window.showInformationMessage("Unexpected error happened... Log a defect for this.");
                            }
                        }
                    });
                }
                return true;
            } else {
                vscode.window.showErrorMessage("No file name provided. Cannot create data sheet");
                return false;
            }
        });
    }

    getDataHub(dataPath: string) {
        this.dataType = dataPath.split("\\")[dataPath.split("\\").length - 1];
        var dataArr: DataArray[] = [];
        this.dataFileArr = fs.readdirSync(dataPath);
        for(let i = 0; i < this.dataFileArr.length; i ++) {
            var dataFullPath = dataPath + "\\" + this.dataFileArr[i];
            if(fs.lstatSync(dataFullPath).isFile()) {
                var data = require(dataFullPath);
                var dataKeys = Object.keys(data[0]);
                for(let j = 0; j < dataKeys.length; j ++) {
                    dataArr.push(new DataArray(dataKeys[j], data[0][dataKeys[j]]));
                }
            }
        }
        return dataArr;
    }

    getDataHubListHtml(dataArray: DataArray[]) {
        var dataHtml = "";
        for(let i = 0; i < dataArray.length; i ++) {
            dataHtml += `<tr>
            <td>` + dataArray[i].dataKey + `</td>
            <td>` + dataArray[i].dataValue + `</td>
          </tr>\n`;
        }
        return dataHtml;
    }

    getDataHubHtml(dataPath: string) {
        var dataArray = this.getDataHub(dataPath);
        return `<!DOCTYPE html>
        <html>
          <head>
            <title>Bootstrap Example</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
          </head>
          <body>
            <nav class="navbar navbar-default" style="height: 4em;">
              <div class="navbar-header">
              <div style="display: inline;
              position: absolute;
              width: max-content;">
              <embed type="image/webp" style="    width: 10%;
              position: relative;
              left: 1%;" src="https://cdn3.iconfinder.com/data/icons/data-visualization-3/64/network-hub-correlation-data-visualisation-512.png">
                <div style="display: inline;
                width: max-content;
                position: absolute;
                left: 10%;"><a class="navbar-brand">Data Hub</a></div>
              </div>
              </nav>
        
              <p style="text-align: center;">
                <span><b>Data Type : </b>` + this.dataType + `</span>
                <span><b>Total Data Files : </b>` + this.dataFileArr.length + `</span>
              </p>
              <div class="container">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Data Key</th>
                      <th>Data Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    ` + this.getDataHubListHtml(dataArray) + `
                  </tbody>
                </table>
              </div>
          </body>
        </html>`;
    }
}

/**
 * Manages react webview panels
 */
export class ReactPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: ReactPanel | undefined;

	private static readonly viewType = 'react';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];

	public static createOrShow(extensionPath: string) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

		// If we already have a panel, show it.
		// Otherwise, create a new panel.
		if (ReactPanel.currentPanel) {
			ReactPanel.currentPanel._panel.reveal(column);
		} else {
			ReactPanel.currentPanel = new ReactPanel(extensionPath, column || vscode.ViewColumn.Three);
		}
	}

	private constructor(extensionPath: string, column: vscode.ViewColumn) {
		this._extensionPath = extensionPath;

		// Create and show a new webview panel
		this._panel = vscode.window.createWebviewPanel(ReactPanel.viewType, "Test Data Hub", column, {
			// Enable javascript in the webview
			enableScripts: true,

			// And restric the webview to only loading content from our extension's `media` directory.
			localResourceRoots: [
				vscode.Uri.file(path.join(this._extensionPath, 'build'))
			]
		});
		
		// Set the webview's initial html content 
		this._panel.webview.html = this._getHtmlForWebview();

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'alert':
					vscode.window.showErrorMessage(message.text);
					return;
			}
		}, null, this._disposables);
	}

	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}

	public dispose() {
		ReactPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _getHtmlForWebview() {
		const manifest = require(path.join(this._extensionPath, 'build', 'asset-manifest.json'));
		const mainScript = manifest['main.js'];
		const mainStyle = manifest['main.css'];
        const manifestPath = vscode.Uri.file(path.join(this._extensionPath, 'build', 'asset-manifest.json'));
		const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'build', mainScript));
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
		const stylePathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'build', mainStyle));
		const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return `
        <!doctype html>
        <html lang="en">
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
            <meta name="theme-color" content="#000000">
            <link rel="manifest" href="${manifestPath}">
            <link rel="shortcut icon" href="/favicon.ico">
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
            <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
            <title>React App</title>
            <link href="${styleUri}" rel="stylesheet">
        </head>
        <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
	}
}

function getNonce() {
	let text = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}