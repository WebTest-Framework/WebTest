import * as fs from 'fs';
import * as path from 'path';

export function isDirectory(dirPath: string): boolean {
    if(fs.lstatSync(dirPath).isDirectory()) {
        return true;
    } else {
        return false;
    }
}

export function stringDiff(diffMe: string, diffBy: string) { 
    return diffMe.split(diffBy).join('');
}

export function getJSONObj(targetData: any[], sourceData: any) {
    if(Array.isArray(sourceData)) {

    } else {

    }
}