export type GetProductType = 'roadmap' | 'mentoring' | 'unknown'

const getProductType = (
  productID: number,
): { productType: GetProductType } => {
  const allRoadmapsIds = [1784, 1783, 1740, 1741, 1742, 1743];

  const allMentoringIds = [28, 29, 1758, 2540, 2541, 2542];

  if (allRoadmapsIds.some((id) => id === productID)) {
    return {
      productType: 'roadmap',
    };
  }

  if (allMentoringIds.some((id) => id === productID)) {
    return {
      productType: 'mentoring',
    };
  }

  return {
    productType: 'unknown',
  };
};

export default getProductType;
