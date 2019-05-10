import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { renderFile } from 'ejs';
import { SocketIOServer } from './core/socket-io-server';


const port = 3000;

// openBrowser(port);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许跨域
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'one-key-ai-client/'));
  app.setBaseViewsDir(join(__dirname, '..', 'one-key-ai-client/')); // 放视图的文件
  app.engine('html', renderFile);
  app.set('view engine', 'html');

  // app.useWebSocketAdapter(new WsAdapter(app));

  SocketIOServer.getInstance().listen(app.getHttpServer());

  await app.listen(port);
}
bootstrap();
