import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { Subscription } from 'rxjs';

@WebSocketGateway()
export class PerformanceGateway implements OnGatewayInit {

  private readonly tag = PerformanceGateway.name;

  constructor(private readonly performanceService: PerformanceService) {
  }

  afterInit(server: any) {
    this.performanceService.getData().subscribe((data) => {
      server.emit('topInfo', data);
    });
  }
}
