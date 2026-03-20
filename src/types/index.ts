// User Types
export interface IUser {
  id: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserResponse = Omit<IUser, 'password'>;

// Board Types
export interface IBoard {
  id: string;
  name: string;
  description?: string | null ;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Column Types
export interface IColumn {
  id: string;
  name: string;
  position: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Card Types
export interface ICard {
  id: string;
  title: string;
  description?: string | null ;
  position: number;
  columnId: string;
  dueDate?: Date | null ;
  createdAt: Date;
  updatedAt: Date;
}

// Tag Types
export interface ITag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  cardId: string;
  userId: string;
  parentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

// Auth Types
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface IAuthResponse {
  token: string;
  user: UserResponse;
}

// JWT Payload
export interface IJWTPayload {
  userId: string;
  email: string;
}

// Response Types
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
