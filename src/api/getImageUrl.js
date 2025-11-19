export let ImagePath;

(function (ImagePath) {
  ImagePath['TESTAMENTS'] = 'testaments';
  ImagePath['USERS'] = 'users';
  ImagePath['ECOMMERCE'] = 'e-commerce';
  ImagePath['PROFILE'] = 'profile';
  ImagePath['BLOG'] = 'blog';
})(ImagePath || (ImagePath = {}));

import { BASE_URL } from 'api/axios';

// ==============================|| NEW URL - GET IMAGE URL ||============================== //

export function getImageUrl(path) {
  const serverBaseUrl = BASE_URL;
  return `${serverBaseUrl}/uploads/${path}`;
}
