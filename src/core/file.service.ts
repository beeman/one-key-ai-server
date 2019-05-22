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

@Injectable()
export class FileService {
    public mkUserDirs(userName: string) {
        return this.mkDirs(this.userDirsPath(userName));
    }

    public removeUserDirs(userName: string): void {
        this.removeDirs(this.userDirsPath(userName));
    }


    public userDirsPath(userName: string): string {
        return `${homedir()}/docker/projects/${userName}`;
    }

    public saveProject(userName: string, filePath: string, file: UploadFile) {
        return new Promise((resolve, reject) => {
            const wholePath = path.join(this.userDirsPath(userName), filePath);
            const parsedPath = path.parse(wholePath);
            this.mkDirs(parsedPath.dir)
                .then(() => {
                    fs.writeFile(wholePath, file.buffer, err => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                })
                .catch(reason => {
                    reject(reason);
                });
        });
    }

    private mkDirs(dirPath: string) {
        return new Promise((resolve, reject) => {
            fs.mkdir(dirPath, { recursive: true }, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private removeDirs(path: string) {
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach((file, index) => {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    this.removeDirs(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    }
}
