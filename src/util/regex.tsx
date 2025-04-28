export const checkEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const parseAltText = (
  input: string,
): {rating: string; text: string} | null => {
  const match = input.match(/★([\d.]+)\s-\s[“"](.*)[”"]/);
  if (match) {
    return {
      rating: match[1],
      text: match[2],
    };
  }
  return null;
};

export const checkPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;
  return phoneRegex.test(phone);
};
