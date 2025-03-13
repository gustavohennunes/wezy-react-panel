import { getData, setData } from '@/utils';

const AUTH_LOCAL_STORAGE_KEY = `${
  import.meta.env.VITE_APP_NAME
}-auth-v${import.meta.env.VITE_APP_VERSION}`;
const LOCAL_STORAGE_AUTH = 'auth-token';

const getAuthToken = () => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY);
    const localAuth = getData(LOCAL_STORAGE_AUTH);

    if (auth?.access_token) {
      return auth.access_token;
    } else if (localAuth) {
      return localAuth;
    } else {
      return null;
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE ERROR', error);
    return null;
  }
};

const setAuth = (auth) => {
  setData(AUTH_LOCAL_STORAGE_KEY, auth);
};

const setLocalAuth = (auth) => {
  setData(LOCAL_STORAGE_AUTH, auth);
};

const removeAuth = () => {
  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_AUTH);
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error);
  }
};

export function setupAxios(axios) {
  axios.defaults.headers.Accept = 'application/json';
  axios.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    async (err) => await Promise.reject(err)
  );
}

export {
  AUTH_LOCAL_STORAGE_KEY,
  getAuthToken,
  removeAuth,
  setAuth,
  setLocalAuth,
};
