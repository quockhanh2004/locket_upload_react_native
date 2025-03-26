const apiMiddleware = () => (next: (arg0: any) => void) => (action: any) => {
  next(action);
};

export default apiMiddleware;
