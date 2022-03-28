import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TopPageService } from '../top-page/top-page.service';
import { format, subDays } from 'date-fns';
import { Builder } from 'xml2js';
import { CATEGORY_URL } from './sitemap.constants';

@Controller('sitemap')
export class SitemapController {

  domain: string;

  constructor(
    private readonly topPageService: TopPageService,
    private readonly configService: ConfigService) {
    this.domain = configService.get('DOMAIN') ?? '';
  }

  @Get('xml')
  @Header('content-type', 'text/xml')
  async sitemap() {
    const formatString = 'yyyy-MM-dd\'T\'HH:mm:00.000xxx';
    const res = [
      {
        log: this.domain,
        lastmod: format(subDays(new Date(), 1), formatString),
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        log: `${this.domain}/courses`,
        lastmod: format(subDays(new Date(), 1), formatString),
        changefreq: 'daily',
        priority: '1.0'
      }

    ];

    const pages = await this.topPageService.findAllSeo();
    res.concat(pages.map(page => {

      return {
        log: `${this.domain}${CATEGORY_URL[page.firstCategory]}/${page.alias}`,
        lastmod: format(new Date(page.updatedAt ?? new Date()), formatString),
        changefreq: 'weekly',
        priority: '0.7'
      };
    }));

    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF' }
    });

    return builder.buildObject({
      urlset: {
        $: {
          xmlns: 'http://www.sitemaps.org/schemas/schemas/sitemap/0.9'
        },
        url: res
      }
    });
  }

}
