(function(factory) {
  typeof define === "function" && define.amd ? define(factory) : factory();
})(function() {
  "use strict";
  /*! Capacitor: https://capacitorjs.com/ - MIT License */
  const createCapacitorPlatforms = (win) => {
    const defaultPlatformMap = /* @__PURE__ */ new Map();
    defaultPlatformMap.set("web", { name: "web" });
    const capPlatforms = win.CapacitorPlatforms || {
      currentPlatform: { name: "web" },
      platforms: defaultPlatformMap
    };
    const addPlatform = (name, platform) => {
      capPlatforms.platforms.set(name, platform);
    };
    const setPlatform = (name) => {
      if (capPlatforms.platforms.has(name)) {
        capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
      }
    };
    capPlatforms.addPlatform = addPlatform;
    capPlatforms.setPlatform = setPlatform;
    return capPlatforms;
  };
  const initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win);
  const CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  CapacitorPlatforms.addPlatform;
  CapacitorPlatforms.setPlatform;
  var ExceptionCode;
  (function(ExceptionCode2) {
    ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
    ExceptionCode2["Unavailable"] = "UNAVAILABLE";
  })(ExceptionCode || (ExceptionCode = {}));
  class CapacitorException extends Error {
    constructor(message, code, data) {
      super(message);
      this.message = message;
      this.code = code;
      this.data = data;
    }
  }
  const getPlatformId = (win) => {
    var _a, _b;
    if (win === null || win === void 0 ? void 0 : win.androidBridge) {
      return "android";
    } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
      return "ios";
    } else {
      return "web";
    }
  };
  const createCapacitor = (win) => {
    var _a, _b, _c, _d, _e;
    const capCustomPlatform = win.CapacitorCustomPlatform || null;
    const cap = win.Capacitor || {};
    const Plugins = cap.Plugins = cap.Plugins || {};
    const capPlatforms = win.CapacitorPlatforms;
    const defaultGetPlatform = () => {
      return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
    };
    const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
    const defaultIsNativePlatform = () => getPlatform() !== "web";
    const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
    const defaultIsPluginAvailable = (pluginName) => {
      const plugin = registeredPlugins.get(pluginName);
      if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
        return true;
      }
      if (getPluginHeader(pluginName)) {
        return true;
      }
      return false;
    };
    const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) || defaultIsPluginAvailable;
    const defaultGetPluginHeader = (pluginName) => {
      var _a2;
      return (_a2 = cap.PluginHeaders) === null || _a2 === void 0 ? void 0 : _a2.find((h) => h.name === pluginName);
    };
    const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
    const handleError = (err) => win.console.error(err);
    const pluginMethodNoop = (_target, prop, pluginName) => {
      return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
    };
    const registeredPlugins = /* @__PURE__ */ new Map();
    const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
      const registeredPlugin = registeredPlugins.get(pluginName);
      if (registeredPlugin) {
        console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
        return registeredPlugin.proxy;
      }
      const platform = getPlatform();
      const pluginHeader = getPluginHeader(pluginName);
      let jsImplementation;
      const loadPluginImplementation = async () => {
        if (!jsImplementation && platform in jsImplementations) {
          jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
        } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
          jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
        }
        return jsImplementation;
      };
      const createPluginMethod = (impl, prop) => {
        var _a2, _b2;
        if (pluginHeader) {
          const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
          if (methodHeader) {
            if (methodHeader.rtype === "promise") {
              return (options) => cap.nativePromise(pluginName, prop.toString(), options);
            } else {
              return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
            }
          } else if (impl) {
            return (_a2 = impl[prop]) === null || _a2 === void 0 ? void 0 : _a2.bind(impl);
          }
        } else if (impl) {
          return (_b2 = impl[prop]) === null || _b2 === void 0 ? void 0 : _b2.bind(impl);
        } else {
          throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
        }
      };
      const createPluginMethodWrapper = (prop) => {
        let remove;
        const wrapper = (...args) => {
          const p = loadPluginImplementation().then((impl) => {
            const fn = createPluginMethod(impl, prop);
            if (fn) {
              const p2 = fn(...args);
              remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
              return p2;
            } else {
              throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          });
          if (prop === "addListener") {
            p.remove = async () => remove();
          }
          return p;
        };
        wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
        Object.defineProperty(wrapper, "name", {
          value: prop,
          writable: false,
          configurable: false
        });
        return wrapper;
      };
      const addListener = createPluginMethodWrapper("addListener");
      const removeListener = createPluginMethodWrapper("removeListener");
      const addListenerNative = (eventName, callback) => {
        const call = addListener({ eventName }, callback);
        const remove = async () => {
          const callbackId = await call;
          removeListener({
            eventName,
            callbackId
          }, callback);
        };
        const p = new Promise((resolve2) => call.then(() => resolve2({ remove })));
        p.remove = async () => {
          console.warn(`Using addListener() without 'await' is deprecated.`);
          await remove();
        };
        return p;
      };
      const proxy = new Proxy({}, {
        get(_, prop) {
          switch (prop) {
            case "$$typeof":
              return void 0;
            case "toJSON":
              return () => ({});
            case "addListener":
              return pluginHeader ? addListenerNative : addListener;
            case "removeListener":
              return removeListener;
            default:
              return createPluginMethodWrapper(prop);
          }
        }
      });
      Plugins[pluginName] = proxy;
      registeredPlugins.set(pluginName, {
        name: pluginName,
        proxy,
        platforms: /* @__PURE__ */ new Set([
          ...Object.keys(jsImplementations),
          ...pluginHeader ? [platform] : []
        ])
      });
      return proxy;
    };
    const registerPlugin2 = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
    if (!cap.convertFileSrc) {
      cap.convertFileSrc = (filePath) => filePath;
    }
    cap.getPlatform = getPlatform;
    cap.handleError = handleError;
    cap.isNativePlatform = isNativePlatform;
    cap.isPluginAvailable = isPluginAvailable;
    cap.pluginMethodNoop = pluginMethodNoop;
    cap.registerPlugin = registerPlugin2;
    cap.Exception = CapacitorException;
    cap.DEBUG = !!cap.DEBUG;
    cap.isLoggingEnabled = !!cap.isLoggingEnabled;
    cap.platform = cap.getPlatform();
    cap.isNative = cap.isNativePlatform();
    return cap;
  };
  const initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
  const Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
  const registerPlugin = Capacitor.registerPlugin;
  Capacitor.Plugins;
  class WebPlugin {
    constructor(config) {
      this.listeners = {};
      this.windowListeners = {};
      if (config) {
        console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
        this.config = config;
      }
    }
    addListener(eventName, listenerFunc) {
      const listeners = this.listeners[eventName];
      if (!listeners) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(listenerFunc);
      const windowListener = this.windowListeners[eventName];
      if (windowListener && !windowListener.registered) {
        this.addWindowListener(windowListener);
      }
      const remove = async () => this.removeListener(eventName, listenerFunc);
      const p = Promise.resolve({ remove });
      Object.defineProperty(p, "remove", {
        value: async () => {
          console.warn(`Using addListener() without 'await' is deprecated.`);
          await remove();
        }
      });
      return p;
    }
    async removeAllListeners() {
      this.listeners = {};
      for (const listener in this.windowListeners) {
        this.removeWindowListener(this.windowListeners[listener]);
      }
      this.windowListeners = {};
    }
    notifyListeners(eventName, data) {
      const listeners = this.listeners[eventName];
      if (listeners) {
        listeners.forEach((listener) => listener(data));
      }
    }
    hasListeners(eventName) {
      return !!this.listeners[eventName].length;
    }
    registerWindowListener(windowEventName, pluginEventName) {
      this.windowListeners[pluginEventName] = {
        registered: false,
        windowEventName,
        pluginEventName,
        handler: (event) => {
          this.notifyListeners(pluginEventName, event);
        }
      };
    }
    unimplemented(msg = "not implemented") {
      return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
    }
    unavailable(msg = "not available") {
      return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
    }
    async removeListener(eventName, listenerFunc) {
      const listeners = this.listeners[eventName];
      if (!listeners) {
        return;
      }
      const index = listeners.indexOf(listenerFunc);
      this.listeners[eventName].splice(index, 1);
      if (!this.listeners[eventName].length) {
        this.removeWindowListener(this.windowListeners[eventName]);
      }
    }
    addWindowListener(handle) {
      window.addEventListener(handle.windowEventName, handle.handler);
      handle.registered = true;
    }
    removeWindowListener(handle) {
      if (!handle) {
        return;
      }
      window.removeEventListener(handle.windowEventName, handle.handler);
      handle.registered = false;
    }
  }
  const encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
  const decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
  class CapacitorCookiesPluginWeb extends WebPlugin {
    async getCookies() {
      const cookies = document.cookie;
      const cookieMap = {};
      cookies.split(";").forEach((cookie) => {
        if (cookie.length <= 0)
          return;
        let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
        key = decode(key).trim();
        value = decode(value).trim();
        cookieMap[key] = value;
      });
      return cookieMap;
    }
    async setCookie(options) {
      try {
        const encodedKey = encode(options.key);
        const encodedValue = encode(options.value);
        const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
        const path = (options.path || "/").replace("path=", "");
        const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
        document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
      } catch (error) {
        return Promise.reject(error);
      }
    }
    async deleteCookie(options) {
      try {
        document.cookie = `${options.key}=; Max-Age=0`;
      } catch (error) {
        return Promise.reject(error);
      }
    }
    async clearCookies() {
      try {
        const cookies = document.cookie.split(";") || [];
        for (const cookie of cookies) {
          document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
        }
      } catch (error) {
        return Promise.reject(error);
      }
    }
    async clearAllCookies() {
      try {
        await this.clearCookies();
      } catch (error) {
        return Promise.reject(error);
      }
    }
  }
  registerPlugin("CapacitorCookies", {
    web: () => new CapacitorCookiesPluginWeb()
  });
  const readBlobAsBase64 = async (blob) => new Promise((resolve2, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result;
      resolve2(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
  const normalizeHttpHeaders = (headers = {}) => {
    const originalKeys = Object.keys(headers);
    const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
    const normalized = loweredKeys.reduce((acc, key, index) => {
      acc[key] = headers[originalKeys[index]];
      return acc;
    }, {});
    return normalized;
  };
  const buildUrlParams = (params, shouldEncode = true) => {
    if (!params)
      return null;
    const output = Object.entries(params).reduce((accumulator, entry) => {
      const [key, value] = entry;
      let encodedValue;
      let item;
      if (Array.isArray(value)) {
        item = "";
        value.forEach((str) => {
          encodedValue = shouldEncode ? encodeURIComponent(str) : str;
          item += `${key}=${encodedValue}&`;
        });
        item.slice(0, -1);
      } else {
        encodedValue = shouldEncode ? encodeURIComponent(value) : value;
        item = `${key}=${encodedValue}`;
      }
      return `${accumulator}&${item}`;
    }, "");
    return output.substr(1);
  };
  const buildRequestInit = (options, extra = {}) => {
    const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
    const headers = normalizeHttpHeaders(options.headers);
    const type = headers["content-type"] || "";
    if (typeof options.data === "string") {
      output.body = options.data;
    } else if (type.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(options.data || {})) {
        params.set(key, value);
      }
      output.body = params.toString();
    } else if (type.includes("multipart/form-data")) {
      const form = new FormData();
      if (options.data instanceof FormData) {
        options.data.forEach((value, key) => {
          form.append(key, value);
        });
      } else {
        for (const key of Object.keys(options.data)) {
          form.append(key, options.data[key]);
        }
      }
      output.body = form;
      const headers2 = new Headers(output.headers);
      headers2.delete("content-type");
      output.headers = headers2;
    } else if (type.includes("application/json") || typeof options.data === "object") {
      output.body = JSON.stringify(options.data);
    }
    return output;
  };
  class CapacitorHttpPluginWeb extends WebPlugin {
    /**
     * Perform an Http request given a set of options
     * @param options Options to build the HTTP request
     */
    async request(options) {
      const requestInit = buildRequestInit(options, options.webFetchExtra);
      const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
      const url = urlParams ? `${options.url}?${urlParams}` : options.url;
      const response = await fetch(url, requestInit);
      const contentType = response.headers.get("content-type") || "";
      let { responseType = "text" } = response.ok ? options : {};
      if (contentType.includes("application/json")) {
        responseType = "json";
      }
      let data;
      let blob;
      switch (responseType) {
        case "arraybuffer":
        case "blob":
          blob = await response.blob();
          data = await readBlobAsBase64(blob);
          break;
        case "json":
          data = await response.json();
          break;
        case "document":
        case "text":
        default:
          data = await response.text();
      }
      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return {
        data,
        headers,
        status: response.status,
        url: response.url
      };
    }
    /**
     * Perform an Http GET request given a set of options
     * @param options Options to build the HTTP request
     */
    async get(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
    }
    /**
     * Perform an Http POST request given a set of options
     * @param options Options to build the HTTP request
     */
    async post(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
    }
    /**
     * Perform an Http PUT request given a set of options
     * @param options Options to build the HTTP request
     */
    async put(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
    }
    /**
     * Perform an Http PATCH request given a set of options
     * @param options Options to build the HTTP request
     */
    async patch(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
    }
    /**
     * Perform an Http DELETE request given a set of options
     * @param options Options to build the HTTP request
     */
    async delete(options) {
      return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
    }
  }
  registerPlugin("CapacitorHttp", {
    web: () => new CapacitorHttpPluginWeb()
  });
  const App = registerPlugin("App", {
    web: () => Promise.resolve().then(() => web$d).then((m) => new m.AppWeb())
  });
  const PushNotifications = registerPlugin("PushNotifications", {});
  var CameraSource;
  (function(CameraSource2) {
    CameraSource2["Prompt"] = "PROMPT";
    CameraSource2["Camera"] = "CAMERA";
    CameraSource2["Photos"] = "PHOTOS";
  })(CameraSource || (CameraSource = {}));
  var CameraDirection;
  (function(CameraDirection2) {
    CameraDirection2["Rear"] = "REAR";
    CameraDirection2["Front"] = "FRONT";
  })(CameraDirection || (CameraDirection = {}));
  var CameraResultType;
  (function(CameraResultType2) {
    CameraResultType2["Uri"] = "uri";
    CameraResultType2["Base64"] = "base64";
    CameraResultType2["DataUrl"] = "dataUrl";
  })(CameraResultType || (CameraResultType = {}));
  const Camera$1 = registerPlugin("Camera", {
    web: () => Promise.resolve().then(() => web$c).then((m) => new m.CameraWeb())
  });
  const Dialog = registerPlugin("Dialog", {
    web: () => Promise.resolve().then(() => web$b).then((m) => new m.DialogWeb())
  });
  const Browser$1 = registerPlugin("Browser", {
    web: () => Promise.resolve().then(() => web$a).then((m) => new m.BrowserWeb())
  });
  const Device = registerPlugin("Device", {
    web: () => Promise.resolve().then(() => web$9).then((m) => new m.DeviceWeb())
  });
  var Directory;
  (function(Directory2) {
    Directory2["Documents"] = "DOCUMENTS";
    Directory2["Data"] = "DATA";
    Directory2["Library"] = "LIBRARY";
    Directory2["Cache"] = "CACHE";
    Directory2["External"] = "EXTERNAL";
    Directory2["ExternalStorage"] = "EXTERNAL_STORAGE";
  })(Directory || (Directory = {}));
  var Encoding;
  (function(Encoding2) {
    Encoding2["UTF8"] = "utf8";
    Encoding2["ASCII"] = "ascii";
    Encoding2["UTF16"] = "utf16";
  })(Encoding || (Encoding = {}));
  const Filesystem = registerPlugin("Filesystem", {
    web: () => Promise.resolve().then(() => web$8).then((m) => new m.FilesystemWeb())
  });
  const Geolocation$1 = registerPlugin("Geolocation", {
    web: () => Promise.resolve().then(() => web$7).then((m) => new m.GeolocationWeb())
  });
  var ImpactStyle;
  (function(ImpactStyle2) {
    ImpactStyle2["Heavy"] = "HEAVY";
    ImpactStyle2["Medium"] = "MEDIUM";
    ImpactStyle2["Light"] = "LIGHT";
  })(ImpactStyle || (ImpactStyle = {}));
  var NotificationType;
  (function(NotificationType2) {
    NotificationType2["Success"] = "SUCCESS";
    NotificationType2["Warning"] = "WARNING";
    NotificationType2["Error"] = "ERROR";
  })(NotificationType || (NotificationType = {}));
  const Haptics = registerPlugin("Haptics", {
    web: () => Promise.resolve().then(() => web$6).then((m) => new m.HapticsWeb())
  });
  var KeyboardStyle;
  (function(KeyboardStyle2) {
    KeyboardStyle2["Dark"] = "DARK";
    KeyboardStyle2["Light"] = "LIGHT";
    KeyboardStyle2["Default"] = "DEFAULT";
  })(KeyboardStyle || (KeyboardStyle = {}));
  var KeyboardResize;
  (function(KeyboardResize2) {
    KeyboardResize2["Body"] = "body";
    KeyboardResize2["Ionic"] = "ionic";
    KeyboardResize2["Native"] = "native";
    KeyboardResize2["None"] = "none";
  })(KeyboardResize || (KeyboardResize = {}));
  const Keyboard = registerPlugin("Keyboard");
  const ScreenOrientation = registerPlugin("ScreenOrientation", {
    web: () => Promise.resolve().then(() => web$5).then((m) => new m.ScreenOrientationWeb())
  });
  const Share = registerPlugin("Share", {
    web: () => Promise.resolve().then(() => web$4).then((m) => new m.ShareWeb())
  });
  const SplashScreen = registerPlugin("SplashScreen", {
    web: () => Promise.resolve().then(() => web$3).then((m) => new m.SplashScreenWeb())
  });
  var Style;
  (function(Style2) {
    Style2["Dark"] = "DARK";
    Style2["Light"] = "LIGHT";
    Style2["Default"] = "DEFAULT";
  })(Style || (Style = {}));
  var Animation;
  (function(Animation2) {
    Animation2["None"] = "NONE";
    Animation2["Slide"] = "SLIDE";
    Animation2["Fade"] = "FADE";
  })(Animation || (Animation = {}));
  const StatusBar = registerPlugin("StatusBar");
  const Toast = registerPlugin("Toast", {
    web: () => Promise.resolve().then(() => web$2).then((m) => new m.ToastWeb())
  });
  const AppLauncher = registerPlugin("AppLauncher", {
    web: () => Promise.resolve().then(() => web$1).then((m) => new m.AppLauncherWeb())
  });
  var Weekday;
  (function(Weekday2) {
    Weekday2[Weekday2["Sunday"] = 1] = "Sunday";
    Weekday2[Weekday2["Monday"] = 2] = "Monday";
    Weekday2[Weekday2["Tuesday"] = 3] = "Tuesday";
    Weekday2[Weekday2["Wednesday"] = 4] = "Wednesday";
    Weekday2[Weekday2["Thursday"] = 5] = "Thursday";
    Weekday2[Weekday2["Friday"] = 6] = "Friday";
    Weekday2[Weekday2["Saturday"] = 7] = "Saturday";
  })(Weekday || (Weekday = {}));
  const LocalNotifications = registerPlugin("LocalNotifications", {
    web: () => Promise.resolve().then(() => web).then((m) => new m.LocalNotificationsWeb())
  });
  window.CapacitorBridge = {
    App
  };
  window.CapacitorBridge.pushNotificatonToken = "";
  if (Capacitor.isNativePlatform()) {
    console.log("I'm a native app!");
  } else {
    console.log("I'm a PWA or Web app!");
  }
  window.CapacitorBridge.registerPushNotification = function() {
    PushNotifications.requestPermissions().then((result) => {
      console.log("requestPermissions!");
      if (result.receive === "granted") {
        PushNotifications.register();
      }
    });
    PushNotifications.addListener(
      "registration",
      (token) => {
        window.CapacitorBridge.pushNotificatonToken = token.value;
        alert("Push registration success, token: " + token.value);
      }
    );
    PushNotifications.addListener(
      "registrationError",
      (error) => {
        alert("Error on registration: " + JSON.stringify(error));
      }
    );
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        alert("Push received: " + JSON.stringify(notification));
      }
    );
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (notification) => {
        alert("Push action performed: " + JSON.stringify(notification));
      }
    );
  };
  window.CapacitorBridge.sendTestPushNotification = function() {
    if (!window.CapacitorBridge.pushNotificatonToken) {
      console.log("尚未註冊推播!");
    }
    const apiUrl = "https://fcm.googleapis.com/fcm/send";
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `key=AAAAKWlcCNg:APA91bGBMqIoyrCv9xtlYFi760aSBoKWaGqLGXhmN_wYmjCemliEJ2HxaBhFm5fpWAW0R_vwb8BIXqCiicgwC5NyeDlblwAH9CcQeTt8iyjE_4jA9WaElITvW7lDxLXcNHuotaZu8JO9`
    };
    const postData = {
      "to": window.CapacitorBridge.pushNotificatonToken,
      "priority": "high",
      "notification": {
        "title": "FCM Message",
        "body": "測試firebase 訊息推播"
      },
      "data": {
        "demo_key": "測試firebase 資料推播"
      }
    };
    fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(postData)
    }).then((response) => {
      console.log("response", response);
    });
  };
  window.CapacitorBridge.registerLocalNotification = function() {
    LocalNotifications.requestPermissions().then((result) => {
      console.log("requestPermissions!");
      if (result.display === "granted")
        ;
    });
  };
  window.CapacitorBridge.sendTestLocalNotification = function() {
    LocalNotifications.schedule({
      notifications: [
        {
          title: "訊息",
          body: "測試1秒後app本地推播",
          id: 1,
          // Scheduled time must be *after* current time
          schedule: { at: new Date(Date.now() + 1e3) },
          sound: "",
          attachments: [],
          actionTypeId: "",
          extra: ""
        }
      ]
    });
  };
  window.CapacitorBridge.registerWebsocket = function() {
    var wsUri = "wss://socketsbay.com/wss/v2/1/demo/";
    var websocket;
    function init() {
      testWebSocket();
    }
    function testWebSocket() {
      websocket = new WebSocket(wsUri);
      websocket.onopen = function(evt) {
        onOpen();
      };
      websocket.onclose = function(evt) {
        onClose();
      };
      websocket.onmessage = function(evt) {
        onMessage(evt);
      };
      websocket.onerror = function(evt) {
        onError(evt);
      };
    }
    function onOpen(evt) {
      sendMessage("Hello world");
      console.log(`Websocket CONNECTED`);
    }
    function onClose(evt) {
      console.log(`Websocket DISCONNECTED`);
    }
    function onMessage(evt) {
      console.log(`RESPONSE: ${evt.data}`);
      LocalNotifications.schedule({
        notifications: [
          {
            title: "訊息",
            body: evt.data,
            id: 1,
            // Scheduled time must be *after* current time
            schedule: { at: new Date(Date.now() + 1e3) },
            sound: "",
            attachments: [],
            actionTypeId: "",
            extra: ""
          }
        ]
      });
    }
    function onError(evt) {
      console.log(`ERROR: ${evt.data}`);
    }
    function sendMessage(message) {
      websocket.send(message);
    }
    window.CapacitorBridge.registerWebsocket.socketSendMessage = sendMessage;
    init();
  };
  window.CapacitorBridge.takePicture = async () => {
    const image = await Camera$1.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });
    image.webPath;
  };
  window.CapacitorBridge.showPrompt = async () => {
    const { value, cancelled } = await window.Capacitor.Plugins.Dialog.prompt({
      title: "訊息",
      message: `確定刪除訊息?`,
      okButtonTitle: "確定",
      cancelButtonTitle: "取消"
    });
    console.log("Name:", value);
    console.log("Cancelled:", cancelled);
  };
  window.CapacitorBridge.openCapacitorSite = async () => {
    await Browser$1.open({ url: "http://capacitorjs.com/" });
  };
  window.CapacitorBridge.logDeviceInfo = async () => {
    const idObj = await Device.getId();
    Dialog.alert({
      title: "訊息",
      message: `app ID: ${idObj.identifier}`
    });
  };
  window.CapacitorBridge.requestFilesystemPermission = async () => {
    await Filesystem.requestPermissions();
  };
  window.CapacitorBridge.writeFile = async (config) => {
    const status = await Filesystem.requestPermissions();
    Dialog.alert({
      title: "訊息",
      message: `請開啟檔案存取權限!: ${status.publicStorage}`
    });
    if (status.publicStorage === "granted") {
      await Filesystem.writeFile({
        ...config,
        directory: Directory.Documents,
        encoding: Encoding.UTF8
      });
    } else {
      Dialog.alert({
        title: "訊息",
        message: `請開啟檔案存取權限!`
      });
    }
  };
  window.CapacitorBridge.printCurrentPosition = async () => {
    const coordinates = await Geolocation$1.getCurrentPosition();
    Dialog.alert({
      title: "訊息",
      message: `lat: ${coordinates.coords.latitude}, 
    lng: ${coordinates.coords.longitude}`
    });
  };
  window.CapacitorBridge.hapticsVibrate = async () => {
    await Haptics.vibrate();
  };
  window.CapacitorBridge.lockOrientation = async () => {
    await ScreenOrientation.lock({
      orientation: "landscape"
    });
  };
  window.CapacitorBridge.shareUrl = async () => {
    await Share.share({
      url: "http://ionicframework.com/"
    });
  };
  window.CapacitorBridge.shareText = async () => {
    await Share.share({
      text: "Really awesome thing you need to see right meow"
    });
  };
  window.CapacitorBridge.showSplashScreen = async () => {
    await SplashScreen.show({
      showDuration: 2e3,
      autoHide: true
    });
  };
  window.CapacitorBridge.hideStatusBar = async () => {
    await StatusBar.hide();
  };
  window.CapacitorBridge.showStatusBar = async () => {
    await StatusBar.show();
  };
  window.CapacitorBridge.showHelloToast = async () => {
    await Toast.show({
      text: "測試Toast!",
      position: "center"
    });
  };
  window.CapacitorBridge.openFbApp = async () => {
    await AppLauncher.openUrl({ url: "fb://facewebmodal/f?href=https://www.facebook.com/" });
  };
  Keyboard.addListener("keyboardDidShow", (info) => {
    Dialog.alert({
      title: "訊息",
      message: `鍵盤已顯示，鍵盤高度為: ${info.keyboardHeight}`
    });
  });
  class AppWeb extends WebPlugin {
    constructor() {
      super();
      this.handleVisibilityChange = () => {
        const data = {
          isActive: document.hidden !== true
        };
        this.notifyListeners("appStateChange", data);
        if (document.hidden) {
          this.notifyListeners("pause", null);
        } else {
          this.notifyListeners("resume", null);
        }
      };
      document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
    }
    exitApp() {
      throw this.unimplemented("Not implemented on web.");
    }
    async getInfo() {
      throw this.unimplemented("Not implemented on web.");
    }
    async getLaunchUrl() {
      return { url: "" };
    }
    async getState() {
      return { isActive: document.hidden !== true };
    }
    async minimizeApp() {
      throw this.unimplemented("Not implemented on web.");
    }
  }
  const web$d = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    AppWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class CameraWeb extends WebPlugin {
    async getPhoto(options) {
      return new Promise(async (resolve2, reject) => {
        if (options.webUseInput || options.source === CameraSource.Photos) {
          this.fileInputExperience(options, resolve2);
        } else if (options.source === CameraSource.Prompt) {
          let actionSheet = document.querySelector("pwa-action-sheet");
          if (!actionSheet) {
            actionSheet = document.createElement("pwa-action-sheet");
            document.body.appendChild(actionSheet);
          }
          actionSheet.header = options.promptLabelHeader || "Photo";
          actionSheet.cancelable = false;
          actionSheet.options = [
            { title: options.promptLabelPhoto || "From Photos" },
            { title: options.promptLabelPicture || "Take Picture" }
          ];
          actionSheet.addEventListener("onSelection", async (e) => {
            const selection = e.detail;
            if (selection === 0) {
              this.fileInputExperience(options, resolve2);
            } else {
              this.cameraExperience(options, resolve2, reject);
            }
          });
        } else {
          this.cameraExperience(options, resolve2, reject);
        }
      });
    }
    async pickImages(_options) {
      return new Promise(async (resolve2) => {
        this.multipleFileInputExperience(resolve2);
      });
    }
    async cameraExperience(options, resolve2, reject) {
      if (customElements.get("pwa-camera-modal")) {
        const cameraModal = document.createElement("pwa-camera-modal");
        cameraModal.facingMode = options.direction === CameraDirection.Front ? "user" : "environment";
        document.body.appendChild(cameraModal);
        try {
          await cameraModal.componentOnReady();
          cameraModal.addEventListener("onPhoto", async (e) => {
            const photo = e.detail;
            if (photo === null) {
              reject(new CapacitorException("User cancelled photos app"));
            } else if (photo instanceof Error) {
              reject(photo);
            } else {
              resolve2(await this._getCameraPhoto(photo, options));
            }
            cameraModal.dismiss();
            document.body.removeChild(cameraModal);
          });
          cameraModal.present();
        } catch (e) {
          this.fileInputExperience(options, resolve2);
        }
      } else {
        console.error(`Unable to load PWA Element 'pwa-camera-modal'. See the docs: https://capacitorjs.com/docs/web/pwa-elements.`);
        this.fileInputExperience(options, resolve2);
      }
    }
    fileInputExperience(options, resolve2) {
      let input = document.querySelector("#_capacitor-camera-input");
      const cleanup = () => {
        var _a;
        (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(input);
      };
      if (!input) {
        input = document.createElement("input");
        input.id = "_capacitor-camera-input";
        input.type = "file";
        input.hidden = true;
        document.body.appendChild(input);
        input.addEventListener("change", (_e) => {
          const file = input.files[0];
          let format = "jpeg";
          if (file.type === "image/png") {
            format = "png";
          } else if (file.type === "image/gif") {
            format = "gif";
          }
          if (options.resultType === "dataUrl" || options.resultType === "base64") {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
              if (options.resultType === "dataUrl") {
                resolve2({
                  dataUrl: reader.result,
                  format
                });
              } else if (options.resultType === "base64") {
                const b64 = reader.result.split(",")[1];
                resolve2({
                  base64String: b64,
                  format
                });
              }
              cleanup();
            });
            reader.readAsDataURL(file);
          } else {
            resolve2({
              webPath: URL.createObjectURL(file),
              format
            });
            cleanup();
          }
        });
      }
      input.accept = "image/*";
      input.capture = true;
      if (options.source === CameraSource.Photos || options.source === CameraSource.Prompt) {
        input.removeAttribute("capture");
      } else if (options.direction === CameraDirection.Front) {
        input.capture = "user";
      } else if (options.direction === CameraDirection.Rear) {
        input.capture = "environment";
      }
      input.click();
    }
    multipleFileInputExperience(resolve2) {
      let input = document.querySelector("#_capacitor-camera-input-multiple");
      const cleanup = () => {
        var _a;
        (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(input);
      };
      if (!input) {
        input = document.createElement("input");
        input.id = "_capacitor-camera-input-multiple";
        input.type = "file";
        input.hidden = true;
        input.multiple = true;
        document.body.appendChild(input);
        input.addEventListener("change", (_e) => {
          const photos = [];
          for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            let format = "jpeg";
            if (file.type === "image/png") {
              format = "png";
            } else if (file.type === "image/gif") {
              format = "gif";
            }
            photos.push({
              webPath: URL.createObjectURL(file),
              format
            });
          }
          resolve2({ photos });
          cleanup();
        });
      }
      input.accept = "image/*";
      input.click();
    }
    _getCameraPhoto(photo, options) {
      return new Promise((resolve2, reject) => {
        const reader = new FileReader();
        const format = photo.type.split("/")[1];
        if (options.resultType === "uri") {
          resolve2({
            webPath: URL.createObjectURL(photo),
            format,
            saved: false
          });
        } else {
          reader.readAsDataURL(photo);
          reader.onloadend = () => {
            const r = reader.result;
            if (options.resultType === "dataUrl") {
              resolve2({
                dataUrl: r,
                format,
                saved: false
              });
            } else {
              resolve2({
                base64String: r.split(",")[1],
                format,
                saved: false
              });
            }
          };
          reader.onerror = (e) => {
            reject(e);
          };
        }
      });
    }
    async checkPermissions() {
      if (typeof navigator === "undefined" || !navigator.permissions) {
        throw this.unavailable("Permissions API not available in this browser");
      }
      try {
        const permission = await window.navigator.permissions.query({
          name: "camera"
        });
        return {
          camera: permission.state,
          photos: "granted"
        };
      } catch (_a) {
        throw this.unavailable("Camera permissions are not available in this browser");
      }
    }
    async requestPermissions() {
      throw this.unimplemented("Not implemented on web.");
    }
    async pickLimitedLibraryPhotos() {
      throw this.unavailable("Not implemented on web.");
    }
    async getLimitedLibraryPhotos() {
      throw this.unavailable("Not implemented on web.");
    }
  }
  const Camera = new CameraWeb();
  const web$c = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    Camera,
    CameraWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class DialogWeb extends WebPlugin {
    async alert(options) {
      window.alert(options.message);
    }
    async prompt(options) {
      const val = window.prompt(options.message, options.inputText || "");
      return {
        value: val !== null ? val : "",
        cancelled: val === null
      };
    }
    async confirm(options) {
      const val = window.confirm(options.message);
      return {
        value: val
      };
    }
  }
  const web$b = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    DialogWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class BrowserWeb extends WebPlugin {
    constructor() {
      super();
      this._lastWindow = null;
    }
    async open(options) {
      this._lastWindow = window.open(options.url, options.windowName || "_blank");
    }
    async close() {
      return new Promise((resolve2, reject) => {
        if (this._lastWindow != null) {
          this._lastWindow.close();
          this._lastWindow = null;
          resolve2();
        } else {
          reject("No active window to close!");
        }
      });
    }
  }
  const Browser = new BrowserWeb();
  const web$a = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    Browser,
    BrowserWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class DeviceWeb extends WebPlugin {
    async getId() {
      return {
        identifier: this.getUid()
      };
    }
    async getInfo() {
      if (typeof navigator === "undefined" || !navigator.userAgent) {
        throw this.unavailable("Device API not available in this browser");
      }
      const ua = navigator.userAgent;
      const uaFields = this.parseUa(ua);
      return {
        model: uaFields.model,
        platform: "web",
        operatingSystem: uaFields.operatingSystem,
        osVersion: uaFields.osVersion,
        manufacturer: navigator.vendor,
        isVirtual: false,
        webViewVersion: uaFields.browserVersion
      };
    }
    async getBatteryInfo() {
      if (typeof navigator === "undefined" || !navigator.getBattery) {
        throw this.unavailable("Device API not available in this browser");
      }
      let battery = {};
      try {
        battery = await navigator.getBattery();
      } catch (e) {
      }
      return {
        batteryLevel: battery.level,
        isCharging: battery.charging
      };
    }
    async getLanguageCode() {
      return {
        value: navigator.language.split("-")[0].toLowerCase()
      };
    }
    async getLanguageTag() {
      return {
        value: navigator.language
      };
    }
    parseUa(ua) {
      const uaFields = {};
      const start = ua.indexOf("(") + 1;
      let end = ua.indexOf(") AppleWebKit");
      if (ua.indexOf(") Gecko") !== -1) {
        end = ua.indexOf(") Gecko");
      }
      const fields = ua.substring(start, end);
      if (ua.indexOf("Android") !== -1) {
        const tmpFields = fields.replace("; wv", "").split("; ").pop();
        if (tmpFields) {
          uaFields.model = tmpFields.split(" Build")[0];
        }
        uaFields.osVersion = fields.split("; ")[1];
      } else {
        uaFields.model = fields.split("; ")[0];
        if (typeof navigator !== "undefined" && navigator.oscpu) {
          uaFields.osVersion = navigator.oscpu;
        } else {
          if (ua.indexOf("Windows") !== -1) {
            uaFields.osVersion = fields;
          } else {
            const tmpFields = fields.split("; ").pop();
            if (tmpFields) {
              const lastParts = tmpFields.replace(" like Mac OS X", "").split(" ");
              uaFields.osVersion = lastParts[lastParts.length - 1].replace(/_/g, ".");
            }
          }
        }
      }
      if (/android/i.test(ua)) {
        uaFields.operatingSystem = "android";
      } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        uaFields.operatingSystem = "ios";
      } else if (/Win/.test(ua)) {
        uaFields.operatingSystem = "windows";
      } else if (/Mac/i.test(ua)) {
        uaFields.operatingSystem = "mac";
      } else {
        uaFields.operatingSystem = "unknown";
      }
      const isSafari = !!window.ApplePaySession;
      const isChrome = !!window.chrome;
      const isFirefox = /Firefox/.test(ua);
      const isEdge = /Edg/.test(ua);
      const isFirefoxIOS = /FxiOS/.test(ua);
      const isChromeIOS = /CriOS/.test(ua);
      const isEdgeIOS = /EdgiOS/.test(ua);
      if (isSafari || isChrome && !isEdge || isFirefoxIOS || isChromeIOS || isEdgeIOS) {
        let searchWord;
        if (isFirefoxIOS) {
          searchWord = "FxiOS";
        } else if (isChromeIOS) {
          searchWord = "CriOS";
        } else if (isEdgeIOS) {
          searchWord = "EdgiOS";
        } else if (isSafari) {
          searchWord = "Version";
        } else {
          searchWord = "Chrome";
        }
        const words = ua.split(" ");
        for (const word of words) {
          if (word.includes(searchWord)) {
            const version = word.split("/")[1];
            uaFields.browserVersion = version;
          }
        }
      } else if (isFirefox || isEdge) {
        const reverseUA = ua.split("").reverse().join("");
        const reverseVersion = reverseUA.split("/")[0];
        const version = reverseVersion.split("").reverse().join("");
        uaFields.browserVersion = version;
      }
      return uaFields;
    }
    getUid() {
      if (typeof window !== "undefined" && window.localStorage) {
        let uid = window.localStorage.getItem("_capuid");
        if (uid) {
          return uid;
        }
        uid = this.uuid4();
        window.localStorage.setItem("_capuid", uid);
        return uid;
      }
      return this.uuid4();
    }
    uuid4() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    }
  }
  const web$9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    DeviceWeb
  }, Symbol.toStringTag, { value: "Module" }));
  function resolve(path) {
    const posix = path.split("/").filter((item) => item !== ".");
    const newPosix = [];
    posix.forEach((item) => {
      if (item === ".." && newPosix.length > 0 && newPosix[newPosix.length - 1] !== "..") {
        newPosix.pop();
      } else {
        newPosix.push(item);
      }
    });
    return newPosix.join("/");
  }
  function isPathParent(parent, children) {
    parent = resolve(parent);
    children = resolve(children);
    const pathsA = parent.split("/");
    const pathsB = children.split("/");
    return parent !== children && pathsA.every((value, index) => value === pathsB[index]);
  }
  class FilesystemWeb extends WebPlugin {
    constructor() {
      super(...arguments);
      this.DB_VERSION = 1;
      this.DB_NAME = "Disc";
      this._writeCmds = ["add", "put", "delete"];
      this.downloadFile = async (options) => {
        var _a, _b;
        const requestInit = buildRequestInit(options, options.webFetchExtra);
        const response = await fetch(options.url, requestInit);
        let blob;
        if (!options.progress)
          blob = await response.blob();
        else if (!(response === null || response === void 0 ? void 0 : response.body))
          blob = new Blob();
        else {
          const reader = response.body.getReader();
          let bytes = 0;
          const chunks = [];
          const contentType = response.headers.get("content-type");
          const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
          while (true) {
            const { done, value } = await reader.read();
            if (done)
              break;
            chunks.push(value);
            bytes += (value === null || value === void 0 ? void 0 : value.length) || 0;
            const status = {
              url: options.url,
              bytes,
              contentLength
            };
            this.notifyListeners("progress", status);
          }
          const allChunks = new Uint8Array(bytes);
          let position = 0;
          for (const chunk of chunks) {
            if (typeof chunk === "undefined")
              continue;
            allChunks.set(chunk, position);
            position += chunk.length;
          }
          blob = new Blob([allChunks.buffer], { type: contentType || void 0 });
        }
        const result = await this.writeFile({
          path: options.path,
          directory: (_a = options.directory) !== null && _a !== void 0 ? _a : void 0,
          recursive: (_b = options.recursive) !== null && _b !== void 0 ? _b : false,
          data: blob
        });
        return { path: result.uri, blob };
      };
    }
    async initDb() {
      if (this._db !== void 0) {
        return this._db;
      }
      if (!("indexedDB" in window)) {
        throw this.unavailable("This browser doesn't support IndexedDB");
      }
      return new Promise((resolve2, reject) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
        request.onupgradeneeded = FilesystemWeb.doUpgrade;
        request.onsuccess = () => {
          this._db = request.result;
          resolve2(request.result);
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
          console.warn("db blocked");
        };
      });
    }
    static doUpgrade(event) {
      const eventTarget = event.target;
      const db = eventTarget.result;
      switch (event.oldVersion) {
        case 0:
        case 1:
        default: {
          if (db.objectStoreNames.contains("FileStorage")) {
            db.deleteObjectStore("FileStorage");
          }
          const store = db.createObjectStore("FileStorage", { keyPath: "path" });
          store.createIndex("by_folder", "folder");
        }
      }
    }
    async dbRequest(cmd, args) {
      const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
      return this.initDb().then((conn) => {
        return new Promise((resolve2, reject) => {
          const tx = conn.transaction(["FileStorage"], readFlag);
          const store = tx.objectStore("FileStorage");
          const req = store[cmd](...args);
          req.onsuccess = () => resolve2(req.result);
          req.onerror = () => reject(req.error);
        });
      });
    }
    async dbIndexRequest(indexName, cmd, args) {
      const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
      return this.initDb().then((conn) => {
        return new Promise((resolve2, reject) => {
          const tx = conn.transaction(["FileStorage"], readFlag);
          const store = tx.objectStore("FileStorage");
          const index = store.index(indexName);
          const req = index[cmd](...args);
          req.onsuccess = () => resolve2(req.result);
          req.onerror = () => reject(req.error);
        });
      });
    }
    getPath(directory, uriPath) {
      const cleanedUriPath = uriPath !== void 0 ? uriPath.replace(/^[/]+|[/]+$/g, "") : "";
      let fsPath = "";
      if (directory !== void 0)
        fsPath += "/" + directory;
      if (uriPath !== "")
        fsPath += "/" + cleanedUriPath;
      return fsPath;
    }
    async clear() {
      const conn = await this.initDb();
      const tx = conn.transaction(["FileStorage"], "readwrite");
      const store = tx.objectStore("FileStorage");
      store.clear();
    }
    /**
     * Read a file from disk
     * @param options options for the file read
     * @return a promise that resolves with the read file data result
     */
    async readFile(options) {
      const path = this.getPath(options.directory, options.path);
      const entry = await this.dbRequest("get", [path]);
      if (entry === void 0)
        throw Error("File does not exist.");
      return { data: entry.content ? entry.content : "" };
    }
    /**
     * Write a file to disk in the specified location on device
     * @param options options for the file write
     * @return a promise that resolves with the file write result
     */
    async writeFile(options) {
      const path = this.getPath(options.directory, options.path);
      let data = options.data;
      const encoding = options.encoding;
      const doRecursive = options.recursive;
      const occupiedEntry = await this.dbRequest("get", [path]);
      if (occupiedEntry && occupiedEntry.type === "directory")
        throw Error("The supplied path is a directory.");
      const parentPath = path.substr(0, path.lastIndexOf("/"));
      const parentEntry = await this.dbRequest("get", [parentPath]);
      if (parentEntry === void 0) {
        const subDirIndex = parentPath.indexOf("/", 1);
        if (subDirIndex !== -1) {
          const parentArgPath = parentPath.substr(subDirIndex);
          await this.mkdir({
            path: parentArgPath,
            directory: options.directory,
            recursive: doRecursive
          });
        }
      }
      if (!encoding && !(data instanceof Blob)) {
        data = data.indexOf(",") >= 0 ? data.split(",")[1] : data;
        if (!this.isBase64String(data))
          throw Error("The supplied data is not valid base64 content.");
      }
      const now = Date.now();
      const pathObj = {
        path,
        folder: parentPath,
        type: "file",
        size: data instanceof Blob ? data.size : data.length,
        ctime: now,
        mtime: now,
        content: data
      };
      await this.dbRequest("put", [pathObj]);
      return {
        uri: pathObj.path
      };
    }
    /**
     * Append to a file on disk in the specified location on device
     * @param options options for the file append
     * @return a promise that resolves with the file write result
     */
    async appendFile(options) {
      const path = this.getPath(options.directory, options.path);
      let data = options.data;
      const encoding = options.encoding;
      const parentPath = path.substr(0, path.lastIndexOf("/"));
      const now = Date.now();
      let ctime = now;
      const occupiedEntry = await this.dbRequest("get", [path]);
      if (occupiedEntry && occupiedEntry.type === "directory")
        throw Error("The supplied path is a directory.");
      const parentEntry = await this.dbRequest("get", [parentPath]);
      if (parentEntry === void 0) {
        const subDirIndex = parentPath.indexOf("/", 1);
        if (subDirIndex !== -1) {
          const parentArgPath = parentPath.substr(subDirIndex);
          await this.mkdir({
            path: parentArgPath,
            directory: options.directory,
            recursive: true
          });
        }
      }
      if (!encoding && !this.isBase64String(data))
        throw Error("The supplied data is not valid base64 content.");
      if (occupiedEntry !== void 0) {
        if (occupiedEntry.content instanceof Blob) {
          throw Error("The occupied entry contains a Blob object which cannot be appended to.");
        }
        if (occupiedEntry.content !== void 0 && !encoding) {
          data = btoa(atob(occupiedEntry.content) + atob(data));
        } else {
          data = occupiedEntry.content + data;
        }
        ctime = occupiedEntry.ctime;
      }
      const pathObj = {
        path,
        folder: parentPath,
        type: "file",
        size: data.length,
        ctime,
        mtime: now,
        content: data
      };
      await this.dbRequest("put", [pathObj]);
    }
    /**
     * Delete a file from disk
     * @param options options for the file delete
     * @return a promise that resolves with the deleted file data result
     */
    async deleteFile(options) {
      const path = this.getPath(options.directory, options.path);
      const entry = await this.dbRequest("get", [path]);
      if (entry === void 0)
        throw Error("File does not exist.");
      const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [
        IDBKeyRange.only(path)
      ]);
      if (entries.length !== 0)
        throw Error("Folder is not empty.");
      await this.dbRequest("delete", [path]);
    }
    /**
     * Create a directory.
     * @param options options for the mkdir
     * @return a promise that resolves with the mkdir result
     */
    async mkdir(options) {
      const path = this.getPath(options.directory, options.path);
      const doRecursive = options.recursive;
      const parentPath = path.substr(0, path.lastIndexOf("/"));
      const depth = (path.match(/\//g) || []).length;
      const parentEntry = await this.dbRequest("get", [parentPath]);
      const occupiedEntry = await this.dbRequest("get", [path]);
      if (depth === 1)
        throw Error("Cannot create Root directory");
      if (occupiedEntry !== void 0)
        throw Error("Current directory does already exist.");
      if (!doRecursive && depth !== 2 && parentEntry === void 0)
        throw Error("Parent directory must exist");
      if (doRecursive && depth !== 2 && parentEntry === void 0) {
        const parentArgPath = parentPath.substr(parentPath.indexOf("/", 1));
        await this.mkdir({
          path: parentArgPath,
          directory: options.directory,
          recursive: doRecursive
        });
      }
      const now = Date.now();
      const pathObj = {
        path,
        folder: parentPath,
        type: "directory",
        size: 0,
        ctime: now,
        mtime: now
      };
      await this.dbRequest("put", [pathObj]);
    }
    /**
     * Remove a directory
     * @param options the options for the directory remove
     */
    async rmdir(options) {
      const { path, directory, recursive } = options;
      const fullPath = this.getPath(directory, path);
      const entry = await this.dbRequest("get", [fullPath]);
      if (entry === void 0)
        throw Error("Folder does not exist.");
      if (entry.type !== "directory")
        throw Error("Requested path is not a directory");
      const readDirResult = await this.readdir({ path, directory });
      if (readDirResult.files.length !== 0 && !recursive)
        throw Error("Folder is not empty");
      for (const entry2 of readDirResult.files) {
        const entryPath = `${path}/${entry2.name}`;
        const entryObj = await this.stat({ path: entryPath, directory });
        if (entryObj.type === "file") {
          await this.deleteFile({ path: entryPath, directory });
        } else {
          await this.rmdir({ path: entryPath, directory, recursive });
        }
      }
      await this.dbRequest("delete", [fullPath]);
    }
    /**
     * Return a list of files from the directory (not recursive)
     * @param options the options for the readdir operation
     * @return a promise that resolves with the readdir directory listing result
     */
    async readdir(options) {
      const path = this.getPath(options.directory, options.path);
      const entry = await this.dbRequest("get", [path]);
      if (options.path !== "" && entry === void 0)
        throw Error("Folder does not exist.");
      const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [IDBKeyRange.only(path)]);
      const files = await Promise.all(entries.map(async (e) => {
        let subEntry = await this.dbRequest("get", [e]);
        if (subEntry === void 0) {
          subEntry = await this.dbRequest("get", [e + "/"]);
        }
        return {
          name: e.substring(path.length + 1),
          type: subEntry.type,
          size: subEntry.size,
          ctime: subEntry.ctime,
          mtime: subEntry.mtime,
          uri: subEntry.path
        };
      }));
      return { files };
    }
    /**
     * Return full File URI for a path and directory
     * @param options the options for the stat operation
     * @return a promise that resolves with the file stat result
     */
    async getUri(options) {
      const path = this.getPath(options.directory, options.path);
      let entry = await this.dbRequest("get", [path]);
      if (entry === void 0) {
        entry = await this.dbRequest("get", [path + "/"]);
      }
      return {
        uri: (entry === null || entry === void 0 ? void 0 : entry.path) || path
      };
    }
    /**
     * Return data about a file
     * @param options the options for the stat operation
     * @return a promise that resolves with the file stat result
     */
    async stat(options) {
      const path = this.getPath(options.directory, options.path);
      let entry = await this.dbRequest("get", [path]);
      if (entry === void 0) {
        entry = await this.dbRequest("get", [path + "/"]);
      }
      if (entry === void 0)
        throw Error("Entry does not exist.");
      return {
        type: entry.type,
        size: entry.size,
        ctime: entry.ctime,
        mtime: entry.mtime,
        uri: entry.path
      };
    }
    /**
     * Rename a file or directory
     * @param options the options for the rename operation
     * @return a promise that resolves with the rename result
     */
    async rename(options) {
      await this._copy(options, true);
      return;
    }
    /**
     * Copy a file or directory
     * @param options the options for the copy operation
     * @return a promise that resolves with the copy result
     */
    async copy(options) {
      return this._copy(options, false);
    }
    async requestPermissions() {
      return { publicStorage: "granted" };
    }
    async checkPermissions() {
      return { publicStorage: "granted" };
    }
    /**
     * Function that can perform a copy or a rename
     * @param options the options for the rename operation
     * @param doRename whether to perform a rename or copy operation
     * @return a promise that resolves with the result
     */
    async _copy(options, doRename = false) {
      let { toDirectory } = options;
      const { to, from, directory: fromDirectory } = options;
      if (!to || !from) {
        throw Error("Both to and from must be provided");
      }
      if (!toDirectory) {
        toDirectory = fromDirectory;
      }
      const fromPath = this.getPath(fromDirectory, from);
      const toPath = this.getPath(toDirectory, to);
      if (fromPath === toPath) {
        return {
          uri: toPath
        };
      }
      if (isPathParent(fromPath, toPath)) {
        throw Error("To path cannot contain the from path");
      }
      let toObj;
      try {
        toObj = await this.stat({
          path: to,
          directory: toDirectory
        });
      } catch (e) {
        const toPathComponents = to.split("/");
        toPathComponents.pop();
        const toPath2 = toPathComponents.join("/");
        if (toPathComponents.length > 0) {
          const toParentDirectory = await this.stat({
            path: toPath2,
            directory: toDirectory
          });
          if (toParentDirectory.type !== "directory") {
            throw new Error("Parent directory of the to path is a file");
          }
        }
      }
      if (toObj && toObj.type === "directory") {
        throw new Error("Cannot overwrite a directory with a file");
      }
      const fromObj = await this.stat({
        path: from,
        directory: fromDirectory
      });
      const updateTime = async (path, ctime2, mtime) => {
        const fullPath = this.getPath(toDirectory, path);
        const entry = await this.dbRequest("get", [fullPath]);
        entry.ctime = ctime2;
        entry.mtime = mtime;
        await this.dbRequest("put", [entry]);
      };
      const ctime = fromObj.ctime ? fromObj.ctime : Date.now();
      switch (fromObj.type) {
        case "file": {
          const file = await this.readFile({
            path: from,
            directory: fromDirectory
          });
          if (doRename) {
            await this.deleteFile({
              path: from,
              directory: fromDirectory
            });
          }
          let encoding;
          if (!(file.data instanceof Blob) && !this.isBase64String(file.data)) {
            encoding = Encoding.UTF8;
          }
          const writeResult = await this.writeFile({
            path: to,
            directory: toDirectory,
            data: file.data,
            encoding
          });
          if (doRename) {
            await updateTime(to, ctime, fromObj.mtime);
          }
          return writeResult;
        }
        case "directory": {
          if (toObj) {
            throw Error("Cannot move a directory over an existing object");
          }
          try {
            await this.mkdir({
              path: to,
              directory: toDirectory,
              recursive: false
            });
            if (doRename) {
              await updateTime(to, ctime, fromObj.mtime);
            }
          } catch (e) {
          }
          const contents = (await this.readdir({
            path: from,
            directory: fromDirectory
          })).files;
          for (const filename of contents) {
            await this._copy({
              from: `${from}/${filename.name}`,
              to: `${to}/${filename.name}`,
              directory: fromDirectory,
              toDirectory
            }, doRename);
          }
          if (doRename) {
            await this.rmdir({
              path: from,
              directory: fromDirectory
            });
          }
        }
      }
      return {
        uri: toPath
      };
    }
    isBase64String(str) {
      try {
        return btoa(atob(str)) == str;
      } catch (err) {
        return false;
      }
    }
  }
  FilesystemWeb._debug = true;
  const web$8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    FilesystemWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class GeolocationWeb extends WebPlugin {
    async getCurrentPosition(options) {
      return new Promise((resolve2, reject) => {
        navigator.geolocation.getCurrentPosition((pos) => {
          resolve2(pos);
        }, (err) => {
          reject(err);
        }, Object.assign({ enableHighAccuracy: false, timeout: 1e4, maximumAge: 0 }, options));
      });
    }
    async watchPosition(options, callback) {
      const id = navigator.geolocation.watchPosition((pos) => {
        callback(pos);
      }, (err) => {
        callback(null, err);
      }, Object.assign({ enableHighAccuracy: false, timeout: 1e4, maximumAge: 0 }, options));
      return `${id}`;
    }
    async clearWatch(options) {
      window.navigator.geolocation.clearWatch(parseInt(options.id, 10));
    }
    async checkPermissions() {
      if (typeof navigator === "undefined" || !navigator.permissions) {
        throw this.unavailable("Permissions API not available in this browser");
      }
      const permission = await window.navigator.permissions.query({
        name: "geolocation"
      });
      return { location: permission.state, coarseLocation: permission.state };
    }
    async requestPermissions() {
      throw this.unimplemented("Not implemented on web.");
    }
  }
  const Geolocation = new GeolocationWeb();
  const web$7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    Geolocation,
    GeolocationWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class HapticsWeb extends WebPlugin {
    constructor() {
      super(...arguments);
      this.selectionStarted = false;
    }
    async impact(options) {
      const pattern = this.patternForImpact(options === null || options === void 0 ? void 0 : options.style);
      this.vibrateWithPattern(pattern);
    }
    async notification(options) {
      const pattern = this.patternForNotification(options === null || options === void 0 ? void 0 : options.type);
      this.vibrateWithPattern(pattern);
    }
    async vibrate(options) {
      const duration = (options === null || options === void 0 ? void 0 : options.duration) || 300;
      this.vibrateWithPattern([duration]);
    }
    async selectionStart() {
      this.selectionStarted = true;
    }
    async selectionChanged() {
      if (this.selectionStarted) {
        this.vibrateWithPattern([70]);
      }
    }
    async selectionEnd() {
      this.selectionStarted = false;
    }
    patternForImpact(style = ImpactStyle.Heavy) {
      if (style === ImpactStyle.Medium) {
        return [43];
      } else if (style === ImpactStyle.Light) {
        return [20];
      }
      return [61];
    }
    patternForNotification(type = NotificationType.Success) {
      if (type === NotificationType.Warning) {
        return [30, 40, 30, 50, 60];
      } else if (type === NotificationType.Error) {
        return [27, 45, 50];
      }
      return [35, 65, 21];
    }
    vibrateWithPattern(pattern) {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      } else {
        throw this.unavailable("Browser does not support the vibrate API");
      }
    }
  }
  const web$6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    HapticsWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class ScreenOrientationWeb extends WebPlugin {
    constructor() {
      super();
      if (typeof screen !== "undefined" && typeof screen.orientation !== "undefined") {
        screen.orientation.addEventListener("change", () => {
          const type = screen.orientation.type;
          this.notifyListeners("screenOrientationChange", { type });
        });
      }
    }
    async orientation() {
      if (typeof screen === "undefined" || !screen.orientation) {
        throw this.unavailable("ScreenOrientation API not available in this browser");
      }
      return { type: screen.orientation.type };
    }
    async lock(options) {
      if (typeof screen === "undefined" || !screen.orientation || !screen.orientation.lock) {
        throw this.unavailable("ScreenOrientation API not available in this browser");
      }
      try {
        await screen.orientation.lock(options.orientation);
      } catch (_a) {
        throw this.unavailable("ScreenOrientation API not available in this browser");
      }
    }
    async unlock() {
      if (typeof screen === "undefined" || !screen.orientation || !screen.orientation.unlock) {
        throw this.unavailable("ScreenOrientation API not available in this browser");
      }
      try {
        screen.orientation.unlock();
      } catch (_a) {
        throw this.unavailable("ScreenOrientation API not available in this browser");
      }
    }
  }
  const web$5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ScreenOrientationWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class ShareWeb extends WebPlugin {
    async canShare() {
      if (typeof navigator === "undefined" || !navigator.share) {
        return { value: false };
      } else {
        return { value: true };
      }
    }
    async share(options) {
      if (typeof navigator === "undefined" || !navigator.share) {
        throw this.unavailable("Share API not available in this browser");
      }
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url
      });
      return {};
    }
  }
  const web$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ShareWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class SplashScreenWeb extends WebPlugin {
    async show(_options) {
      return void 0;
    }
    async hide(_options) {
      return void 0;
    }
  }
  const web$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    SplashScreenWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class ToastWeb extends WebPlugin {
    async show(options) {
      if (typeof document !== "undefined") {
        let duration = 2e3;
        if (options.duration) {
          duration = options.duration === "long" ? 3500 : 2e3;
        }
        const toast = document.createElement("pwa-toast");
        toast.duration = duration;
        toast.message = options.text;
        document.body.appendChild(toast);
      }
    }
  }
  const web$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    ToastWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class AppLauncherWeb extends WebPlugin {
    async canOpenUrl(_options) {
      return { value: true };
    }
    async openUrl(options) {
      window.open(options.url, "_blank");
      return { completed: true };
    }
  }
  const web$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    AppLauncherWeb
  }, Symbol.toStringTag, { value: "Module" }));
  class LocalNotificationsWeb extends WebPlugin {
    constructor() {
      super(...arguments);
      this.pending = [];
      this.deliveredNotifications = [];
      this.hasNotificationSupport = () => {
        if (!("Notification" in window) || !Notification.requestPermission) {
          return false;
        }
        if (Notification.permission !== "granted") {
          try {
            new Notification("");
          } catch (e) {
            if (e.name == "TypeError") {
              return false;
            }
          }
        }
        return true;
      };
    }
    async getDeliveredNotifications() {
      const deliveredSchemas = [];
      for (const notification of this.deliveredNotifications) {
        const deliveredSchema = {
          title: notification.title,
          id: parseInt(notification.tag),
          body: notification.body
        };
        deliveredSchemas.push(deliveredSchema);
      }
      return {
        notifications: deliveredSchemas
      };
    }
    async removeDeliveredNotifications(delivered) {
      for (const toRemove of delivered.notifications) {
        const found = this.deliveredNotifications.find((n) => n.tag === String(toRemove.id));
        found === null || found === void 0 ? void 0 : found.close();
        this.deliveredNotifications = this.deliveredNotifications.filter(() => !found);
      }
    }
    async removeAllDeliveredNotifications() {
      for (const notification of this.deliveredNotifications) {
        notification.close();
      }
      this.deliveredNotifications = [];
    }
    async createChannel() {
      throw this.unimplemented("Not implemented on web.");
    }
    async deleteChannel() {
      throw this.unimplemented("Not implemented on web.");
    }
    async listChannels() {
      throw this.unimplemented("Not implemented on web.");
    }
    async schedule(options) {
      if (!this.hasNotificationSupport()) {
        throw this.unavailable("Notifications not supported in this browser.");
      }
      for (const notification of options.notifications) {
        this.sendNotification(notification);
      }
      return {
        notifications: options.notifications.map((notification) => ({
          id: notification.id
        }))
      };
    }
    async getPending() {
      return {
        notifications: this.pending
      };
    }
    async registerActionTypes() {
      throw this.unimplemented("Not implemented on web.");
    }
    async cancel(pending) {
      this.pending = this.pending.filter((notification) => !pending.notifications.find((n) => n.id === notification.id));
    }
    async areEnabled() {
      const { display } = await this.checkPermissions();
      return {
        value: display === "granted"
      };
    }
    async requestPermissions() {
      if (!this.hasNotificationSupport()) {
        throw this.unavailable("Notifications not supported in this browser.");
      }
      const display = this.transformNotificationPermission(await Notification.requestPermission());
      return { display };
    }
    async checkPermissions() {
      if (!this.hasNotificationSupport()) {
        throw this.unavailable("Notifications not supported in this browser.");
      }
      const display = this.transformNotificationPermission(Notification.permission);
      return { display };
    }
    transformNotificationPermission(permission) {
      switch (permission) {
        case "granted":
          return "granted";
        case "denied":
          return "denied";
        default:
          return "prompt";
      }
    }
    sendPending() {
      var _a;
      const toRemove = [];
      const now = (/* @__PURE__ */ new Date()).getTime();
      for (const notification of this.pending) {
        if (((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) && notification.schedule.at.getTime() <= now) {
          this.buildNotification(notification);
          toRemove.push(notification);
        }
      }
      this.pending = this.pending.filter((notification) => !toRemove.find((n) => n === notification));
    }
    sendNotification(notification) {
      var _a;
      if ((_a = notification.schedule) === null || _a === void 0 ? void 0 : _a.at) {
        const diff = notification.schedule.at.getTime() - (/* @__PURE__ */ new Date()).getTime();
        this.pending.push(notification);
        setTimeout(() => {
          this.sendPending();
        }, diff);
        return;
      }
      this.buildNotification(notification);
    }
    buildNotification(notification) {
      const localNotification = new Notification(notification.title, {
        body: notification.body,
        tag: String(notification.id)
      });
      localNotification.addEventListener("click", this.onClick.bind(this, notification), false);
      localNotification.addEventListener("show", this.onShow.bind(this, notification), false);
      localNotification.addEventListener("close", () => {
        this.deliveredNotifications = this.deliveredNotifications.filter(() => !this);
      }, false);
      this.deliveredNotifications.push(localNotification);
      return localNotification;
    }
    onClick(notification) {
      const data = {
        actionId: "tap",
        notification
      };
      this.notifyListeners("localNotificationActionPerformed", data);
    }
    onShow(notification) {
      this.notifyListeners("localNotificationReceived", notification);
    }
  }
  const web = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    LocalNotificationsWeb
  }, Symbol.toStringTag, { value: "Module" }));
});
