import { exec, ExecException } from "child_process";

/**
 * 打开浏览器
 *
 */
export function openBrowser(port: number) {
    const url = `http://localhost:${port}`;
    let cmd = '';

    switch (process.platform) {
        case 'win32':
            cmd = 'start';
            break;
        case 'linux':
            cmd = 'xdg-open';
            break;
        case 'darwin':
            cmd = 'open';
            break;
        default: break;
    }

    // 查看$HOME位置
    exec(`echo $HOME`, (error: ExecException, stdout: string, stderr: string) => {
        if (stdout) {
            const home = stdout.trim();
            const dirName = home.split('/').pop();

            // 查看$HOME所属用户
            exec(`sudo ls -l ${home}/.. | grep ${dirName}`, (error: ExecException, stdout: string, stderr: string) => {
                if (stdout) {
                    const user = stdout.trim().split(new RegExp(' +'))[2];

                    // 打开浏览器
                    exec(`sudo -u ${user} ${cmd} ${url}`);
                }
            });
        }
    });
}
