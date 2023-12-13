export const validateMonth = (month: number) => month > 0 && month < 13;

export const validateLeadingZero = (numberString: string) => {
  const leadingZero = numberString.startsWith('0');
  if (numberString.length > 2) return false;
  if (!leadingZero) return true;

  const has2Characters = numberString.length === 2;

  const isLessThan10 =
    parseInt(numberString) > 0 && parseInt(numberString) < 10;
  return has2Characters && isLessThan10;
};

export const shouldShowCookieBanner = (req) => {
  try {
    if (req.hasOwnProperty('cookies')) {
      const hasBeenSeen = req.cookies?.cookie_preferences
        ? JSON.parse(req.cookies.cookie_preferences)?.seen
        : null;

      return hasBeenSeen !== true;
    }
  } catch (error) {
    return true;
  }
};
