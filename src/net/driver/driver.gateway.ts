import { SubscribeMessage, WebSocketGateway, OnGatewayInit } from '@nestjs/websockets';
import { DriverService } from './driver.service';

@WebSocketGateway()
export class DriverGateway {

  constructor(private readonly driverService: DriverService) { }

  @SubscribeMessage('driverDevices')
  getDriverDevices(client: any, payload: any) {
    return this.driverService.getDevices().subscribe(value => {
      client.emit('driverDevices', value);
    });
  }

  @SubscribeMessage('driverList')
  getDriverList(client: any, payload: any) {
    this.driverService.getList().subscribe(value => {
      client.emit('driverList', value);
    });
  }

  @SubscribeMessage('autoinstall')
  autoinstall(client: any, payload: any) {
    this.driverService.autoinstall().subscribe(value => {
      client.emit('autoinstall', value);
    });
  }
}
