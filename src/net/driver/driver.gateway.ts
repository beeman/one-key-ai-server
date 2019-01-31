import { SubscribeMessage, WebSocketGateway, OnGatewayInit } from '@nestjs/websockets';
import { DriverService } from './driver.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway()
export class DriverGateway implements OnGatewayInit {

  constructor(private readonly driverService: DriverService) { }

  afterInit(server: any): void {
  }

  @SubscribeMessage('getDriverDevices')
  async getDriverDevices(client: any, payload: any) {
    const result = await this.driverService.getDevices();
    client.emit('driverDevices', { data: result });
  }

  @SubscribeMessage('getDriverList')
  async getDriverList(client: any, payload: any) {
    const result = await this.driverService.getList();
    client.emit('driverList', { data: result });
  }

  @SubscribeMessage('autoinstall')
  async autoinstall(client: any, payload: any) {
    Logger.log('autoinstall');
    this.driverService.autoinstall();
  }
}
