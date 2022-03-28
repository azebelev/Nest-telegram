import { Inject, Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { ITelegramOptions } from './telegram.interface';
import { TELEGRAM_MODULE_OPTIONS } from './telegram.const';

@Injectable()
export class TelegramService {

  bot: Telegraf;
  options: ITelegramOptions;

  constructor(@Inject(TELEGRAM_MODULE_OPTIONS) options: ITelegramOptions) {
    this.bot = new Telegraf(options.token);
    this.options = options;
  }
  //will send then new review will be created(review.controller)  
  async sendMessage(message: string, chatId: string = this.options.chatId) {

    await this.bot.telegram.sendMessage(chatId, message);
  }

}
