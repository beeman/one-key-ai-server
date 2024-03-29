import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { renderFile } from 'ejs';
import { SocketIOServer } from './core/socket-io-server';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

let port = 80;

// openBrowser(port);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许跨域
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'one-key-ai-client/'));
  app.useStaticAssets(join(homedir(), 'docker'));
  app.setBaseViewsDir(join(__dirname, '..', 'one-key-ai-client/')); // 放视图的文件
  // app.setBaseViewsDir(join(__dirname, '..', 'docker'));
  app.engine('html', renderFile);
  app.set('view engine', 'html');

  const data = fs.readFileSync(path.join(__dirname, 'assets/config.json'));
  const config = JSON.parse(data.toString());
  port = config.port ? config.port : port;
  // app.useWebSocketAdapter(new WsAdapter(app));

  SocketIOServer.getInstance().listen(app.getHttpServer());

  await app.listen(port);
}
bootstrap();
