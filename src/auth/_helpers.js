import { getData, setData } from "@/utils";
const AUTH_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}-auth-v${import.meta.env.VITE_APP_VERSION}`;
const LOCAL_STORAGE_AUTH = `auth-token`;
// TODO limpar funções antigas de auth
const getAuth = () => {
  try {
    const auth = getData(AUTH_LOCAL_STORAGE_KEY);
    const LocalAuth = getData(LOCAL_STORAGE_AUTH);
    if (auth) {
      return auth;
    } else if (LocalAuth) {
      return LocalAuth;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
  }
};
const getLocalAuth = () => {
  try {
    const auth = getData(LOCAL_STORAGE_AUTH);
    if (auth) {
      return auth;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error("AUTH LOCAL STORAGE PARSE ERROR", error);
  }
};
const setAuth = (auth) => {
  setData(AUTH_LOCAL_STORAGE_KEY, auth);
};
const setLocalAuth = (auth) => {
  setData(LOCAL_STORAGE_AUTH, auth);
};
const removeAuth = () => {
  if (!localStorage) {
    return;
  }
  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_STORAGE_AUTH);
  } catch (error) {
    console.error("AUTH LOCAL STORAGE REMOVE ERROR", error);
  }
};
export function setupAxios(axios) {
  axios.defaults.headers.Accept = "application/json";
  axios.interceptors.request.use(
    (config) => {
      const auth = getAuth();
      const localAuth = getLocalAuth();
      if (auth?.access_token) {
        config.headers.Authorization = `Bearer ${auth.access_token}`;
      }
      if (localAuth) {
        config.headers.Authorization = `Bearer ${localAuth}`;
      }
      return config;
    },
    async (err) => await Promise.reject(err),
  );
}
export {
  AUTH_LOCAL_STORAGE_KEY,
  getAuth,
  getLocalAuth,
  removeAuth,
  setAuth,
  setLocalAuth,
};
