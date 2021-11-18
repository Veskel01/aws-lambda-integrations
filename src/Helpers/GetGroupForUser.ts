import additionalFieldsConfig from '../utils/AdditionalFieldsId.config';

const getGroupForUserBasedOnProductID = (
  productID: number,
): { orderType: 'student' | 'roadmap'; groupIdForCustomer: string } => {
  const mentoringProductsID = [2540, 2541, 2542, 1758, 28, 29];

  const { studentsGroupId, roadmapOwnerGroupId } = additionalFieldsConfig;

  if (mentoringProductsID.some((id) => id === productID)) {
    return {
      orderType: 'student',
      groupIdForCustomer: studentsGroupId,
    };
  }

  return {
    orderType: 'roadmap',
    groupIdForCustomer: roadmapOwnerGroupId,
  };
};

export default getGroupForUserBasedOnProductID;
