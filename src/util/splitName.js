export const splitName = name => {
  let first_name = '';
  let last_name = '';

  if (name.length % 2 === 0) {
    for (let i = 0; i < name.length / 2; i++) {
      first_name += name[i] + ' ';
    }
    for (let i = name.length / 2; i < name.length; i++) {
      last_name += name[i] + ' ';
    }
  } else {
    for (let i = 0; i < Math.floor(name.length / 2); i++) {
      first_name += name[i] + ' ';
    }
    for (let i = Math.floor(name.length / 2); i < name.length; i++) {
      last_name += name[i] + ' ';
    }
  }

  return {
    first_name: first_name.trim(),
    last_name: last_name.trim(),
  };
};
