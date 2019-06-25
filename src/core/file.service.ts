import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { homedir } from 'os';
import * as path from 'path';

interface UploadFile {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer: Buffer,
    size: number
}

interface FileNode {
    title?: string;
    key?: string;
    isLeaf?: boolean;
    children?: FileNode[];
}

@Injectable()
export class FileService {
    public mkUserDirs(userName: string) {
        return this.mkDirsSync(this.userDirsPath(userName));
    }

    public removeUserDirs(userName: string): void {
        this.removeDir(this.userDirsPath(userName));
    }

    public readUserProjects(userName: string) {
        return this.readFiles(this.userDirsPath(userName));
    }

    public readFiles(dirPath: string) {
        let result: FileNode[] = [];
        const files = fs.readdirSync(dirPath);
        files.forEach(value => {
            const childPath = path.join(dirPath, value);
            const stats = fs.statSync(childPath);
            const child: FileNode = {};
            child.title = path.parse(childPath).base;
            child.key = childPath;
            if (stats.isDirectory()) {
                child.isLeaf = false;
                child.children = [];
            } else {
                child.isLeaf = true;
            }
            result.push(child);
        });

        return result;
    }

    public readFilesRecursive(dirPath: string) {
        let result: FileNode[] = [];
        this.readFileList(dirPath, result);
        return result;
    }

    public readUserProjectRecursive(userName: string) {
        const userPath = this.userDirsPath(userName);
        let result: FileNode[] = [];
        this.readFileList(userPath, result);
        return result;
    }

    public removeFile(path: string) {
        fs.unlinkSync(path);
    }

    public removeDir(path: string) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    this.removeDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }

    public dockerRootPath(): string {
        return `${homedir()}/docker`;
    }

    public userDirsPath(userName: string): string {
        return `${this.dockerRootPath()}/projects/${userName}`;
    }

    public saveAbsoluteFile(absolutePath: string, file: UploadFile) {
        const parsedPath = path.parse(absolutePath);
        this.mkDirsSync(parsedPath.dir);
        fs.writeFileSync(absolutePath, file.buffer);
    }

    public saveFile(userName: string, filePath: string, file: UploadFile) {
        const absolutePath = path.join(this.userDirsPath(userName), filePath);
        this.saveAbsoluteFile(absolutePath, file);
    }

    private mkDirsSync(dirPath: string) {
        if (fs.existsSync(dirPath)) {
            return;
        }
        const parentPath = path.parse(dirPath).dir;
        this.mkDirsSync(parentPath);
        fs.mkdirSync(dirPath);
    }

    private readFileList(filePath: string, result: FileNode[]) {
        const files = fs.readdirSync(filePath);
        files.forEach((value, index) => {
            const childPath = path.join(filePath, value);
            const stats = fs.statSync(childPath);
            const child: FileNode = {};
            child.title = path.parse(childPath).base;
            child.key = childPath;
            if (stats.isDirectory()) {
                child.isLeaf = false;
                child.children = [];
                this.readFileList(childPath, child.children);
            } else {
                child.isLeaf = true;
            }
            result.push(child);
        });
    }
}
