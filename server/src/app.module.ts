import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ImageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
