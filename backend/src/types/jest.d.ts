declare global {
  namespace NodeJS {
    interface Global {
      __mockApp: {
        useGlobalPipes: jest.Mock;
        listen: jest.Mock;
        enableCors: jest.Mock;
        getUrl: jest.Mock;
        [key: string]: any;
      };
    }
  }
}

export {};
