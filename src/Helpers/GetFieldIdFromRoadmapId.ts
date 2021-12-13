import productFieldsIdConfig from '../utils/ProductFieldsId.config';
import { ProductsIDS } from './Helpers.types';

// Rozwiązania roadmapy = 1784
// Wszystkie roadmapy z rozwiazaniami = 1783
// Ścieżka rozwoju JS/TS Fundamentals = 1740
// Ścieżka rozwoju React TS = 1741
// Ścieżka rozwoju Backend TS = 1742
// Ścieżka rozwoju Portfolio Builder = 1743

const getFieldIdBasedOnRoadmapID = (
  productID: ProductsIDS,
): string | string[] => {
  const {
    jsTsRoadmapFieldID,
    backendRoadmapFieldID,
    portfolioBuilderRoadmapFieldID,
    reactRoadmapFieldID,
  } = productFieldsIdConfig;

  const allRoadmapIds = [1784, 1783, 1740, 1741, 1742, 1743];

  if (allRoadmapIds.every((id) => id !== productID)) {
    return [];
  }

  switch (productID) {
    case 1783:
      return [
        jsTsRoadmapFieldID,
        backendRoadmapFieldID,
        portfolioBuilderRoadmapFieldID,
        reactRoadmapFieldID,
      ];
    case 1740:
      return jsTsRoadmapFieldID;
    case 1741:
      return reactRoadmapFieldID;
    case 1742:
      return backendRoadmapFieldID;
    case 1743:
      return portfolioBuilderRoadmapFieldID;
  }
};

export default getFieldIdBasedOnRoadmapID;
