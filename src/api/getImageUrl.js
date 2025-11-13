export let ImagePath;

(function (ImagePath) {
  ImagePath['TESTAMENTS'] = 'testaments';
  ImagePath['USERS'] = 'users';
  ImagePath['ECOMMERCE'] = 'e-commerce';
  ImagePath['PROFILE'] = 'profile';
  ImagePath['BLOG'] = 'blog';
})(ImagePath || (ImagePath = {}));

// ==============================|| NEW URL - GET IMAGE URL ||============================== //

export function getImageUrl(path) {
  const serverBaseUrl = import.meta.env.VITE_APP_API_URL;
  return `${serverBaseUrl}uploads/${path}`;
}
