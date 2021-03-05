export const upperNibble = (byte: number): number => (byte & 0xf0) >> 4;

export default upperNibble;
