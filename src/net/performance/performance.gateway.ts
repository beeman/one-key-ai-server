import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { Subscription } from 'rxjs';

@WebSocketGateway()
export class PerformanceGateway implements OnGatewayInit {

  private readonly tag = PerformanceGateway.name;
  // private clientMap: Map<string, Subscription> = new Map<string, Subscription>(); // 客户端订阅集合

  constructor(private readonly performanceService: PerformanceService) {
  }

  afterInit(server:any) {
    this.performanceService.getData().subscribe((data) => {
      server.emit('topInfo', '' + data);
    });
  }

  // @SubscribeMessage('getMessage')
  // getMessage(client: any, payload: any) {
  //   // 若已向该客户的发送数据，则返回
  //   if (this.clientMap.has(client.id)) {
  //     Logger.log(`exist client: ${client.id}`, this.tag);
  //     return;
  //   }

  //   // 向客户端发送数据
  //   const sub = this.performanceService.getData().subscribe((data) => {
  //     client.emit('message', '' + data);
  //   });
  //   this.clientMap.set(client.id, sub);

  //   // 客户端断开连接时，停止发送数据
  //   client.on('disconnect', () => {
  //     this.deleteClient(client.id);
  //   });
  // }

  // @SubscribeMessage('stopGetMessage')
  // stopGetMessage(client: any, payload: any) {
  //   this.deleteClient(client.id);
  // }

  // private deleteClient(clientId: string): void {
  //   const sub = this.clientMap.get(clientId);
  //   if (sub) {
  //     Logger.log(`delete client: ${clientId}`, this.tag);
  //     sub.unsubscribe();
  //     this.clientMap.delete(clientId);
  //   }
  //   if (this.clientMap.size === 0) {
  //     this.performanceService.stopGetData();
  //   }
  // }
}
