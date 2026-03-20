declare module 'jsonwebtoken' {
    import { Secret, SignOptions } from 'jsonwebtoken';
    const jwt: any;
    export default jwt;
    export { Secret, SignOptions };
  }