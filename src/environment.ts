import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'process';
import { type } from 'os';

class TreeItem extends vscode.TreeItem {
    children: TreeItem[]|undefined;
    constructor(label: string, children?: TreeItem[]) {
        super(
            label,
            children === undefined ? vscode.TreeItemCollapsibleState.None : vscode.TreeItemCollapsibleState.Collapsed);
        this.children = children;
    }
}

export class Environment implements vscode.TreeDataProvider<vscode.TreeItem> {
    data : TreeItem[] = [];
    environmentPath: string = "";

    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined> = new vscode.EventEmitter<TreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(config: any) {
        if(config.Environment !== undefined) {
            this.environmentPath = config.Environment;
            this.onDidChangeTreeData(() => {
                this.data = this.getEnvironmentView(config.Environment);
            });
            this.data = this.getEnvironmentView(config.Environment);
        } else {
            vscode.window.showErrorMessage("Environment config not found. Please refer readme doc to add environment config");
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

    getEnvironmentView(envPath: string): TreeItem[] {
        if(vscode.workspace.rootPath !== undefined) {
            var environmentData: string = fs.readFileSync(path.join(vscode.workspace.rootPath, envPath)).toString();
            var envTree: TreeItem[] = [];
            try{
                var envData = JSON.parse(environmentData)[0];
                var envKeys: string[] = Object.keys(envData);
                for(let i = 0; i < envKeys.length; i ++) {
                    // var envType = Object.keys(envData[i]);
                    var envTreeItem = new TreeItem(envKeys[i]);
                    envTree.push(envTreeItem);
                }
            } catch {
                vscode.window.showErrorMessage("Environment file format is invalid. Please check readme docs");
            }
            return envTree;
        } else {
            vscode.window.showErrorMessage("No workspace opened");
            return [];
        }
    }

    getEnvData() {
        var dataHtml = "";
        for(let i = 0; i < this.getEnvironments().length; i ++) {
            dataHtml += `<div>
            <h3 id="envTitle">` + this.getEnvironments()[i] + `</h3>
          </div>
          <div>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Environment Key</th>
                  <th>Environment Value</th>
                </tr>
              </thead>
              <tbody>
                ` + this.getRow(this.getEnvironments()[i]) + `
              </tbody>
            </table>
          </div>`;
        }
        return dataHtml;
    }

    getRow(envKey: string) {
        var rowHtml = "";
        if(vscode.workspace.rootPath !== undefined) {
            var environmentData: string = fs.readFileSync(path.join(vscode.workspace.rootPath, this.environmentPath)).toString();
            var envData = JSON.parse(environmentData)[0];
            for(let i = 0; i < Object.keys(envData).length; i ++) {
                if(Object.keys(envData)[i] === envKey) {
                    var envVal = Object.keys(envData[envKey]);
                    for(let j = 0; j < envVal.length; j ++) {
                        rowHtml += `<tr>
                                <td>` + envVal[j] + `</td>
                                <td>` + envData[envKey][envVal[j]] + `</td>
                                </tr>`;
                    }
                }
            }
        }
        return rowHtml;
    }

    getEnvironments() {
        if(vscode.workspace.rootPath !== undefined) {
            var environmentData: string = fs.readFileSync(path.join(vscode.workspace.rootPath, this.environmentPath)).toString();
            var envData = JSON.parse(environmentData);
            return Object.keys(envData[0]);
        } else {
            vscode.window.showErrorMessage("No workspace opened");
            return [];
        }
    }

    openEnvironmentView(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Bootstrap Example</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
          <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        </head>
        <body>
        
        <nav class="navbar navbar-default">
        <div class="navbar-header">
        <div style="display: inline;
        position: absolute;
        width: max-content;"><img style="width: 21%;
      position: relative;
      left: 1%;" src="data:image/png;base64,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"></div>
        <div style="display: inline;
        width: max-content;
        position: absolute;
        left: 5%;"><a class="navbar-brand">Environment Manager</a></div>
      </div>
        </nav>
          
        <div class="container">
        ` + this.getEnvData() + `
        </div>
        
        </body>
        </html>`;
    }
}