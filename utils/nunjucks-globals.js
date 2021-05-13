function getCategoryName(category, preferedLang) {
  if (typeof category.name === 'string') {
    return category.name;
  }

  if (typeof preferedLang === 'string' && preferedLang in category.name) {
    return category.name[preferedLang];
  }
}

function matchesCategoryName(category, name) {
  name = name.toLowerCase();
  const catName = category.name;

  if (typeof catName === 'string') {
    return catName.toLowerCase() === name;
  }

  return (
    name === catName.eng.toLowerCase() || name === catName.kor.toLowerCase()
  );
}

function getCategory(categories, name) {
  if (!Array.isArray(categories)) {
    throw new TypeError(`${categories}는 배열이 아닙니다.`);
  }
  if (typeof name !== 'string') {
    throw new TypeError(`${name}은 문자열이 아닙니다.`);
  }
  name = name.toLowerCase();
  return categories.filter((sub) => matchesCategoryName(sub, name))[0];
}

function getSubCategories(categories, name) {
  const category = getCategory(categories, name);

  if (category && Array.isArray(category.subCategories)) {
    return category.subCategories;
  }
}

module.exports = {
  getCategoryName,
  matchesCategoryName,
  getCategory,
  getSubCategories
};
