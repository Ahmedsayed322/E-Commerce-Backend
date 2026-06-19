import bcrypt from 'bcrypt';

export const hash = async (data: string) => {
  return await bcrypt.hash(data, 10);
};
export const compare = async (PT: string, CT: string): Promise<boolean> => {
  return await bcrypt.compare(PT, CT);
};
