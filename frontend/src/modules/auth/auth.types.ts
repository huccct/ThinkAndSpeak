export type RegisterRequest = {
  username: string;
  password: string;
};

export type RegisterResponse = {
  code: number;
  message: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  code: number;
  message: string;
  data?: {
    token: string;
  };
};
