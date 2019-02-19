import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { renderFile } from 'ejs';
import { exec } from 'child_process';

const port = 3000;

/**
 * 打开浏览器
 *
 */
function openBrowser() {
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

  exec(cmd + ' ' + url);
}

// openBrowser();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许跨域
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'one-key-ai-client/'));
  app.setBaseViewsDir(join(__dirname, '..', 'one-key-ai-client/')); // 放视图的文件
  app.engine('html', renderFile);
  app.set('view engine', 'html');

  // app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(port);
}
bootstrap();
