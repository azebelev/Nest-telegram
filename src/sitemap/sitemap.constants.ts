import { TopLevelCategory } from '../top-page/top-page.model';
type rootMapType = Record<TopLevelCategory, string>;

export const CATEGORY_URL: rootMapType = {
  0: '/courses',
  1: '/services',
  2: '/books',
  3: '/products'
};